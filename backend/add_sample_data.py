import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal, User, Patient, Appointment, TriageRecord, Alert, create_tables
from auth import get_password_hash
import uuid
from datetime import datetime, date

def add_sample_data():
    create_tables()
    db = SessionLocal()
    
    try:
        # Check if we have existing data
        patient_count = db.query(Patient).count()
        if patient_count > 1:
            print("Sample data already exists")
            return
            
        # Get existing users
        users = db.query(User).all()
        doctor = next((u for u in users if u.role == "doctor"), None)
        nurse = next((u for u in users if u.role == "nurse"), None)
        patients = [u for u in users if u.role == "patient"]
        
        if not doctor or not nurse:
            print("No doctor or nurse found")
            return
            
        # Add more patients if needed
        if len(patients) < 3:
            new_patients_data = [
                {
                    "username": "patient2", 
                    "email": "emma.wilson@email.com", 
                    "name": "Emma Wilson",
                    "age": 35, 
                    "gender": "Female",
                    "medical_history": "Hypertension",
                    "contact_number": "+1234567891"
                },
                {
                    "username": "patient3", 
                    "email": "james.brown@email.com", 
                    "name": "James Brown",
                    "age": 42, 
                    "gender": "Male",
                    "medical_history": "Asthma",
                    "contact_number": "+1234567892"
                }
            ]
            
            for p_data in new_patients_data:
                # Create user
                user_id = str(uuid.uuid4())
                new_user = User(
                    id=user_id,
                    username=p_data["username"],
                    email=p_data["email"],
                    name=p_data["name"],
                    role="patient",
                    hashed_password=get_password_hash("patient123")
                )
                db.add(new_user)
                
                # Create patient profile
                new_patient = Patient(
                    id=str(uuid.uuid4()),
                    user_id=user_id,
                    age=p_data["age"],
                    gender=p_data["gender"],
                    medical_history=p_data["medical_history"],
                    contact_number=p_data["contact_number"]
                )
                db.add(new_patient)
                patients.append(new_user)
        
        # Create appointments
        appointment_types = ["Check-up", "Follow-up", "Consultation"]
        times = ["09:00", "10:30", "14:00"]
        
        for i, patient in enumerate(patients[:3]):
            appointment = Appointment(
                id=str(uuid.uuid4()),
                patient_id=patient.id,
                doctor_id=doctor.id,
                date=str(date.today()),
                time=times[i],
                appointment_type=appointment_types[i],
                status="scheduled",
                notes=f"Appointment for {patient.name}"
            )
            db.add(appointment)
        
        # Create triage records
        all_patients = db.query(Patient).all()
        vitals_data = [
            {
                "blood_pressure": "180/110",
                "heart_rate": 120,
                "temperature": 101.2,
                "oxygen_saturation": 92,
                "respiratory_rate": 22,
                "symptoms": "Chest pain, shortness of breath",
                "priority": "critical"
            },
            {
                "blood_pressure": "150/95",
                "heart_rate": 95,
                "temperature": 99.5,
                "oxygen_saturation": 96,
                "respiratory_rate": 18,
                "symptoms": "Headache, dizziness",
                "priority": "high"
            },
            {
                "blood_pressure": "130/85",
                "heart_rate": 78,
                "temperature": 98.6,
                "oxygen_saturation": 98,
                "respiratory_rate": 16,
                "symptoms": "Routine checkup",
                "priority": "medium"
            }
        ]
        
        for i, patient in enumerate(all_patients[:3]):
            vitals = vitals_data[i % len(vitals_data)]
            triage = TriageRecord(
                id=str(uuid.uuid4()),
                patient_id=patient.id,
                nurse_id=nurse.id,
                blood_pressure=vitals["blood_pressure"],
                heart_rate=vitals["heart_rate"],
                temperature=vitals["temperature"],
                oxygen_saturation=vitals["oxygen_saturation"],
                respiratory_rate=vitals["respiratory_rate"],
                symptoms=vitals["symptoms"],
                priority=vitals["priority"],
                status="pending"
            )
            db.add(triage)
        
        # Create alerts
        alerts_data = [
            {
                "alert_type": "emergency",
                "title": "Critical Patient Alert",
                "message": "Patient requires immediate attention",
                "user_id": nurse.id
            },
            {
                "alert_type": "warning",
                "title": "Equipment Maintenance",
                "message": "Blood pressure monitor needs calibration",
                "user_id": doctor.id
            }
        ]
        
        for alert_data in alerts_data:
            alert = Alert(
                id=str(uuid.uuid4()),
                **alert_data
            )
            db.add(alert)
        
        db.commit()
        print("Sample data added successfully!")
        
        # Print summary
        print(f"Total users: {db.query(User).count()}")
        print(f"Total patients: {db.query(Patient).count()}")
        print(f"Total appointments: {db.query(Appointment).count()}")
        print(f"Total triage records: {db.query(TriageRecord).count()}")
        print(f"Total alerts: {db.query(Alert).count()}")
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    add_sample_data()