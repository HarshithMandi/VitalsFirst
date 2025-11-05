from sqlalchemy.orm import Session
from sqlalchemy import text
from database import User, Patient, Doctor, Nurse, Appointment, TriageRecord, Alert, Priority
from auth import get_password_hash, verify_password
import schemas
from typing import List, Optional
from datetime import datetime, date
import json

# User CRUD operations
def get_user_by_username(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def get_user(db: Session, user_id: str):
    return db.query(User).filter(User.id == user_id).first()

def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(User).offset(skip).limit(limit).all()

def get_users_by_role(db: Session, role: str):
    return db.query(User).filter(User.role == role).all()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = User(
        username=user.username,
        email=user.email,
        name=user.name,
        role=user.role,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def register_patient(db: Session, patient_data: schemas.PatientRegistration):
    # Create user account
    hashed_password = get_password_hash(patient_data.password)
    db_user = User(
        username=patient_data.username,
        email=patient_data.email,
        name=patient_data.name,
        role="patient",
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.flush()  # Get the ID without committing
    
    # Create patient profile
    db_patient = Patient(
        user_id=db_user.id,
        age=patient_data.age,
        gender=patient_data.gender,
        medical_history=patient_data.medical_history,
        contact_number=patient_data.contact_number
    )
    db.add(db_patient)
    db.commit()
    db.refresh(db_user)
    return db_user

def authenticate_user(db: Session, username: str, password: str, role: str):
    user = get_user_by_username(db, username)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    if user.role != role:
        return False
    return user

# Patient CRUD operations
def get_patient(db: Session, patient_id: str):
    return db.query(Patient).filter(Patient.id == patient_id).first()

def get_patient_by_user_id(db: Session, user_id: str):
    return db.query(Patient).filter(Patient.user_id == user_id).first()

def get_patient_with_user(db: Session, patient_id: str):
    return db.query(Patient).join(User).filter(Patient.id == patient_id).first()

def get_patients_with_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Patient).join(User).offset(skip).limit(limit).all()

def get_patients(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Patient).offset(skip).limit(limit).all()

def create_patient(db: Session, patient: schemas.PatientCreate):
    db_patient = Patient(**patient.dict())
    db.add(db_patient)
    db.commit()
    db.refresh(db_patient)
    return db_patient

def update_patient(db: Session, patient_id: str, patient_update: schemas.PatientBase):
    db_patient = get_patient(db, patient_id)
    if db_patient:
        for key, value in patient_update.dict(exclude_unset=True).items():
            setattr(db_patient, key, value)
        db.commit()
        db.refresh(db_patient)
    return db_patient

def delete_user(db: Session, user_id: str):
    """Permanently delete a user from the database"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return False
    
    # Get user role using text query
    role_result = db.execute(
        text("SELECT role FROM users WHERE id = :user_id"), 
        {"user_id": user_id}
    ).fetchone()
    
    if role_result:
        user_role = role_result[0]
        
        # Delete associated doctor/nurse/patient records first
        if user_role == "doctor":
            doctor = db.query(Doctor).filter(Doctor.user_id == user_id).first()
            if doctor:
                db.delete(doctor)
        elif user_role == "nurse":
            nurse = db.query(Nurse).filter(Nurse.user_id == user_id).first()
            if nurse:
                db.delete(nurse)
        elif user_role == "patient":
            patient = db.query(Patient).filter(Patient.user_id == user_id).first()
            if patient:
                db.delete(patient)
    
    # Delete the user record
    db.delete(user)
    db.commit()
    return True

def toggle_user_active_status(db: Session, user_id: str):
    """Toggle the active status of a user account"""
    # Get current status directly from database using text query
    result = db.execute(
        text("SELECT is_active FROM users WHERE id = :user_id"), 
        {"user_id": user_id}
    ).fetchone()
    
    if result:
        current_status = result[0]
        new_status = not current_status
        # Toggle user active status
        db.query(User).filter(User.id == user_id).update({"is_active": new_status})
        db.commit()
        return new_status
    return None

# Doctor CRUD operations
def get_doctor(db: Session, doctor_id: str):
    return db.query(Doctor).filter(Doctor.id == doctor_id).first()

def get_doctor_by_user_id(db: Session, user_id: str):
    return db.query(Doctor).filter(Doctor.user_id == user_id).first()

def get_doctors_with_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Doctor).join(User).offset(skip).limit(limit).all()

def get_doctors(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Doctor).offset(skip).limit(limit).all()

def create_doctor(db: Session, doctor_data: schemas.DoctorCreate):
    # Create user account first with provided password
    hashed_password = get_password_hash(doctor_data.password)
    db_user = User(
        username=doctor_data.username,
        email=doctor_data.email,
        name=doctor_data.full_name,
        phone=doctor_data.phone,
        role="doctor",
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.flush()  # Get the ID without committing
    
    # Create doctor profile
    db_doctor = Doctor(
        user_id=db_user.id,
        specialization=doctor_data.specialization,
        license_number=doctor_data.license_number,
        department=doctor_data.department,
        years_of_experience=doctor_data.years_of_experience
    )
    db.add(db_doctor)
    db.commit()
    db.refresh(db_doctor)
    return db_doctor

def update_doctor(db: Session, doctor_id: str, doctor_update: schemas.DoctorBase):
    db_doctor = get_doctor(db, doctor_id)
    if db_doctor:
        for key, value in doctor_update.dict(exclude_unset=True).items():
            setattr(db_doctor, key, value)
        db.commit()
        db.refresh(db_doctor)
    return db_doctor

def delete_doctor(db: Session, doctor_id: str):
    """Permanently delete doctor and associated user from database"""
    db_doctor = get_doctor(db, doctor_id)
    if db_doctor:
        user_id = str(db_doctor.user_id)
        # Delete doctor record first (due to foreign key constraints)
        db.delete(db_doctor)
        # Delete associated user record
        user = get_user(db, user_id)
        if user:
            db.delete(user)
        db.commit()
        return True
    return False

def toggle_doctor_active_status(db: Session, doctor_id: str):
    """Toggle the active status of a doctor and their user account"""
    db_doctor = get_doctor(db, doctor_id)
    if db_doctor:
        # Get current status directly from database using text query
        result = db.execute(
            text("SELECT is_active FROM users WHERE id = :user_id"), 
            {"user_id": str(db_doctor.user_id)}
        ).fetchone()
        
        if result:
            current_status = result[0]
            new_status = not current_status
            # Toggle user active status
            db.query(User).filter(User.id == str(db_doctor.user_id)).update({"is_active": new_status})
            # Also toggle doctor availability
            db.query(Doctor).filter(Doctor.id == doctor_id).update({"is_available": new_status})
            db.commit()
            return new_status
    return None

# Nurse CRUD operations
def get_nurse(db: Session, nurse_id: str):
    return db.query(Nurse).filter(Nurse.id == nurse_id).first()

def get_nurse_by_user_id(db: Session, user_id: str):
    return db.query(Nurse).filter(Nurse.user_id == user_id).first()

def get_nurses_with_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Nurse).join(User).offset(skip).limit(limit).all()

def get_nurses(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Nurse).offset(skip).limit(limit).all()

def create_nurse(db: Session, nurse_data: schemas.NurseCreate):
    # Create user account first with provided password
    hashed_password = get_password_hash(nurse_data.password)
    db_user = User(
        username=nurse_data.username,
        email=nurse_data.email,
        name=nurse_data.full_name,
        phone=nurse_data.phone,
        role="nurse",
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.flush()  # Get the ID without committing
    
    # Create nurse profile
    db_nurse = Nurse(
        user_id=db_user.id,
        department=nurse_data.department,
        shift=nurse_data.shift,
        license_number=nurse_data.license_number
    )
    db.add(db_nurse)
    db.commit()
    db.refresh(db_nurse)
    return db_nurse

def update_nurse(db: Session, nurse_id: str, nurse_update: schemas.NurseBase):
    db_nurse = get_nurse(db, nurse_id)
    if db_nurse:
        for key, value in nurse_update.dict(exclude_unset=True).items():
            setattr(db_nurse, key, value)
        db.commit()
        db.refresh(db_nurse)
    return db_nurse

def toggle_nurse_active_status(db: Session, nurse_id: str):
    """Toggle the active status of a nurse's user account"""
    # Get the nurse and their user
    nurse = db.query(Nurse).filter(Nurse.id == nurse_id).first()
    if not nurse:
        return None
    
    # Get current status directly from database using text query
    result = db.execute(
        text("SELECT is_active FROM users WHERE id = :user_id"), 
        {"user_id": str(nurse.user_id)}
    ).fetchone()
    
    if result:
        current_status = result[0]
        new_status = not current_status
        # Toggle user active status
        db.query(User).filter(User.id == str(nurse.user_id)).update({"is_active": new_status})
        # Also toggle nurse availability
        db.query(Nurse).filter(Nurse.id == nurse_id).update({"is_available": new_status})
        db.commit()
        return new_status
    return None

def delete_nurse(db: Session, nurse_id: str):
    """Permanently delete a nurse from the database"""
    # Get the nurse first
    nurse = db.query(Nurse).filter(Nurse.id == nurse_id).first()
    if not nurse:
        return False
    
    # Get the associated user
    user = db.query(User).filter(User.id == nurse.user_id).first()
    
    # Delete the nurse record first (due to foreign key)
    db.delete(nurse)
    
    # Delete the user record
    if user:
        db.delete(user)
    
    db.commit()
    return True

# Appointment CRUD operations
def get_appointment(db: Session, appointment_id: str):
    return db.query(Appointment).filter(Appointment.id == appointment_id).first()

def get_appointments(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Appointment).offset(skip).limit(limit).all()

def get_appointments_by_patient(db: Session, patient_id: str):
    return db.query(Appointment).filter(Appointment.patient_id == patient_id).all()

def get_appointments_by_doctor(db: Session, doctor_id: str):
    return db.query(Appointment).filter(Appointment.doctor_id == doctor_id).all()

def get_appointments_by_date(db: Session, appointment_date: str):
    return db.query(Appointment).filter(Appointment.date == appointment_date).all()

def create_appointment(db: Session, appointment: schemas.AppointmentCreate):
    db_appointment = Appointment(**appointment.dict())
    db.add(db_appointment)
    db.commit()
    db.refresh(db_appointment)
    return db_appointment

def update_appointment(db: Session, appointment_id: str, appointment_update: schemas.AppointmentUpdate):
    db_appointment = get_appointment(db, appointment_id)
    if db_appointment:
        for key, value in appointment_update.dict(exclude_unset=True).items():
            setattr(db_appointment, key, value)
        db.commit()
        db.refresh(db_appointment)
    return db_appointment

def delete_appointment(db: Session, appointment_id: str):
    db_appointment = get_appointment(db, appointment_id)
    if db_appointment:
        db.delete(db_appointment)
        db.commit()
    return db_appointment

# Triage CRUD operations
def get_triage_record(db: Session, triage_id: str):
    return db.query(TriageRecord).filter(TriageRecord.id == triage_id).first()

def get_triage_records(db: Session, skip: int = 0, limit: int = 100):
    return db.query(TriageRecord).offset(skip).limit(limit).all()

def get_triage_records_by_priority(db: Session, priority: str):
    return db.query(TriageRecord).filter(TriageRecord.priority == priority).all()

def get_triage_records_by_status(db: Session, status: str):
    return db.query(TriageRecord).filter(TriageRecord.status == status).all()

def create_triage_record(db: Session, triage: schemas.TriageRecordCreate):
    db_triage = TriageRecord(**triage.dict())
    db.add(db_triage)
    db.commit()
    db.refresh(db_triage)
    return db_triage

def update_triage_record(db: Session, triage_id: str, triage_update: dict):
    db_triage = get_triage_record(db, triage_id)
    if db_triage:
        for key, value in triage_update.items():
            setattr(db_triage, key, value)
        db.commit()
        db.refresh(db_triage)
    return db_triage

# Alert CRUD operations
def get_alert(db: Session, alert_id: str):
    return db.query(Alert).filter(Alert.id == alert_id).first()

def get_alerts(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Alert).offset(skip).limit(limit).all()

def get_alerts_by_user(db: Session, user_id: str):
    return db.query(Alert).filter(Alert.user_id == user_id).all()

def get_unread_alerts(db: Session, user_id: str):
    return db.query(Alert).filter(Alert.user_id == user_id, Alert.is_read == False).all()

def create_alert(db: Session, alert: schemas.AlertCreate):
    db_alert = Alert(**alert.dict())
    db.add(db_alert)
    db.commit()
    db.refresh(db_alert)
    return db_alert

def mark_alert_read(db: Session, alert_id: str):
    db_alert = get_alert(db, alert_id)
    if db_alert:
        db_alert.is_read = True
        db.commit()
        db.refresh(db_alert)
    return db_alert

# Dashboard statistics
def get_dashboard_stats(db: Session, user_role: str, user_id: str):
    if user_role == "nurse":
        active_patients = db.query(Patient).count()
        critical_cases = db.query(TriageRecord).filter(TriageRecord.priority == "critical").count()
        triage_queue = db.query(TriageRecord).filter(TriageRecord.status == "pending").count()
        appointments_today = db.query(Appointment).filter(Appointment.date == str(date.today())).count()
        
        return {
            "active_patients": active_patients,
            "critical_cases": critical_cases,
            "triage_queue": triage_queue,
            "appointments_today": appointments_today,
            "shift_hours": "6hrs"
        }
    
    elif user_role == "doctor":
        appointments_today = db.query(Appointment).filter(
            Appointment.doctor_id == user_id,
            Appointment.date == str(date.today())
        ).count()
        pending_reviews = db.query(TriageRecord).filter(TriageRecord.status == "pending").count()
        critical_alerts = db.query(Alert).filter(Alert.alert_type == "emergency").count()
        
        return {
            "appointments_today": appointments_today,
            "pending_reviews": pending_reviews,
            "critical_alerts": critical_alerts,
            "avg_wait_time": "15m"
        }
    
    elif user_role == "patient":
        upcoming_appointments = db.query(Appointment).filter(
            Appointment.patient_id == user_id,
            Appointment.status == "scheduled"
        ).count()
        
        return {
            "upcoming_appointments": upcoming_appointments,
            "medical_records": 8,
            "triage_priority": "Low",
            "last_visit": "12d"
        }
    
    elif user_role == "administrator":
        total_patients = db.query(Patient).count()
        active_staff = db.query(User).filter(User.role.in_(["nurse", "doctor"])).count()
        system_alerts = db.query(Alert).filter(Alert.is_read == False).count()
        monthly_appointments = db.query(Appointment).count()
        
        return {
            "total_patients": total_patients,
            "active_staff": active_staff,
            "system_alerts": system_alerts,
            "monthly_appointments": monthly_appointments
        }
    
    return {}

# Priority CRUD operations
def get_priorities(db: Session):
    return db.query(Priority).all()

def get_priority_by_name(db: Session, name: str):
    return db.query(Priority).filter(Priority.name == name).first()

def create_priority(db: Session, priority: schemas.PriorityCreate):
    db_priority = Priority(**priority.dict())
    db.add(db_priority)
    db.commit()
    db.refresh(db_priority)
    return db_priority

def assign_priority_by_condition(db: Session, condition: str) -> Optional[str]:
    """Assign priority based on condition/symptoms"""
    condition_lower = condition.lower()
    
    # Get all priorities and check keywords
    priorities = get_priorities(db)
    for priority in priorities:
        if priority.condition_keywords:
            keywords = json.loads(priority.condition_keywords)
            for keyword in keywords:
                if keyword.lower() in condition_lower:
                    return priority.id
    
    # Default to low priority if no match
    low_priority = get_priority_by_name(db, "low")
    return low_priority.id if low_priority else None

# Enhanced appointment CRUD operations
def book_appointment(db: Session, appointment_data: schemas.AppointmentBooking, patient_id: str):
    """Book a new appointment with automatic priority assignment"""
    priority_id = assign_priority_by_condition(db, appointment_data.condition)
    
    db_appointment = Appointment(
        patient_id=patient_id,
        doctor_id=appointment_data.doctor_id,
        priority_id=priority_id,
        date=appointment_data.date,
        time=appointment_data.time,
        appointment_type=appointment_data.appointment_type,
        condition=appointment_data.condition,
        notes=appointment_data.notes,
        status="pending"
    )
    db.add(db_appointment)
    db.commit()
    db.refresh(db_appointment)
    return db_appointment

def mark_appointment_consulted(db: Session, appointment_id: str, doctor_remarks: str = None):
    """Mark appointment as completed by doctor"""
    appointment = get_appointment(db, appointment_id)
    if appointment:
        appointment.status = "completed"
        if doctor_remarks:
            appointment.doctor_remarks = doctor_remarks
        db.commit()
        db.refresh(appointment)
        return appointment
    return None

def get_appointments_with_priority(db: Session, skip: int = 0, limit: int = 100):
    """Get appointments with priority information"""
    return db.query(Appointment).offset(skip).limit(limit).all()

def init_priorities(db: Session):
    """Initialize default priority levels"""
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
        existing = get_priority_by_name(db, priority_data["name"])
        if not existing:
            priority = schemas.PriorityCreate(**priority_data)
            create_priority(db, priority)