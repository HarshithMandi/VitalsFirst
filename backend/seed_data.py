from sqlalchemy.orm import Session
from database import SessionLocal, User, Patient, Appointment, TriageRecord, Alert
import uuid
from datetime import datetime, date

def seed_data():
    db = SessionLocal()
    
    try:
        # Create some sample patients (in addition to the default patient)
        sample_patients = [
            {
                "user": {
                    "id": str(uuid.uuid4()),
                    "username": "patient2",
                    "email": "emma.wilson@email.com",
                    "name": "Emma Wilson",
                    "role": "patient",
                },
                "patient": {
                    "age": 35,
                    "gender": "Female",
                    "medical_history": "Hypertension, diabetes",
                    "contact_number": "+1234567891"
                }
            },
            {
                "user": {
                    "id": str(uuid.uuid4()),
                    "username": "patient3",
                    "email": "james.brown@email.com",
                    "name": "James Brown",
                    "role": "patient",
                },
                "patient": {
                    "age": 42,
                    "gender": "Male",
                    "medical_history": "Asthma, allergies",
                    "contact_number": "+1234567892"
                }
            }
        ]
        
        patient_ids = []
        
        for patient_data in sample_patients:
            # Check if user already exists
            existing_user = db.query(User).filter(User.username == patient_data["user"]["username"]).first()
            if not existing_user:
                # Create user
                from auth import get_password_hash
                db_user = User(
                    id=patient_data["user"]["id"],
                    username=patient_data["user"]["username"],
                    email=patient_data["user"]["email"],
                    name=patient_data["user"]["name"],
                    role=patient_data["user"]["role"],
                    hashed_password=get_password_hash("patient123")
                )
                db.add(db_user)
                
                # Create patient profile
                db_patient = Patient(
                    id=str(uuid.uuid4()),
                    user_id=patient_data["user"]["id"],
                    age=patient_data["patient"]["age"],
                    gender=patient_data["patient"]["gender"],
                    medical_history=patient_data["patient"]["medical_history"],
                    contact_number=patient_data["patient"]["contact_number"]
                )
                db.add(db_patient)
                patient_ids.append(db_patient.id)
        
        # Get existing doctor and nurse IDs
        doctor = db.query(User).filter(User.role == "doctor").first()
        nurse = db.query(User).filter(User.role == "nurse").first()
        
        if doctor and nurse:
            # Create some sample appointments
            existing_patients = db.query(User).filter(User.role == "patient").all()
            for i, patient in enumerate(existing_patients[:3]):
                appointment = Appointment(
                    id=str(uuid.uuid4()),
                    patient_id=patient.id,
                    doctor_id=doctor.id,
                    date=str(date.today()),
                    time=f"{9+i*2}:00 AM",
                    appointment_type=["Check-up", "Follow-up", "Consultation"][i],
                    status="scheduled"
                )
                db.add(appointment)
            
            # Create some triage records
            all_patients = db.query(Patient).all()
            priorities = ["critical", "high", "medium"]
            
            for i, patient in enumerate(all_patients[:3]):
                triage = TriageRecord(
                    id=str(uuid.uuid4()),
                    patient_id=patient.id,
                    nurse_id=nurse.id,
                    blood_pressure=["180/110", "150/95", "130/85"][i],
                    heart_rate=[120, 95, 78][i],
                    temperature=[101.2, 99.5, 98.6][i],
                    oxygen_saturation=[92, 96, 98][i],
                    respiratory_rate=[22, 18, 16][i],
                    symptoms=["Chest pain, shortness of breath", "Headache, dizziness", "Routine checkup"][i],
                    priority=priorities[i],
                    status="pending"
                )
                db.add(triage)
            
            # Create some alerts
            alert1 = Alert(
                id=str(uuid.uuid4()),
                alert_type="emergency",
                title="Critical Patient Alert",
                message="Patient Emma Wilson requires immediate attention",
                user_id=nurse.id
            )
            db.add(alert1)
            
            alert2 = Alert(
                id=str(uuid.uuid4()),
                alert_type="warning",
                title="Equipment Maintenance",
                message="Blood pressure monitor needs calibration",
                user_id=doctor.id
            )
            db.add(alert2)
        
        db.commit()
        print("Sample data seeded successfully!")
        
    except Exception as e:
        print(f"Error seeding data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()