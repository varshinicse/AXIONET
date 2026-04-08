from pymongo import MongoClient
import logging
from datetime import datetime

# Configure logger
logger = logging.getLogger(__name__)

import os

# Database connection
# Database connection
class DummyCursor:
    def __init__(self, data, query=None):
        self.data = data
        self.query = query or {}
        self._sort_field = None
        self._sort_direction = -1
        self._skip = 0
        self._limit = None

    def sort(self, field, direction=-1):
        self._sort_field = field
        self._sort_direction = direction
        return self

    def skip(self, n):
        self._skip = n
        return self

    def limit(self, n):
        self._limit = n
        return self

    def __iter__(self):
        # Apply filtering
        filtered_data = []
        for item in self.data:
            match = True
            for k, v in self.query.items():
                if item.get(k) != v:
                    match = False
                    break
            if match:
                filtered_data.append(item)

        # Apply sorting
        if self._sort_field:
            filtered_data.sort(
                key=lambda x: x.get(self._sort_field, ""),
                reverse=(self._sort_direction == -1)
            )

        # Apply skip and limit
        result = filtered_data[self._skip:]
        if self._limit:
            result = result[:self._limit]
        
        return iter(result)

    def __getitem__(self, index):
        return list(self)[index]

class DummyCollection:
    def __init__(self, collection_name=""):
        self.name = collection_name
        self.data = []
        self.default_users = {
            "varshini@gmail.com": {
                "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
                "email": "varshini@gmail.com",
                "password": b"$2b$10$VudB78tYny72.p0dCpg3Q.OmQIzNBe93DQnHwUqk0aXpll/p2.HCW",
                "name": "Varshini",
                "role": "student",
                "dept": "CSE"
            },
            "vandhana@gmail.com": {
                "_id": "64f1a2b3c4d5e6f7a8b9c0d2",
                "email": "vandhana@gmail.com",
                "password": b"$2b$10$VudB78tYny72.p0dCpg3Q.OmQIzNBe93DQnHwUqk0aXpll/p2.HCW",
                "name": "Vandhana",
                "role": "alumni",
                "dept": "IT"
            },
            "staff@example.com": {
                "_id": "64f1a2b3c4d5e6f7a8b9c0d3",
                "email": "staff@example.com",
                "password": b"$2b$10$VudB78tYny72.p0dCpg3Q.OmQIzNBe93DQnHwUqk0aXpll/p2.HCW",
                "name": "Staff User",
                "role": "staff",
                "dept": "CSE"
            }
        }
        
        # Populate with some initial data for news_events if needed
        if collection_name == "news_events":
            self.data = [
                {
                    "_id": "64f1a2b3c4d5e6f7a8b9c001",
                    "title": "Annual Tech Symposium 2026",
                    "description": "Join us for the biggest tech event of the year featuring guest speakers from top silicon valley firms.",
                    "type": "news",
                    "author_id": "64f1a2b3c4d5e6f7a8b9c0d3",
                    "created_at": datetime.now(),
                },
                {
                    "_id": "64f1a2b3c4d5e6f7a8b9c002",
                    "title": "Alumni Meetup: Bangalore Chapter",
                    "description": "Networking session for alumni based in Bangalore. Let's reconnect and share our journeys.",
                    "type": "event",
                    "event_date": "2026-05-15",
                    "location": "Electronic City, Bangalore",
                    "author_id": "64f1a2b3c4d5e6f7a8b9c0d2",
                    "created_at": datetime.now(),
                }
            ]
        elif collection_name == "feeds":
            self.data = [
                {
                    "_id": "64f1a2b3c4d5e6f7a8b9c011",
                    "content": "Excited to share that our department is launching a new AI lab next month! 🚀",
                    "author": "staff@example.com",
                    "type": "post",
                    "timestamp": datetime.now(),
                }
            ]

    def find_one(self, query, *args, **kwargs):
        if "email" in query:
            email = query.get("email")
            if email in self.default_users:
                return self.default_users[email]
        
        # General search in self.data by _id
        if "_id" in query:
            id_val = str(query["_id"])
            for item in self.data:
                if str(item.get("_id")) == id_val:
                    return item
        
        return None

    def find(self, query=None, *args, **kwargs):
        return DummyCursor(self.data, query)

    def count_documents(self, query, *args, **kwargs):
        count = 0
        for item in self.data:
            match = True
            for k, v in query.items():
                if item.get(k) != v:
                    match = False
                    break
            if match: count += 1
        return count

    def insert_one(self, data, *args, **kwargs):
        if "_id" not in data:
            data["_id"] = str(uuid.uuid4())
        self.data.append(data)
        class InsertResult:
            def __init__(self, id): self.inserted_id = id
        return InsertResult(data["_id"])

    def update_one(self, query, update, *args, **kwargs):
        class UpdateResult:
            def __init__(self): self.modified_count = 1
        return UpdateResult()
    
    def delete_one(self, query, *args, **kwargs):
        class DeleteResult:
            def __init__(self): self.deleted_count = 1
        return DeleteResult()

    def create_index(self, *args, **kwargs): pass
    def limit(self, *args, **kwargs): return self

class DummyDB:
    def __init__(self):
        self.collections = {}
    def __getitem__(self, name):
        if name not in self.collections:
            self.collections[name] = DummyCollection(name)
        return self.collections[name]

import uuid

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
