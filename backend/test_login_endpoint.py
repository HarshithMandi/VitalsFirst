import requests
import json

# Test the login endpoint directly
url = "http://localhost:8000/auth/login"
data = {
    "username": "admin",
    "password": "admin123", 
    "role": "administrator"
}

print("Testing login endpoint...")
print(f"URL: {url}")
print(f"Data: {json.dumps(data, indent=2)}")

try:
    response = requests.post(url, json=data)
    print(f"\nResponse Status: {response.status_code}")
    print(f"Response Headers: {dict(response.headers)}")
    print(f"Response Text: {response.text}")
    
    if response.status_code == 200:
        result = response.json()
        print("\n✅ Login successful!")
        print(f"Token: {result.get('access_token', 'N/A')[:50]}...")
    else:
        print(f"\n❌ Login failed with status {response.status_code}")
        
except requests.exceptions.ConnectionError:
    print("\n❌ Could not connect to backend server. Is it running on port 8000?")
except Exception as e:
    print(f"\n❌ Error: {e}")