from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# User schemas
class UserBase(BaseModel):
    username: str
    email: EmailStr
    name: str
    role: str

class UserCreate(UserBase):
    password: str

class PatientRegistration(BaseModel):
    username: str
    email: EmailStr
    name: str
    password: str
    age: Optional[int] = None
    gender: Optional[str] = None
    medical_history: Optional[str] = None
    contact_number: Optional[str] = None

class User(UserBase):
    id: str
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    username: str
    password: str
    role: str

# Patient schemas
class PatientBase(BaseModel):
    age: Optional[int] = None
    gender: Optional[str] = None
    medical_history: Optional[str] = None
    contact_number: Optional[str] = None

class PatientCreate(PatientBase):
    user_id: str

class PatientDetails(PatientBase):
    id: str
    user_id: str
    registration_date: datetime
    user: Optional[User] = None
    
    class Config:
        from_attributes = True

class Patient(PatientBase):
    id: str
    user_id: str
    registration_date: datetime
    
    class Config:
        from_attributes = True

# Doctor schemas
class DoctorBase(BaseModel):
    specialization: Optional[str] = None
    license_number: Optional[str] = None
    department: Optional[str] = None
    years_of_experience: Optional[int] = None
    is_available: bool = True

class DoctorCreate(BaseModel):
    username: str
    email: EmailStr
    full_name: str
    phone: str
    password: str
    specialization: Optional[str] = None
    license_number: Optional[str] = None
    department: Optional[str] = None
    years_of_experience: Optional[int] = None
    years_of_experience: Optional[int] = None

class Doctor(DoctorBase):
    id: str
    user_id: str
    created_at: datetime
    user: Optional[User] = None
    
    class Config:
        from_attributes = True

# Nurse schemas
class NurseBase(BaseModel):
    department: Optional[str] = None
    shift: Optional[str] = None
    license_number: Optional[str] = None
    is_available: bool = True

class NurseCreate(BaseModel):
    username: str
    email: EmailStr
    full_name: str
    phone: str
    password: str
    department: Optional[str] = None
    shift: Optional[str] = None
    license_number: Optional[str] = None

class Nurse(NurseBase):
    id: str
    user_id: str
    created_at: datetime
    user: Optional[User] = None
    
    class Config:
        from_attributes = True

# Priority schemas
class PriorityBase(BaseModel):
    name: str
    description: str
    condition_keywords: Optional[str] = None

class PriorityCreate(PriorityBase):
    pass

class Priority(PriorityBase):
    id: str
    created_at: datetime
    
    class Config:
        from_attributes = True

# Appointment schemas
class AppointmentBase(BaseModel):
    date: str
    time: str
    appointment_type: str
    condition: Optional[str] = None
    notes: Optional[str] = None

class AppointmentCreate(AppointmentBase):
    patient_id: str
    doctor_id: str

class AppointmentBooking(BaseModel):
    doctor_id: str
    date: str
    time: str
    appointment_type: str
    condition: str
    notes: Optional[str] = None

class AppointmentUpdate(BaseModel):
    date: Optional[str] = None
    time: Optional[str] = None
    appointment_type: Optional[str] = None
    condition: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[str] = None
    doctor_remarks: Optional[str] = None

class Appointment(AppointmentBase):
    id: str
    patient_id: str
    doctor_id: str
    priority_id: Optional[str] = None
    status: str
    created_at: datetime
    patient_name: Optional[str] = None
    doctor_name: Optional[str] = None
    doctor_remarks: Optional[str] = None
    priority: Optional[Priority] = None
    
    class Config:
        from_attributes = True

# Triage schemas
class VitalsBase(BaseModel):
    blood_pressure: str
    heart_rate: int
    temperature: float
    oxygen_saturation: int
    respiratory_rate: int

class TriageRecordBase(BaseModel):
    symptoms: str
    priority: str
    
class TriageRecordCreate(TriageRecordBase, VitalsBase):
    patient_id: str
    nurse_id: str

class TriageRecord(TriageRecordBase, VitalsBase):
    id: str
    patient_id: str
    nurse_id: str
    status: str
    timestamp: datetime
    patient_name: Optional[str] = None
    nurse_name: Optional[str] = None
    
    class Config:
        from_attributes = True

# Alert schemas
class AlertBase(BaseModel):
    alert_type: str
    title: str
    message: str

class AlertCreate(AlertBase):
    user_id: str

class Alert(AlertBase):
    id: str
    timestamp: datetime
    is_read: bool
    user_id: str
    
    class Config:
        from_attributes = True

# Authentication schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    user: User

class TokenData(BaseModel):
    username: Optional[str] = None

# Dashboard stats schemas
class DashboardStats(BaseModel):
    active_patients: int
    critical_cases: int
    triage_queue: int
    appointments_today: int

class NurseStats(DashboardStats):
    shift_hours: str

class DoctorStats(BaseModel):
    appointments_today: int
    pending_reviews: int
    critical_alerts: int
    avg_wait_time: str

class PatientStats(BaseModel):
    upcoming_appointments: int
    medical_records: int
    triage_priority: str
    last_visit: str

class AdminStats(BaseModel):
    total_patients: int
    active_staff: int
    system_alerts: int
    monthly_appointments: int