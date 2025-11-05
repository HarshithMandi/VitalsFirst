import sys
import os

# Add the backend directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import requests
import json

# Test the API endpoints
API_BASE = "http://localhost:8000"

def test_api():
    try:
        # Test root endpoint
        response = requests.get(f"{API_BASE}/")
        print(f"Root endpoint: {response.status_code} - {response.json()}")
        
        # Test login
        login_data = {
            "username": "nurse1",
            "password": "nurse123",
            "role": "nurse"
        }
        response = requests.post(f"{API_BASE}/auth/login", json=login_data)
        print(f"Login test: {response.status_code}")
        
        if response.status_code == 200:
            token_data = response.json()
            token = token_data["access_token"]
            headers = {"Authorization": f"Bearer {token}"}
            
            # Test dashboard stats
            response = requests.get(f"{API_BASE}/dashboard/stats", headers=headers)
            print(f"Dashboard stats: {response.status_code} - {response.json()}")
            
            # Test patients endpoint
            response = requests.get(f"{API_BASE}/patients/", headers=headers)
            print(f"Patients: {response.status_code} - Found {len(response.json())} patients")
            
            # Test appointments
            response = requests.get(f"{API_BASE}/appointments/", headers=headers)
            print(f"Appointments: {response.status_code} - Found {len(response.json())} appointments")
            
            # Test triage records
            response = requests.get(f"{API_BASE}/triage/", headers=headers)
            print(f"Triage records: {response.status_code} - Found {len(response.json())} records")
        
    except Exception as e:
        print(f"Error testing API: {e}")

if __name__ == "__main__":
    test_api()