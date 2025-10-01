export type UserRole = 'nurse' | 'doctor' | 'administrator' | 'patient';

export interface User {
  id: string;
  username: string;
  role: UserRole;
  name: string;
  email: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export type Priority = 'critical' | 'high' | 'medium' | 'low';

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  medicalHistory: string;
  contactNumber: string;
  email: string;
  registrationDate: string;
}

export interface Vitals {
  bloodPressure: string;
  heartRate: number;
  temperature: number;
  oxygenSaturation: number;
  respiratoryRate: number;
}

export interface TriageRecord {
  id: string;
  patientId: string;
  patientName: string;
  vitals: Vitals;
  symptoms: string;
  priority: Priority;
  assignedNurse: string;
  timestamp: string;
  status: 'pending' | 'in-progress' | 'completed';
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  type: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
}

export interface Alert {
  id: string;
  type: 'emergency' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}
