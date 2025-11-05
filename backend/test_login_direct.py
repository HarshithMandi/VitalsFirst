import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from main import app
import schemas

# Create test client
client = TestClient(app)

def test_login():
    """Test the login endpoint directly"""
    login_data = {
        "username": "admin",
        "password": "admin123",
        "role": "administrator"
    }
    
    print("Testing login endpoint...")
    print(f"Login data: {login_data}")
    
    try:
        response = client.post("/auth/login", json=login_data)
        print(f"Response status: {response.status_code}")
        print(f"Response headers: {dict(response.headers)}")
        print(f"Response text: {response.text}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Login successful!")
            print(f"Token: {result.get('access_token', 'N/A')[:50]}...")
            print(f"User: {result.get('user', {})}")
        else:
            print(f"❌ Login failed with status {response.status_code}")
            
    except Exception as e:
        print(f"❌ Error during login test: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_login()