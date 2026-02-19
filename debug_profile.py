import requests

base_url = "http://localhost:5001"
# Use a known valid credential
email = "test@example.com"
password = "password123"

# 1. Login
login_url = f"{base_url}/login"
try:
    print(f"Logging in to {login_url}...")
    resp = requests.post(login_url, json={"email": email, "password": password})
    print(f"Login Status: {resp.status_code}")
    if resp.status_code != 200:
        print(f"Login Failed: {resp.text}")
        exit(1)
    
    data = resp.json()
    access_token = data.get("access_token")
    if not access_token:
        print("No access token returned!")
        exit(1)
        
    print("Login successful. Got token.")
    
    # 2. Get Profile
    profile_url = f"{base_url}/profile"
    headers = {"Authorization": f"Bearer {access_token}"}
    print(f"Fetching profile from {profile_url}...")
    
    profile_resp = requests.get(profile_url, headers=headers)
    print(f"Profile Status: {profile_resp.status_code}")
    print(f"Profile Body: {profile_resp.text}")
    
except Exception as e:
    print(f"Exception: {e}")
