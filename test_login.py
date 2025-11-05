#!/usr/bin/env python3
import requests
import json

# Test login functionality
API_BASE = "http://localhost:8000"

def test_login(username, password, role):
    """Test login with given credentials"""
    login_data = {
        "username": username,
        "password": password,
        "role": role
    }
    
    try:
        response = requests.post(f"{API_BASE}/auth/login", json=login_data)
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Login successful for {username} ({role})")
            print(f"   Token: {result['access_token'][:50]}...")
            print(f"   User: {result['user']['name']}")
            return True
        else:
            print(f"❌ Login failed for {username} ({role}): {response.status_code}")
            print(f"   Error: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Connection error: {e}")
        return False

if __name__ == "__main__":
    print("Testing login functionality...")
    print("-" * 50)
    
    # Test common default accounts (from IMPLEMENTATION_SUMMARY.md)
    test_accounts = [
        ("admin", "admin123", "administrator"),
        ("doctor1", "doctor123", "doctor"),
        ("nurse1", "nurse123", "nurse"),
        ("patient1", "patient123", "patient")
    ]
    
    for username, password, role in test_accounts:
        test_login(username, password, role)
        print()