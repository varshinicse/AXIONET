from flask import Blueprint, request, jsonify, current_app, send_from_directory
from flask_jwt_extended import jwt_required, get_jwt_identity, jwt_required
from app.news_events.models import NewsEvent, clear_news_events_cache
from app.news_events.rsvp_model import RSVP
from app.auth.models import User
from app.utils.validators import validate_user_input, validate_file_type
from app.utils.helpers import save_uploaded_file
import os
from datetime import datetime, timezone
from werkzeug.utils import secure_filename
import uuid

news_events_bp = Blueprint("news_events", __name__)


@news_events_bp.route("", methods=["GET", "POST", "OPTIONS"])
@jwt_required(optional=True)
def handle_news_events():
    if request.method == "OPTIONS":
        return jsonify({}), 200

    if request.method == "GET":
        # Get query parameters
        page = int(request.args.get("page", 1))
        limit = int(request.args.get("limit", 10))
        event_type = request.args.get("type")

        # Get news events
        result = NewsEvent.get_all(page, limit, event_type)
        
        # If user is logged in, add RSVP status to each event
        current_user_email = get_jwt_identity()
        if current_user_email:
            user = User.find_by_email(current_user_email)
            if user:
                user_id = str(user["_id"])
                for item in result["items"]:
                    if item["type"] == "event":
                        item["rsvp_status"] = RSVP.get_status(user_id, item["_id"])
        
        return jsonify(result), 200

    elif request.method == "POST":
        try:
            # Check authentication
            current_user = get_jwt_identity()
            if not current_user:
                return jsonify({"message": "Unauthorized"}), 401

            # Get user details
            user = User.find_by_email(current_user)
            if not user or user.get("role", "").lower() not in ["staff", "alumni"]:
                return jsonify({"message": "Permission denied"}), 403

            # Process data based on content type
            if request.is_json:
                # Handle JSON data
                json_data = request.get_json()

                # Validate required fields
                required_fields = ["title", "description", "type"]
                if json_data.get("type") == "event":
                    required_fields.extend(["event_date", "location"])

                valid, error_msg = validate_user_input(
                    json_data, required_fields=required_fields
                )
                if not valid:
                    return jsonify({"message": error_msg}), 400

                # Create data dict
                data = {
                    "title": json_data.get("title"),
                    "description": json_data.get("description"),
                    "type": json_data.get("type"),
                    "created_at": datetime.now(timezone.utc),
                }

                # Add event-specific fields
                if data["type"] == "event":
                    data["event_date"] = json_data.get("event_date")
                    data["event_time"] = json_data.get("event_time")
                    data["location"] = json_data.get("location")
                    data["register_link"] = json_data.get("register_link")
                    data["category"] = json_data.get("category", "Social")
                    data["event_type"] = json_data.get("event_type", "In-person")
                    data["capacity"] = int(json_data.get("capacity", 0))
                    data["price"] = float(json_data.get("price", 0))
                    data["attendees_count"] = 0

            else:
                # Handle form data
                # Validate required fields
                required_fields = ["title", "description", "type"]
                if request.form.get("type") == "event":
                    required_fields.extend(["event_date", "location"])

                valid, error_msg = validate_user_input(
                    request.form, required_fields=required_fields
                )
                if not valid:
                    return jsonify({"message": error_msg}), 400

                # Create data dict
                data = {
                    "title": request.form.get("title"),
                    "description": request.form.get("description"),
                    "type": request.form.get("type"),
                    "created_at": datetime.now(timezone.utc),
                }

                # Add event-specific fields
                if data["type"] == "event":
                    data["event_date"] = request.form.get("event_date")
                    data["event_time"] = request.form.get("event_time")
                    data["location"] = request.form.get("location")
                    data["register_link"] = request.form.get("register_link")
                    data["category"] = request.form.get("category", "Social")
                    data["event_type"] = request.form.get("event_type", "In-person")
                    data["capacity"] = int(request.form.get("capacity", 0))
                    data["price"] = float(request.form.get("price", 0))
                    data["attendees_count"] = 0

                # Handle image upload
                if "image" in request.files:
                    file = request.files["image"]
                    if file and file.filename and validate_file_type(file.filename):
                        # Generate unique filename
                        filename = (
                            str(uuid.uuid4()) + os.path.splitext(file.filename)[1]
                        )

                        # Save file with optimization
                        try:
                            save_uploaded_file(
                                file=file,
                                folder_path=current_app.config[
                                    "NEWS_EVENTS_UPLOAD_FOLDER"
                                ],
                                filename=filename,
                                optimize=True,
                                max_size=(800, 800),
                            )

                            # Add image URL to data - use correct URL format
                            data["image_url"] = f"/uploads/news_events/{filename}"
                        except Exception as e:
                            current_app.logger.error(f"Error saving image: {str(e)}")
                            return jsonify({"message": "Error saving image"}), 500
                    else:
                        return jsonify({"message": "Invalid file type"}), 400

            # Add author ID
            data["author_id"] = str(user["_id"])

            # Create news/event
            result = NewsEvent.create(data)

            # --- Cross-post to Feed (LinkedIn-style) ---
            from app.feeds.models import Feed
            try:
                feed_content = f"📢 {data['title']}: {data['description'][:150]}..."
                if data['type'] == 'event':
                    feed_content = f"📅 EVENT: {data['title']}\n📍 {data.get('location', 'TBD')}\n🕒 {data.get('event_date', 'TBD')}\n\n{data['description'][:150]}..."
                
                Feed.create(
                    author_email=current_user,
                    content=feed_content,
                    post_type="news" if data['type'] == 'news' else "event",
                    reference_id=str(result),
                    image_url=data.get("image_url")
                )
            except Exception as feed_err:
                current_app.logger.error(f"Failed to cross-post to feed: {str(feed_err)}")
            # ------------------------------------------

            return jsonify({"id": str(result)}), 201

        except Exception as e:
            current_app.logger.error(f"Error creating news/event: {str(e)}")
            return jsonify({"message": str(e)}), 500


@news_events_bp.route("/<id>", methods=["GET", "PUT", "DELETE", "OPTIONS"])
@jwt_required(optional=True)
def handle_single_news_event(id):
    if request.method == "OPTIONS":
        return jsonify({}), 200

    if request.method == "GET":
        news_event = NewsEvent.get_by_id(id)
        if news_event:
            # If user is logged in, add RSVP status
            current_user_email = get_jwt_identity()
            if current_user_email and news_event["type"] == "event":
                user = User.find_by_email(current_user_email)
                if user:
                    news_event["rsvp_status"] = RSVP.get_status(str(user["_id"]), id)
            return jsonify(news_event), 200
        else:
            return jsonify({"message": "News event not found"}), 404

    elif request.method == "PUT":
        try:
            # Check authentication
            current_user = get_jwt_identity()
            if not current_user:
                return jsonify({"message": "Unauthorized"}), 401

            # Get user details
            user = User.find_by_email(current_user)
            if not user or user.get("role", "").lower() not in ["staff", "alumni"]:
                return jsonify({"message": "Permission denied"}), 403

            # Get the news event
            news_event = NewsEvent.get_by_id(id)
            if not news_event:
                return jsonify({"message": "News/event not found"}), 404

            # Check if the user has permission to edit
            user_id = str(user["_id"])

            if user_id != news_event["author_id"]:
                return (
                    jsonify(
                        {"message": "You do not have permission to edit this post"}
                    ),
                    403,
                )

            # Get data
            data = request.get_json()

            # Remove author_id if present
            if "author_id" in data:
                del data["author_id"]

            # Update news event
            if NewsEvent.update(id, data):
                return jsonify({"message": "News event updated successfully"}), 200
            else:
                return (
                    jsonify({"message": "News event not found or not modified."}),
                    404,
                )

        except Exception as e:
            current_app.logger.error(
                f"Error updating news/event with id {id}: {str(e)}"
            )
            return (
                jsonify(
                    {"message": "An error occurred while updating the news/event."}
                ),
                500,
            )

    elif request.method == "DELETE":
        try:
            # Check authentication
            current_user = get_jwt_identity()
            if not current_user:
                return jsonify({"message": "Unauthorized"}), 401

            # Get user details
            user = User.find_by_email(current_user)
            if not user or user.get("role", "").lower() not in ["staff", "alumni"]:
                return jsonify({"message": "Permission denied"}), 403

            # Get news event
            news_event = NewsEvent.get_by_id(id)
            if not news_event:
                return jsonify({"message": "News/event not found"}), 404

            # Authorization checks
            user_role = user.get("role", "").lower()
            user_id = str(user["_id"])
            author_id = news_event.get("author_id")

            if user_role == "staff":
                author = User.find_by_id(author_id)
                if (
                    author
                    and author.get("role", "").lower() == "staff"
                    and author_id != user_id
                ):
                    return (
                        jsonify(
                            {
                                "message": "Staff cannot delete posts by other staff members"
                            }
                        ),
                        403,
                    )
            elif user_role == "alumni" and author_id != user_id:
                return jsonify({"message": "You can only delete your own posts"}), 403

            # Delete associated image file if it exists
            if news_event.get("image_url"):
                try:
                    image_path = os.path.join(
                        current_app.root_path, news_event["image_url"][1:]
                    )
                    if os.path.exists(image_path):
                        os.remove(image_path)
                except OSError as e:
                    current_app.logger.error(f"Error deleting image file: {e}")

            # Delete news event
            if NewsEvent.delete(id):
                return jsonify({"message": "News event deleted successfully"}), 200
            else:
                return (
                    jsonify({"message": "News event not found or not modified."}),
                    404,
                )

        except Exception as e:
            current_app.logger.error(
                f"Error deleting news/event with id {id}: {str(e)}"
            )
            return (
                jsonify(
                    {"message": "An error occurred while deleting the news/event."}
                ),
                500,
            )


@news_events_bp.route("/<id>/rsvp", methods=["POST", "DELETE", "OPTIONS"])
@jwt_required()
def handle_event_rsvp(id):
    if request.method == "OPTIONS":
        return jsonify({}), 200

    current_user_email = get_jwt_identity()
    user = User.find_by_email(current_user_email)
    if not user:
        return jsonify({"message": "User not found"}), 404
        
    user_id = str(user["_id"])
    
    # Get event details to check capacity
    event = NewsEvent.get_by_id(id)
    if not event or event["type"] != "event":
        return jsonify({"message": "Event not found"}), 404

    if request.method == "POST":
        # Check if already RSVP'd
        if RSVP.get_status(user_id, id):
            return jsonify({"message": "Already RSVP'd for this event"}), 400
            
        # Check capacity
        if event.get("capacity", 0) > 0 and event.get("attendees_count", 0) >= event["capacity"]:
            return jsonify({"message": "Event is at full capacity"}), 400
            
        rsvp_id = RSVP.create(user_id, id)
        if rsvp_id:
            return jsonify({"message": "Successfully RSVP'd", "id": rsvp_id}), 201
        else:
            return jsonify({"message": "Failed to RSVP"}), 500
            
    elif request.method == "DELETE":
        if RSVP.delete(user_id, id):
            return jsonify({"message": "RSVP cancelled successfully"}), 200
        else:
            return jsonify({"message": "RSVP not found"}), 404


@news_events_bp.route("/<id>/attendees", methods=["GET"])
@jwt_required()
def get_event_attendees(id):
    current_user_email = get_jwt_identity()
    user = User.find_by_email(current_user_email)
    if not user:
        return jsonify({"message": "User not found"}), 404
        
    # Only staff or the organizer (if alumni) can see attendee list
    event = NewsEvent.get_by_id(id)
    if not event:
        return jsonify({"message": "Event not found"}), 404
        
    if user.get("role", "").lower() != "staff" and str(user["_id"]) != event.get("author_id"):
        return jsonify({"message": "Permission denied"}), 403
        
    attendees = RSVP.get_for_event(id)
    return jsonify(attendees), 200
