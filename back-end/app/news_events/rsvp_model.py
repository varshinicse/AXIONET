from app.models.base import rsvps_collection, news_events_collection, users_collection
from bson import ObjectId
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class RSVP:
    @staticmethod
    def create(user_id, event_id, status="registered"):
        """
        Create a new RSVP for an event.
        """
        try:
            # Check if RSVP already exists
            existing = rsvps_collection.find_one({
                "user_id": user_id,
                "event_id": event_id
            })
            if existing:
                return str(existing["_id"])

            rsvp_data = {
                "user_id": user_id,
                "event_id": event_id,
                "status": status,
                "created_at": datetime.utcnow()
            }
            
            result = rsvps_collection.insert_one(rsvp_data)
            
            # Increment attendees_count in NewsEvent
            news_events_collection.update_one(
                {"_id": ObjectId(event_id)},
                {"$inc": {"attendees_count": 1}}
            )
            
            return str(result.inserted_id)
        except Exception as e:
            logger.error(f"Failed to create RSVP: {str(e)}")
            return None

    @staticmethod
    def delete(user_id, event_id):
        """
        Remove an RSVP for an event.
        """
        try:
            result = rsvps_collection.delete_one({
                "user_id": user_id,
                "event_id": event_id
            })
            
            if result.deleted_count > 0:
                # Decrement attendees_count in NewsEvent
                news_events_collection.update_one(
                    {"_id": ObjectId(event_id)},
                    {"$inc": {"attendees_count": -1}}
                )
                return True
            return False
        except Exception as e:
            logger.error(f"Failed to delete RSVP: {str(e)}")
            return False

    @staticmethod
    def get_for_event(event_id):
        """
        Get all RSVPs for a specific event with user details.
        """
        try:
            rsvps = list(rsvps_collection.find({"event_id": event_id}))
            for rsvp in rsvps:
                rsvp["_id"] = str(rsvp["_id"])
                user = users_collection.find_one({"_id": ObjectId(rsvp["user_id"])})
                if user:
                    rsvp["user"] = {
                        "name": user["name"],
                        "email": user["email"],
                        "role": user["role"],
                        "dept": user.get("dept"),
                        "batch": user.get("batch")
                    }
            return rsvps
        except Exception as e:
            logger.error(f"Failed to get RSVPs for event: {str(e)}")
            return []

    @staticmethod
    def get_status(user_id, event_id):
        """
        Check if a user has RSVP'd for an event.
        """
        try:
            rsvp = rsvps_collection.find_one({
                "user_id": user_id,
                "event_id": event_id
            })
            if rsvp:
                return rsvp["status"]
            return None
        except Exception as e:
            logger.error(f"Failed to get RSVP status: {str(e)}")
            return None
