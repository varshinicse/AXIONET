from app import create_app
from app.auth.models import User
import logging

# Setup app context
app = create_app("default")
app.app_context().push()

# Data causing issue (similar to user input)
data = {
    "name": "Debug User",
    "email": "debug_user@example.com",
    "password": "password123",
    "dept": "Computer Science",
    "role": "student",
    "regno": "9999999999",
    "batch": 2024
}

# Enable logging to console
logging.basicConfig(level=logging.DEBUG)

print("Attempting to register user directly...")
try:
    user_id = User.register(data)
    if user_id:
        print(f"Success! User ID: {user_id}")
    else:
        print("Failed: User.register returned None")
except Exception as e:
    print(f"Exception caught during execution: {e}")
