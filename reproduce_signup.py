import requests
import json

url = "http://localhost:5001/signup"
data = {
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "dept": "Computer Science",
    "role": "student",
    "regno": "1234567890",
    "batch": 2024
}

try:
    response = requests.post(url, json=data)
    print(f"Status Code: {response.status_code}")
    print(f"Response Body: {response.text}")
except Exception as e:
    print(f"Request failed: {e}")
