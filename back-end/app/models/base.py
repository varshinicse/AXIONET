from pymongo import MongoClient
import logging

# Configure logger
logger = logging.getLogger(__name__)

import os

# Database connection
try:
    mongo_uri = os.getenv("MONGO_URI", "mongodb://127.0.0.1:27017/")
    client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
    db = client["imperious"]
    logger.info("Connected successfully to MongoDB")
except Exception as e:
    logger.error(f"Could not connect to MongoDB: {e}")
    raise

# Collections
users_collection = db["users"]
# Create indexes for performance
users_collection.create_index("email", unique=True)
users_collection.create_index("regno", unique=True, sparse=True)

feeds_collection = db["feeds"]
news_events_collection = db["news_events"]
news_events_collection.create_index("type") # Useful for filtering

projects_collection = db["projects"]
student_records_collection = db["student_records"]
mentorship_requests = db["mentorship_requests"]
collaboration_requests = db["collaboration_requests"]
job_profiles_collection = db["job_profiles"]
jobs_collection = db["jobs"]
connections_collection = db["connections"]
connection_requests_collection = db["connection_requests"]
conversations_collection = db["conversations"]
messages_collection = db["messages"]
pending_staff_collection = db["pending_staff_registrations"]
job_applications_collection = db["job_applications"]
bug_reports_collection = db["bug_reports"]
rsvps_collection = db["rsvps"]
