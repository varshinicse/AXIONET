import requests

with open('test_cors_out.txt', 'w') as f:
    f.write("Testing OPTIONS request to localhost:5001...\n")
    try:
        resp = requests.options("http://localhost:5001/login", headers={"Origin": "http://localhost:3001", "Access-Control-Request-Method": "POST", "Access-Control-Request-Headers": "content-type"})
        f.write(f"Status Code: {resp.status_code}\n")
        f.write(f"Headers:\n")
        for k, v in resp.headers.items():
            f.write(f"{k}: {v}\n")
    except Exception as e:
        f.write(f"Error: {e}\n")
