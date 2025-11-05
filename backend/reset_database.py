"""
Clean database initialization script
Removes all existing data and creates fresh test accounts
"""
import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from database import Base, User, Patient, Appointment, Priority, TriageRecord, Alert
from auth import get_password_hash
import json

# Database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./vitals_first.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def clean_database():
    """Remove all existing data"""
    print("Cleaning database...")
    
    # Drop all tables
    Base.metadata.drop_all(bind=engine)
    
    # Recreate all tables
    Base.metadata.create_all(bind=engine)
    
    print("Database cleaned and recreated")

def create_test_users():
    """Create test users for the application"""
    db = SessionLocal()
    
    try:
        print("Creating test users...")
        
        # Create admin user
        admin_user = User(
            username="admin",
            email="admin@vitalsfirst.com",
            name="System Administrator",
            role="administrator",
            hashed_password=get_password_hash("admin123")
        )
        db.add(admin_user)
        
        # Create doctor accounts
        doctor1 = User(
            username="doctor1",
            email="doctor1@vitalsfirst.com", 
            name="Dr. John Smith",
            role="doctor",
            hashed_password=get_password_hash("Doctor")
        )
        db.add(doctor1)
        
        doctor2 = User(
            username="doctor2",
            email="doctor2@vitalsfirst.com",
            name="Dr. Sarah Johnson", 
            role="doctor",
            hashed_password=get_password_hash("Doctor")
        )
        db.add(doctor2)
        
        # Create nurse accounts
        nurse1 = User(
            username="nurse1",
            email="nurse1@vitalsfirst.com",
            name="Nurse Alice Brown",
            role="nurse", 
            hashed_password=get_password_hash("Doctor")
        )
        db.add(nurse1)
        
        nurse2 = User(
            username="nurse2",
            email="nurse2@vitalsfirst.com",
            name="Nurse Bob Wilson",
            role="nurse",
            hashed_password=get_password_hash("Doctor")
        )
        db.add(nurse2)
        
        # Create a test patient
        patient1 = User(
            username="patient1",
            email="patient1@vitalsfirst.com",
            name="Test Patient",
            role="patient",
            hashed_password=get_password_hash("patient123")
        )
        db.add(patient1)
        
        # Commit users first to get IDs
        db.commit()
        db.refresh(patient1)
        
        # Create patient profile
        patient_profile = Patient(
            user_id=patient1.id,
            age=30,
            gender="Other",
            medical_history="No significant medical history",
            contact_number="555-0123"
        )
        db.add(patient_profile)
        
        db.commit()
        print("Test users created successfully")
        
    except Exception as e:
        print(f"Error creating test users: {e}")
        db.rollback()
    finally:
        db.close()

def create_priorities():
    """Create priority levels"""
    db = SessionLocal()
    
    try:
        print("Creating priority levels...")
        
        priorities_data = [
            {
                "name": "high",
                "description": "Critical conditions requiring immediate attention",
                "condition_keywords": json.dumps([
                    "cancer", "tumor", "heart attack", "stroke", "emergency", 
                    "chest pain", "difficulty breathing", "unconscious", "bleeding"
                ])
            },
            {
                "name": "medium", 
                "description": "Serious conditions requiring prompt attention",
                "condition_keywords": json.dumps([
                    "injury", "fracture", "severe pain", "infection", "pneumonia",
                    "asthma", "diabetes complication", "high blood pressure"
                ])
            },
            {
                "name": "low",
                "description": "General health concerns and routine checkups", 
                "condition_keywords": json.dumps([
                    "fever", "cold", "flu", "checkup", "routine", "consultation",
                    "headache", "minor pain", "skin issue", "allergy"
                ])
            }
        ]
        
        for priority_data in priorities_data:
            priority = Priority(
                name=priority_data["name"],
                description=priority_data["description"],
                condition_keywords=priority_data["condition_keywords"]
            )
            db.add(priority)
        
        db.commit()
        print("Priority levels created successfully")
        
    except Exception as e:
        print(f"Error creating priorities: {e}")
        db.rollback()
    finally:
        db.close()

def main():
    """Main initialization function"""
    print("Starting database initialization...")
    
    # Clean database
    clean_database()
    
    # Create test users
    create_test_users()
    
    # Create priorities
    create_priorities()
    
    print("Database initialization completed!")
    print("\nTest Accounts Created:")
    print("Admin: admin / admin123")
    print("Doctor 1: doctor1 / Doctor")
    print("Doctor 2: doctor2 / Doctor") 
    print("Nurse 1: nurse1 / Doctor")
    print("Nurse 2: nurse2 / Doctor")
    print("Patient: patient1 / patient123")

if __name__ == "__main__":
    main()