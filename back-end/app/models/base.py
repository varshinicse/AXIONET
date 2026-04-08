from pymongo import MongoClient
import logging

# Configure logger
logger = logging.getLogger(__name__)

import os

# Database connection
# Database connection
class DummyCollection:
    def __init__(self):
        self.default_users = {
            "varshini@gmail.com": {
                "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
                "email": "varshini@gmail.com",
                "password": b"$2b$10$VudB78tYny72.p0dCpg3Q.OmQIzNBe93DQnHwUqk0aXpll/p2.HCW", # Hash for 'password123'
                "name": "Varshini",
                "role": "student"
            },
            "vandhana@gmail.com": {
                "_id": "64f1a2b3c4d5e6f7a8b9c0d2",
                "email": "vandhana@gmail.com",
                "password": b"$2b$10$VudB78tYny72.p0dCpg3Q.OmQIzNBe93DQnHwUqk0aXpll/p2.HCW",
                "name": "Vandhana",
                "role": "alumni"
            },
            "staff@example.com": {
                "_id": "64f1a2b3c4d5e6f7a8b9c0d3",
                "email": "staff@example.com",
                "password": b"$2b$10$VudB78tYny72.p0dCpg3Q.OmQIzNBe93DQnHwUqk0aXpll/p2.HCW",
                "name": "Staff User",
                "role": "staff"
            }
        }

    def find_one(self, query, *args, **kwargs):
        email = query.get("email")
        if email in self.default_users:
            return self.default_users[email]
        return None

    def find(self, *args, **kwargs): return []
    def insert_one(self, *args, **kwargs): 
        class InsertResult:
            def __init__(self): self.inserted_id = "dummy_id"
        return InsertResult()
    def update_one(self, *args, **kwargs):
        class UpdateResult:
            def __init__(self): self.modified_count = 1
        return UpdateResult()
    def create_index(self, *args, **kwargs): pass
    def limit(self, *args, **kwargs): return self
    def __iter__(self): return iter([])

class DummyDB:
    def __getitem__(self, name): return DummyCollection()

try:
    mongo_uri = os.getenv("MONGO_URI", "mongodb://127.0.0.1:27017/")
    client = MongoClient(mongo_uri, serverSelectionTimeoutMS=2000)
    # Check if connection is alive
    client.server_info()
    db = client["imperious"]
    logger.info("Connected successfully to MongoDB")
except Exception as e:
    logger.error(f"Could not connect to MongoDB: {e}. Using dummy database for simulation.")
    db = DummyDB()

# Collections
users_collection = db["users"]
# Create indexes for performance
try:
    users_collection.create_index("email", unique=True)
    users_collection.create_index("regno", unique=True, sparse=True)
except:
    pass

feeds_collection = db["feeds"]
news_events_collection = db["news_events"]
try:
    news_events_collection.create_index("type") # Useful for filtering
except:
    pass

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
