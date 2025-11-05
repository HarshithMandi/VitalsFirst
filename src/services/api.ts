const API_BASE_URL = 'http://localhost:8000';

// API response types
interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
}

// HTTP client with auth header
class ApiClient {
  private baseURL: string;
  
  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private getAuthHeaders(): Record<string, string> {
    const authData = localStorage.getItem('vitalsfirst_auth');
    if (authData) {
      const { token } = JSON.parse(authData);
      return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };
    }
    return {
      'Content-Type': 'application/json',
    };
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const config: RequestInit = {
        ...options,
        headers: {
          ...this.getAuthHeaders(),
          ...options.headers,
        },
      };

      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        return {
          error: data.detail || 'Request failed',
          status: response.status,
        };
      }

      return {
        data,
        status: response.status,
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Network error',
        status: 0,
      };
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async put<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

const apiClient = new ApiClient(API_BASE_URL);

// Auth API
export const authApi = {
  login: async (username: string, password: string, role: string) => {
    return apiClient.post('/auth/login', { username, password, role });
  },

  register: async (userData: {
    username: string;
    email: string;
    name: string;
    role: string;
    password: string;
  }) => {
    return apiClient.post('/auth/register', userData);
  },

  registerPatient: async (patientData: {
    username: string;
    email: string;
    name: string;
    password: string;
    age?: number;
    gender?: string;
    medical_history?: string;
    contact_number?: string;
  }) => {
    return apiClient.post('/auth/register-patient', patientData);
  },

  getCurrentUser: async () => {
    return apiClient.get('/auth/me');
  },

  getDoctors: async () => {
    return apiClient.get('/doctors/');
  },

  bookAppointment: async (appointmentData: {
    doctor_id: string;
    date: string;
    time: string;
    appointment_type: string;
    condition: string;
    notes?: string;
  }) => {
    return apiClient.post('/appointments/book', appointmentData);
  },
};

// Users API
export const usersApi = {
  getUsers: async (skip = 0, limit = 100) => {
    return apiClient.get(`/users/?skip=${skip}&limit=${limit}`);
  },

  getUser: async (userId: string) => {
    return apiClient.get(`/users/${userId}`);
  },
};

// Patients API
export const patientsApi = {
  getPatients: async (skip = 0, limit = 100) => {
    return apiClient.get(`/patients/?skip=${skip}&limit=${limit}`);
  },

  getPatient: async (patientId: string) => {
    return apiClient.get(`/patients/${patientId}`);
  },

  updatePatient: async (patientId: string, patientData: any) => {
    return apiClient.put(`/patients/${patientId}`, patientData);
  },
};

// Appointments API
export const appointmentsApi = {
  getAppointments: async (skip = 0, limit = 100) => {
    return apiClient.get(`/appointments/?skip=${skip}&limit=${limit}`);
  },

  createAppointment: async (appointmentData: {
    patient_id: string;
    doctor_id: string;
    date: string;
    time: string;
    appointment_type: string;
    notes?: string;
  }) => {
    return apiClient.post('/appointments/', appointmentData);
  },

  updateAppointment: async (appointmentId: string, appointmentData: any) => {
    return apiClient.put(`/appointments/${appointmentId}`, appointmentData);
  },

  deleteAppointment: async (appointmentId: string) => {
    return apiClient.delete(`/appointments/${appointmentId}`);
  },

  markConsulted: async (appointmentId: string, doctorRemarks: string = '') => {
    return apiClient.put(`/appointments/${appointmentId}/consult`, { doctor_remarks: doctorRemarks });
  },
};

// Triage API
export const triageApi = {
  getTriageRecords: async (priority?: string, status?: string) => {
    const params = new URLSearchParams();
    if (priority) params.append('priority', priority);
    if (status) params.append('status', status);
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiClient.get(`/triage/${query}`);
  },

  createTriageRecord: async (triageData: {
    patient_id: string;
    nurse_id: string;
    blood_pressure: string;
    heart_rate: number;
    temperature: number;
    oxygen_saturation: number;
    respiratory_rate: number;
    symptoms: string;
    priority: string;
  }) => {
    return apiClient.post('/triage/', triageData);
  },

  updateTriageRecord: async (triageId: string, status: string) => {
    return apiClient.put(`/triage/${triageId}`, { status });
  },
};

// Alerts API
export const alertsApi = {
  getAlerts: async (unreadOnly = false) => {
    const query = unreadOnly ? '?unread_only=true' : '';
    return apiClient.get(`/alerts/${query}`);
  },

  createAlert: async (alertData: {
    alert_type: string;
    title: string;
    message: string;
    user_id: string;
  }) => {
    return apiClient.post('/alerts/', alertData);
  },

  markAlertRead: async (alertId: string) => {
    return apiClient.put(`/alerts/${alertId}/read`, {});
  },
};

// Dashboard API
export const dashboardApi = {
  getStats: async () => {
    return apiClient.get('/dashboard/stats');
  },
};

export default apiClient;