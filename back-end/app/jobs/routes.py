from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.jobs.models import Job
from app.auth.models import User
from app.utils.validators import validate_user_input
from app import socketio
import requests
import logging

logger = logging.getLogger(__name__)

jobs_bp = Blueprint("jobs", __name__)

ADZUNA_APP_ID = "8cd20775"
ADZUNA_APP_KEY = "aefb4374c631a7a66b78b94e89c542ca"
ADZUNA_URL = "https://api.adzuna.com/v1/api/jobs/in/search/1"
RAPIDAPI_HOST = "jsearch.p.rapidapi.com"
RAPIDAPI_URL = f"https://{RAPIDAPI_HOST}/search"

def fetch_adzuna_jobs(keyword, location):
    """Fetch jobs from Adzuna API and parse the response."""
    params = {
        "app_id": ADZUNA_APP_ID,
        "app_key": ADZUNA_APP_KEY,
        "what": keyword,
        "where": location,
        "content-type": "application/json"
    }
    try:
        response = requests.get(ADZUNA_URL, params=params, timeout=10)
        response.raise_for_status()
        results = response.json().get("results", [])
        
        return [{
            "title": r.get("title"),
            "company": r.get("company", {}).get("display_name"),
            "location": r.get("location", {}).get("display_name"),
            "description": r.get("description"),
            "salary_min": r.get("salary_min"),
            "salary_max": r.get("salary_max"),
            "redirect_url": r.get("redirect_url"),
            "posted_by": "Adzuna API"
        } for r in results]
    except Exception as e:
        logger.error(f"Adzuna API error: {e}")
        return []

def fetch_rapidapi_jobs(keyword, location):
    """Fetch jobs from RapidAPI JSearch and normalize fields."""
    import os
    rapidapi_key = os.environ.get("RAPIDAPI_KEY")
    if not rapidapi_key:
        logger.warning("RAPIDAPI_KEY not found in environment variables")
        return []

    headers = {
        "X-RapidAPI-Key": rapidapi_key,
        "X-RapidAPI-Host": RAPIDAPI_HOST
    }
    params = {
        "query": f"{keyword} in {location}",
        "page": "1",
        "num_pages": "2"
    }
    try:
        response = requests.get(RAPIDAPI_URL, headers=headers, params=params, timeout=10)
        response.raise_for_status()
        data = response.json().get("data", [])
        
        return [{
            "title": r.get("job_title"),
            "company": r.get("employer_name"),
            "location": r.get("job_city", r.get("job_country", "Unknown")),
            "description": r.get("job_description"),
            "salary": r.get("job_salary"),
            "redirect_url": r.get("job_apply_link"),
            "source": "rapidapi",
            "posted_by": "RapidAPI JSearch"
        } for r in data]
    except Exception as e:
        logger.error(f"RapidAPI error: {e}")
        return []

@jobs_bp.route("/rapidapi", methods=["GET"])
def get_rapidapi_jobs():
    """Fetch jobs directly from RapidAPI JSearch."""
    query = request.args.get("q", "")
    location = request.args.get("location", "")
    jobs = fetch_rapidapi_jobs(query, location)
    return jsonify(jobs), 200

@jobs_bp.route("", methods=["GET"])
def get_jobs():
    """Return all jobs from MongoDB."""
    page = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 10))
    return jsonify(Job.get_all(page=page, limit=limit)), 200

import os
from werkzeug.utils import secure_filename
from app.feeds.models import Feed

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in current_app.config["ALLOWED_EXTENSIONS"]

@jobs_bp.route("/create-job", methods=["POST"])
@jwt_required()
def create_job():
    """Accept job details, store in MongoDB, and emit new_job event."""
    current_user = get_jwt_identity()
    user = User.find_by_email(current_user)
    
    if not user or user["role"].lower() != "alumni":
        return jsonify({"message": "Only alumni can post jobs"}), 403

    # Handle both JSON and Multipart data
    if request.is_json:
        data = request.get_json()
    else:
        # It's form-data (for file uploads)
        data = request.form.to_dict()
        
    required_fields = ["title", "company", "location", "description"]
    # We'll be more lenient with requirements since we're adding images
    
    valid, error_msg = validate_user_input(data, required_fields=required_fields)
    if not valid:
        return jsonify({"message": error_msg}), 400

    # Process image upload if present
    image_url = None
    if "image" in request.files:
        file = request.files["image"]
        if file and allowed_file(file.filename):
            filename = secure_filename(f"job_{user['_id']}_{datetime.utcnow().timestamp()}_{file.filename}")
            filepath = os.path.join(current_app.config["JOBS_UPLOAD_FOLDER"], filename)
            file.save(filepath)
            # Use a path relative to static
            image_url = f"/static/uploads/jobs/{filename}"

    data["posted_by"] = str(user["_id"])
    data["image_url"] = image_url
    
    # Process skills if provided as string
    if isinstance(data.get("skills"), str):
        data["skills"] = [s.strip() for s in data["skills"].split(",") if s.strip()]

    job = Job.create(data)

    if job:
        # Cross-post to feed
        feed_content = f"New Job Opening: {job['title']} at {job['company']}\n\n{job['description']}"
        # Strip HTML if present in description (simple version)
        import re
        feed_content = re.sub('<[^<]+?>', '', feed_content)
        if len(feed_content) > 300:
            feed_content = feed_content[:297] + "..."
            
        Feed.create(
            author_email=current_user,
            content=feed_content,
            post_type="job",
            reference_id=job["_id"],
            image_url=image_url
        )
        
        socketio.emit("new_job", job, broadcast=True)
        return jsonify({"message": "Job created successfully", "id": job["_id"]}), 201
    
    return jsonify({"message": "Failed to create job"}), 500

@jobs_bp.route("/search", methods=["GET"])
def search_jobs():
    """Fetch jobs from both Adzuna and RapidAPI, and return merged list."""
    query = request.args.get("q", "")
    location = request.args.get("location", "")

    if not query and not location:
        return jsonify({"message": "Query or location parameter is required"}), 400

    # 1. Fetch from Adzuna
    adzuna_jobs = fetch_adzuna_jobs(query, location)
    
    # 2. Fetch from RapidAPI JSearch
    rapidapi_jobs = fetch_rapidapi_jobs(query, location)

    # 3. Get matching jobs from MongoDB (internal jobs or previously cached ones)
    internal_results = Job.search(query)
    
    # Filter internal results by location too if provided
    if location:
        internal_results = [j for j in internal_results if location.lower() in j.get("location", "").lower()]

    # Combine results
    results = internal_results + adzuna_jobs + rapidapi_jobs

    return jsonify(results), 200

@jobs_bp.route("/apply", methods=["POST"])
@jwt_required()
def apply_job():
    """Store job application (user_id, job_id)."""
    current_user = get_jwt_identity()
    user = User.find_by_email(current_user)
    
    if not user:
        return jsonify({"message": "Unauthorized"}), 401

    data = request.get_json()
    job_id = data.get("job_id")
    
    if not job_id:
        return jsonify({"message": "job_id is required"}), 400

    application_id = Job.apply(str(user["_id"]), job_id)
    
    if application_id:
        return jsonify({"message": "Application submitted successfully", "id": application_id}), 201
    
    return jsonify({"message": "Failed to submit application"}), 500

@jobs_bp.route("/<id>", methods=["GET", "PUT", "DELETE"])
@jwt_required(optional=True)
def handle_single_job(id):
    job = Job.get_by_id(id)
    if not job:
        return jsonify({"message": "Job not found"}), 404

    if request.method == "GET":
        return jsonify(job), 200
        
    return jsonify({"message": "Method not allowed for this route extension"}), 405
