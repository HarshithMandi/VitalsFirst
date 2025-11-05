from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from datetime import timedelta

import crud
import schemas
from database import get_db, create_tables, User
from auth import create_access_token, verify_token, ACCESS_TOKEN_EXPIRE_MINUTES

# Create FastAPI app
app = FastAPI(title="Vitals First Hub API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# Create tables on startup
@app.on_event("startup")
async def startup_event():
    create_tables()
    # Initialize database with default data
    db = next(get_db())
    crud.init_priorities(db)
    db.close()

# Dependency to get current user
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    username = verify_token(credentials.credentials)
    if username is None:
        raise credentials_exception
    
    user = crud.get_user_by_username(db, username=username)
    if user is None:
        raise credentials_exception
    
    return user

# Root endpoint
@app.get("/")
async def root():
    return {"message": "Vitals First Hub API"}

# Authentication endpoints
@app.post("/auth/login", response_model=schemas.Token)
async def login(user_credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    user = crud.authenticate_user(
        db, user_credentials.username, user_credentials.password, user_credentials.role
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username, password, or role",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@app.post("/auth/register", response_model=schemas.User)
async def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    created_user = crud.create_user(db=db, user=user)
    
    # Create patient profile if user is a patient
    if user.role == "patient":
        patient_data = schemas.PatientCreate(user_id=created_user.id)
        crud.create_patient(db=db, patient=patient_data)
    
    return created_user

@app.post("/auth/register-patient", response_model=schemas.User)
async def register_patient(patient_data: schemas.PatientRegistration, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_username(db, username=patient_data.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    db_user = crud.get_user_by_email(db, email=patient_data.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    created_user = crud.register_patient(db=db, patient_data=patient_data)
    return created_user

@app.get("/auth/me", response_model=schemas.User)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

# User endpoints
@app.get("/users/", response_model=List[schemas.User])
async def read_users(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if str(current_user.role) != "administrator":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    users = crud.get_users(db, skip=skip, limit=limit)
    return users

@app.get("/users/{user_id}", response_model=schemas.User)
async def read_user(
    user_id: str, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if str(current_user.role) != "administrator" and str(current_user.id) != user_id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    db_user = crud.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

# Admin endpoints for Doctor management
@app.post("/admin/doctors/", response_model=schemas.Doctor)
async def create_doctor(
    doctor_data: schemas.DoctorCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if str(current_user.role) != "administrator":
        raise HTTPException(status_code=403, detail="Only administrators can create doctors")
    
    # Check if username already exists
    existing_user = crud.get_user_by_username(db, doctor_data.username)
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    # Check if email already exists
    existing_email = crud.get_user_by_email(db, doctor_data.email)
    if existing_email:
        raise HTTPException(status_code=400, detail="Email already exists")
    
    return crud.create_doctor(db, doctor_data)

@app.get("/admin/doctors/", response_model=List[schemas.Doctor])
async def get_doctors(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if str(current_user.role) != "administrator":
        raise HTTPException(status_code=403, detail="Only administrators can view doctors")
    
    return crud.get_doctors_with_users(db, skip=skip, limit=limit)

@app.delete("/admin/doctors/{doctor_id}")
async def delete_doctor(
    doctor_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if str(current_user.role) != "administrator":
        raise HTTPException(status_code=403, detail="Only administrators can delete doctors")
    
    doctor = crud.get_doctor(db, doctor_id)
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    
    result = crud.delete_doctor(db, doctor_id)
    if result:
        return {"message": "Doctor deleted successfully"}
    else:
        raise HTTPException(status_code=500, detail="Failed to delete doctor")

@app.patch("/admin/doctors/{doctor_id}/toggle-status")
async def toggle_doctor_status(
    doctor_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if str(current_user.role) != "administrator":
        raise HTTPException(status_code=403, detail="Only administrators can toggle doctor status")
    
    doctor = crud.get_doctor(db, doctor_id)
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    
    new_status = crud.toggle_doctor_active_status(db, doctor_id)
    if new_status is not None:
        return {"message": f"Doctor status {'activated' if new_status else 'deactivated'} successfully", "is_active": new_status}
    else:
        raise HTTPException(status_code=500, detail="Failed to toggle doctor status")

# Admin endpoints for Nurse management
@app.post("/admin/nurses/", response_model=schemas.Nurse)
async def create_nurse(
    nurse_data: schemas.NurseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if str(current_user.role) != "administrator":
        raise HTTPException(status_code=403, detail="Only administrators can create nurses")
    
    # Check if username already exists
    existing_user = crud.get_user_by_username(db, nurse_data.username)
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    # Check if email already exists
    existing_email = crud.get_user_by_email(db, nurse_data.email)
    if existing_email:
        raise HTTPException(status_code=400, detail="Email already exists")
    
    return crud.create_nurse(db, nurse_data)

@app.get("/admin/nurses/", response_model=List[schemas.Nurse])
async def get_nurses(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if str(current_user.role) != "administrator":
        raise HTTPException(status_code=403, detail="Only administrators can view nurses")
    
    return crud.get_nurses_with_users(db, skip=skip, limit=limit)

@app.delete("/admin/nurses/{nurse_id}")
async def delete_nurse(
    nurse_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if str(current_user.role) != "administrator":
        raise HTTPException(status_code=403, detail="Only administrators can delete nurses")
    
    nurse = crud.get_nurse(db, nurse_id)
    if not nurse:
        raise HTTPException(status_code=404, detail="Nurse not found")
    
    result = crud.delete_nurse(db, nurse_id)
    if result:
        return {"message": "Nurse deleted successfully"}
    else:
        raise HTTPException(status_code=500, detail="Failed to delete nurse")

@app.patch("/admin/nurses/{nurse_id}/toggle-status")
async def toggle_nurse_status(
    nurse_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if str(current_user.role) != "administrator":
        raise HTTPException(status_code=403, detail="Only administrators can toggle nurse status")
    
    nurse = crud.get_nurse(db, nurse_id)
    if not nurse:
        raise HTTPException(status_code=404, detail="Nurse not found")
    
    new_status = crud.toggle_nurse_active_status(db, nurse_id)
    if new_status is not None:
        return {"message": f"Nurse status {'activated' if new_status else 'deactivated'} successfully", "is_active": new_status}
    else:
        raise HTTPException(status_code=500, detail="Failed to toggle nurse status")

# Admin endpoints for User management
@app.get("/admin/users/", response_model=List[schemas.User])
async def get_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if str(current_user.role) != "administrator":
        raise HTTPException(status_code=403, detail="Only administrators can view users")
    
    return crud.get_users(db, skip=skip, limit=limit)

@app.delete("/admin/users/{user_id}")
async def delete_user(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if str(current_user.role) != "administrator":
        raise HTTPException(status_code=403, detail="Only administrators can delete users")
    
    user = crud.get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Don't allow deletion of administrators
    if str(user.role) == "administrator":
        raise HTTPException(status_code=403, detail="Cannot delete administrator accounts")
    
    result = crud.delete_user(db, user_id)
    if result:
        return {"message": "User deleted successfully"}
    else:
        raise HTTPException(status_code=500, detail="Failed to delete user")

@app.patch("/admin/users/{user_id}/toggle-status")
async def toggle_user_status(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if str(current_user.role) != "administrator":
        raise HTTPException(status_code=403, detail="Only administrators can toggle user status")
    
    user = crud.get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Don't allow deactivation of administrators
    if str(user.role) == "administrator":
        raise HTTPException(status_code=403, detail="Cannot deactivate administrator accounts")
    
    new_status = crud.toggle_user_active_status(db, user_id)
    if new_status is not None:
        return {"message": f"User status {'activated' if new_status else 'deactivated'} successfully", "is_active": new_status}
    else:
        raise HTTPException(status_code=500, detail="Failed to toggle user status")

# Get available doctors (for appointment booking)
@app.get("/doctors/available", response_model=List[schemas.Doctor])
async def get_available_doctors(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return crud.get_doctors_with_users(db)

# Patient endpoints
@app.get("/patients/", response_model=List[schemas.PatientDetails])
async def read_patients(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["nurse", "doctor", "administrator"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    patients = crud.get_patients_with_users(db, skip=skip, limit=limit)
    result = []
    for patient in patients:
        patient_dict = {
            "id": patient.id,
            "user_id": patient.user_id,
            "age": patient.age,
            "gender": patient.gender,
            "medical_history": patient.medical_history,
            "contact_number": patient.contact_number,
            "registration_date": patient.registration_date,
            "user": patient.user
        }
        result.append(patient_dict)
    return result

@app.get("/patients/{patient_id}", response_model=schemas.PatientDetails)
async def read_patient(
    patient_id: str, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["nurse", "doctor", "administrator"]:
        # Patients can only view their own profile
        patient = crud.get_patient(db, patient_id=patient_id)
        if not patient or patient.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not enough permissions")
    
    db_patient = crud.get_patient_with_user(db, patient_id=patient_id)
    if db_patient is None:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    return {
        "id": db_patient.id,
        "user_id": db_patient.user_id,
        "age": db_patient.age,
        "gender": db_patient.gender,
        "medical_history": db_patient.medical_history,
        "contact_number": db_patient.contact_number,
        "registration_date": db_patient.registration_date,
        "user": db_patient.user
    }

@app.put("/patients/{patient_id}", response_model=schemas.Patient)
async def update_patient(
    patient_id: str,
    patient_update: schemas.PatientBase,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["nurse", "doctor", "administrator"]:
        patient = crud.get_patient(db, patient_id)
        if not patient or patient.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not enough permissions")
    
    updated_patient = crud.update_patient(db, patient_id, patient_update)
    if not updated_patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return updated_patient

# Appointment endpoints
@app.post("/appointments/book", response_model=schemas.Appointment)
async def book_appointment(
    appointment_data: schemas.AppointmentBooking,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "patient":
        raise HTTPException(status_code=403, detail="Only patients can book appointments")
    
    # Initialize priorities if not already done
    crud.init_priorities(db)
    
    created_appointment = crud.book_appointment(db, appointment_data, current_user.id)
    
    # Add patient and doctor names
    patient = crud.get_user(db, created_appointment.patient_id)
    doctor = crud.get_user(db, created_appointment.doctor_id)
    created_appointment.patient_name = patient.name if patient else "Unknown"
    created_appointment.doctor_name = doctor.name if doctor else "Unknown"
    
    return created_appointment

@app.put("/appointments/{appointment_id}/consult")
async def mark_appointment_consulted(
    appointment_id: str,
    doctor_remarks: str = "",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["doctor", "administrator"]:
        raise HTTPException(status_code=403, detail="Only doctors can mark appointments as consulted")
    
    appointment = crud.get_appointment(db, appointment_id)
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    # Check if doctor is assigned to this appointment (unless admin)
    if current_user.role == "doctor" and appointment.doctor_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only consult your own appointments")
    
    updated_appointment = crud.mark_appointment_consulted(db, appointment_id, doctor_remarks)
    return {"message": "Appointment marked as consulted", "appointment": updated_appointment}

@app.get("/priorities/", response_model=List[schemas.Priority])
async def get_priorities(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return crud.get_priorities(db)

@app.get("/doctors/", response_model=List[schemas.User])
async def get_doctors(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return crud.get_users_by_role(db, "doctor")

@app.get("/appointments/", response_model=List[schemas.Appointment])
async def read_appointments(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role == "patient":
        appointments = crud.get_appointments_by_patient(db, current_user.id)
    elif current_user.role == "doctor":
        appointments = crud.get_appointments_by_doctor(db, current_user.id)
    else:
        appointments = crud.get_appointments(db, skip=skip, limit=limit)
    
    # Add patient and doctor names
    for appointment in appointments:
        patient = crud.get_user(db, appointment.patient_id)
        doctor = crud.get_user(db, appointment.doctor_id)
        appointment.patient_name = patient.name if patient else "Unknown"
        appointment.doctor_name = doctor.name if doctor else "Unknown"
    
    return appointments

@app.post("/appointments/", response_model=schemas.Appointment)
async def create_appointment(
    appointment: schemas.AppointmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Patients can only create appointments for themselves
    if current_user.role == "patient" and appointment.patient_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    created_appointment = crud.create_appointment(db=db, appointment=appointment)
    
    # Add patient and doctor names
    patient = crud.get_user(db, created_appointment.patient_id)
    doctor = crud.get_user(db, created_appointment.doctor_id)
    created_appointment.patient_name = patient.name if patient else "Unknown"
    created_appointment.doctor_name = doctor.name if doctor else "Unknown"
    
    return created_appointment

@app.put("/appointments/{appointment_id}", response_model=schemas.Appointment)
async def update_appointment(
    appointment_id: str,
    appointment_update: schemas.AppointmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    appointment = crud.get_appointment(db, appointment_id)
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    # Check permissions
    if current_user.role == "patient" and appointment.patient_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    elif current_user.role == "doctor" and appointment.doctor_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    updated_appointment = crud.update_appointment(db, appointment_id, appointment_update)
    return updated_appointment

@app.delete("/appointments/{appointment_id}")
async def delete_appointment(
    appointment_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    appointment = crud.get_appointment(db, appointment_id)
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    # Check permissions
    if current_user.role == "patient" and appointment.patient_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    elif current_user.role not in ["doctor", "administrator"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    crud.delete_appointment(db, appointment_id)
    return {"message": "Appointment deleted successfully"}

# Triage endpoints
@app.get("/triage/", response_model=List[schemas.TriageRecord])
async def read_triage_records(
    skip: int = 0,
    limit: int = 100,
    priority: str = None,
    status: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["nurse", "doctor", "administrator"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    if priority:
        triage_records = crud.get_triage_records_by_priority(db, priority)
    elif status:
        triage_records = crud.get_triage_records_by_status(db, status)
    else:
        triage_records = crud.get_triage_records(db, skip=skip, limit=limit)
    
    # Add patient and nurse names
    for record in triage_records:
        patient = crud.get_patient(db, record.patient_id)
        nurse = crud.get_user(db, record.nurse_id)
        record.patient_name = patient.user.name if patient and patient.user else "Unknown"
        record.nurse_name = nurse.name if nurse else "Unknown"
    
    return triage_records

@app.post("/triage/", response_model=schemas.TriageRecord)
async def create_triage_record(
    triage: schemas.TriageRecordCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["nurse", "doctor"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Set nurse_id to current user if nurse
    if current_user.role == "nurse":
        triage.nurse_id = current_user.id
    
    created_triage = crud.create_triage_record(db=db, triage=triage)
    
    # Add patient and nurse names
    patient = crud.get_patient(db, created_triage.patient_id)
    nurse = crud.get_user(db, created_triage.nurse_id)
    created_triage.patient_name = patient.user.name if patient and patient.user else "Unknown"
    created_triage.nurse_name = nurse.name if nurse else "Unknown"
    
    return created_triage

@app.put("/triage/{triage_id}")
async def update_triage_record(
    triage_id: str,
    status: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["nurse", "doctor"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    updated_triage = crud.update_triage_record(db, triage_id, {"status": status})
    if not updated_triage:
        raise HTTPException(status_code=404, detail="Triage record not found")
    
    return {"message": "Triage record updated successfully"}

# Alert endpoints
@app.get("/alerts/", response_model=List[schemas.Alert])
async def read_alerts(
    skip: int = 0,
    limit: int = 100,
    unread_only: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if unread_only:
        alerts = crud.get_unread_alerts(db, current_user.id)
    else:
        alerts = crud.get_alerts_by_user(db, current_user.id)
    
    return alerts

@app.post("/alerts/", response_model=schemas.Alert)
async def create_alert(
    alert: schemas.AlertCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["nurse", "doctor", "administrator"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    created_alert = crud.create_alert(db=db, alert=alert)
    return created_alert

@app.put("/alerts/{alert_id}/read")
async def mark_alert_read(
    alert_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    alert = crud.get_alert(db, alert_id)
    if not alert or alert.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    crud.mark_alert_read(db, alert_id)
    return {"message": "Alert marked as read"}

# Dashboard endpoints
@app.get("/dashboard/stats")
async def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    stats = crud.get_dashboard_stats(db, current_user.role, current_user.id)
    return stats

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)