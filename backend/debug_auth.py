from database import SessionLocal
from database import User
from auth import verify_password
import crud

db = SessionLocal()

# Debug the authentication step by step
print("=== Testing Authentication Step by Step ===")

# Step 1: Get user
admin_user = crud.get_user_by_username(db, 'admin')
print(f"1. User found: {admin_user is not None}")
if admin_user:
    print(f"   Username: {admin_user.username}")
    print(f"   Role type: {type(admin_user.role)}")
    print(f"   Role value: {repr(admin_user.role)}")
    
    # Step 2: Test password
    password_valid = verify_password('admin123', admin_user.hashed_password)
    print(f"2. Password valid: {password_valid}")
    
    # Step 3: Test role comparison - this is where the issue is
    print(f"3. Role comparison:")
    print(f"   user.role: {repr(admin_user.role)}")
    print(f"   expected: {repr('administrator')}")
    try:
        role_match = admin_user.role == 'administrator'
        print(f"   Direct comparison result: {role_match}")
    except Exception as e:
        print(f"   Direct comparison failed: {e}")
    
    # Step 4: Test full authentication
    try:
        auth_result = crud.authenticate_user(db, 'admin', 'admin123', 'administrator')
        print(f"4. Full auth result: {auth_result is not False}")
    except Exception as e:
        print(f"4. Full auth failed with error: {e}")

db.close()