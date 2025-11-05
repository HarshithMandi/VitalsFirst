from sqlalchemy import create_engine, Column, String, Integer, DateTime, Text, Float, Boolean, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.sql import func
import uuid
from datetime import datetime

import os

SQLALCHEMY_DATABASE_URL = f"sqlite:///{os.path.dirname(os.path.abspath(__file__))}/vitals_hub.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    hashed_password = Column(String, nullable=False)
    role = Column(String, nullable=False)  # nurse, doctor, administrator, patient
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    is_active = Column(Boolean, default=True)
    
    # Relationships
    patient_profile = relationship("Patient", back_populates="user", uselist=False)

class Patient(Base):
    __tablename__ = "patients"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), unique=True)
    age = Column(Integer)
    gender = Column(String)
    medical_history = Column(Text)
    contact_number = Column(String)
    registration_date = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="patient_profile")
    triage_records = relationship("TriageRecord", back_populates="patient")

class Doctor(Base):
    __tablename__ = "doctors"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), unique=True)
    specialization = Column(String)
    license_number = Column(String, unique=True)
    department = Column(String)
    years_of_experience = Column(Integer)
    is_available = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", foreign_keys=[user_id])
    appointments = relationship("Appointment", back_populates="doctor")

class Nurse(Base):
    __tablename__ = "nurses"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), unique=True)
    department = Column(String)
    shift = Column(String)  # morning, afternoon, night
    license_number = Column(String, unique=True)
    is_available = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", foreign_keys=[user_id])
    triage_records = relationship("TriageRecord", back_populates="nurse")

class Priority(Base):
    __tablename__ = "priorities"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, unique=True, nullable=False)  # high, medium, low
    description = Column(String, nullable=False)
    condition_keywords = Column(Text)  # JSON array of keywords that trigger this priority
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    appointments = relationship("Appointment", back_populates="priority")

class Appointment(Base):
    __tablename__ = "appointments"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    patient_id = Column(String, ForeignKey("users.id"))
    doctor_id = Column(String, ForeignKey("doctors.id"))
    priority_id = Column(String, ForeignKey("priorities.id"))
    date = Column(String, nullable=False)
    time = Column(String, nullable=False)
    appointment_type = Column(String, nullable=False)
    condition = Column(String)  # Patient's condition/symptoms
    status = Column(String, default="pending")  # pending, completed, cancelled
    notes = Column(Text)
    doctor_remarks = Column(Text)  # New field for doctor's remarks
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    patient = relationship("User", foreign_keys=[patient_id])
    doctor = relationship("Doctor", back_populates="appointments")
    priority = relationship("Priority", back_populates="appointments")

class TriageRecord(Base):
    __tablename__ = "triage_records"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    patient_id = Column(String, ForeignKey("patients.id"))
    nurse_id = Column(String, ForeignKey("nurses.id"))
    blood_pressure = Column(String)
    heart_rate = Column(Integer)
    temperature = Column(Float)
    oxygen_saturation = Column(Integer)
    respiratory_rate = Column(Integer)
    symptoms = Column(Text)
    priority = Column(String)  # critical, high, medium, low
    status = Column(String, default="pending")  # pending, in-progress, completed
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    patient = relationship("Patient", back_populates="triage_records")
    nurse = relationship("Nurse", back_populates="triage_records")

class Alert(Base):
    __tablename__ = "alerts"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    alert_type = Column(String, nullable=False)  # emergency, warning, info
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    is_read = Column(Boolean, default=False)
    user_id = Column(String, ForeignKey("users.id"))

# Create tables
def create_tables():
    Base.metadata.create_all(bind=engine)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()