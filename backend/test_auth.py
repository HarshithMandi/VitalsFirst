from database import SessionLocal
from database import User
from auth import verify_password
import crud

db = SessionLocal()

# Test admin user
admin_user = db.query(User).filter(User.username == 'admin').first()
if admin_user:
    print(f'Admin user found: {admin_user.username}')
    print(f'Role: {admin_user.role}')
    print(f'Active: {admin_user.is_active}')
    print(f'Password verification: {verify_password("admin123", admin_user.hashed_password)}')
    
    # Test full authentication
    auth_result = crud.authenticate_user(db, 'admin', 'admin123', 'administrator')
    print(f'Full auth result: {auth_result is not False}')
else:
    print('Admin user not found')

db.close()