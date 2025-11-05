from sqlalchemy.orm import Session
from database import get_db, User, Doctor, Nurse, Priority
from auth import get_password_hash
import crud

def init_admin_and_staff():
    """Initialize admin user and some sample staff"""
    db = next(get_db())
    
    try:
        # Create admin user if not exists
        admin = crud.get_user_by_username(db, "admin")
        if not admin:
            admin_user = User(
                username="admin",
                email="admin@vitalsfirst.com",
                name="System Administrator",
                role="administrator",
                hashed_password=get_password_hash("admin123")
            )
            db.add(admin_user)
            print("✓ Created admin user: admin/admin123")
        else:
            print("✓ Admin user already exists")
        
        # Initialize priorities
        crud.init_priorities(db)
        print("✓ Initialized priorities")
        
        db.commit()
        print("\n🎉 Database initialization completed successfully!")
        print("\nYou can now:")
        print("1. Login as admin (admin/admin123)")
        print("2. Add doctors and nurses from the admin panel")
        print("3. Test the application functionality")
        
    except Exception as e:
        print(f"❌ Error during initialization: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("🚀 Initializing Vitals First Hub database...")
    init_admin_and_staff()