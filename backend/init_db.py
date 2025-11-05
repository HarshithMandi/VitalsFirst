from sqlalchemy.orm import Session
from database import SessionLocal, User, Patient, create_tables
from auth import get_password_hash
import uuid

def init_db():
    # Create tables first
    create_tables()
    
    db = SessionLocal()
    
    # Create default users
    default_users = [
        {
            "id": "1",
            "username": "admin",
            "email": "admin@vitalsfirst.com",
            "name": "Admin User",
            "role": "administrator",
            "password": "admin123"
        },
        {
            "id": "2",
            "username": "nurse1",
            "email": "sarah@vitalsfirst.com",
            "name": "Sarah Johnson",
            "role": "nurse",
            "password": "nurse123"
        },
        {
            "id": "3",
            "username": "doctor1",
            "email": "mchen@vitalsfirst.com",
            "name": "Dr. Michael Chen",
            "role": "doctor",
            "password": "doctor123"
        },
        {
            "id": "4",
            "username": "patient1",
            "email": "john.doe@email.com",
            "name": "John Doe",
            "role": "patient",
            "password": "patient123"
        },
    ]
    
    for user_data in default_users:
        # Check if user already exists
        existing_user = db.query(User).filter(User.username == user_data["username"]).first()
        if not existing_user:
            db_user = User(
                id=user_data["id"],
                username=user_data["username"],
                email=user_data["email"],
                name=user_data["name"],
                role=user_data["role"],
                hashed_password=get_password_hash(user_data["password"])
            )
            db.add(db_user)
            
            # Create patient profile for patient users
            if user_data["role"] == "patient":
                db_patient = Patient(
                    id=str(uuid.uuid4()),
                    user_id=user_data["id"],
                    age=30,
                    gender="Male",
                    medical_history="No significant medical history",
                    contact_number="+1234567890"
                )
                db.add(db_patient)
    
    db.commit()
    db.close()
    print("Database initialized with default users")

if __name__ == "__main__":
    init_db()