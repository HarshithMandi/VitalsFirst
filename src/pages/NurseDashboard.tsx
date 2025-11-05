import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, AlertCircle, Users, Calendar, User, FileText } from 'lucide-react';
import { useEffect, useState } from 'react';
import { dashboardApi, triageApi, appointmentsApi, patientsApi } from '@/services/api';

interface TriageRecord {
  id: string;
  priority: string;
  patient_name?: string;
  blood_pressure?: string;
  heart_rate?: number;
  symptoms?: string;
  timestamp: string;
}

interface Appointment {
  id: string;
  date: string;
  time: string;
  patient_name: string;
  patient_id: string;
  appointment_type: string;
  condition: string;
  status: string;
  priority?: {
    name: string;
    description: string;
  };
}

interface PatientDetails {
  id: string;
  user_id: string;
  age?: number;
  gender?: string;
  medical_history?: string;
  contact_number?: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

const NurseDashboard = () => {
  const [stats, setStats] = useState({
    active_patients: 0,
    critical_cases: 0,
    triage_queue: 0,
    appointments_today: 0,
    shift_hours: '6hrs'
  });
  const [triageQueue, setTriageQueue] = useState<TriageRecord[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<PatientDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch dashboard stats
        const statsResponse = await dashboardApi.getStats();
        if (statsResponse.data) {
          setStats(statsResponse.data as any);
        }

        // Fetch pending triage records
        const triageResponse = await triageApi.getTriageRecords(undefined, 'pending');
        if (triageResponse.data && Array.isArray(triageResponse.data)) {
          setTriageQueue(triageResponse.data.slice(0, 5)); // Show first 5
        }

        // Fetch today's appointments
        const appointmentsResponse = await appointmentsApi.getAppointments();
        if (appointmentsResponse.data && Array.isArray(appointmentsResponse.data)) {
          setAppointments(appointmentsResponse.data.slice(0, 5)); // Show first 5
        }

        // Fetch patients list
        const patientsResponse = await patientsApi.getPatients(0, 10);
        if (patientsResponse.data && Array.isArray(patientsResponse.data)) {
          setPatients(patientsResponse.data);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const statsDisplay = [
    { label: 'Active Patients', value: patients.length.toString(), icon: Users, color: 'text-blue-600' },
    { label: 'Critical Cases', value: stats.critical_cases.toString(), icon: AlertCircle, color: 'text-red-600' },
    { label: 'Triage Queue', value: triageQueue.length.toString(), icon: Activity, color: 'text-orange-600' },
    { label: 'Today\'s Appointments', value: appointments.length.toString(), icon: Calendar, color: 'text-green-600' },
  ];

  const priorityColors = {
    critical: 'bg-red-500',
    high: 'bg-red-500',
    medium: 'bg-yellow-500',
    low: 'bg-green-500',
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <DashboardLayout title="Nurse Dashboard">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsDisplay.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-3xl font-bold mt-2">{stat.value}</p>
                    </div>
                    <Icon className={`w-10 h-10 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Triage Queue */}
          <Card>
            <CardHeader>
              <CardTitle>Triage Queue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  <p>Loading triage queue...</p>
                ) : triageQueue.length > 0 ? (
                  triageQueue.map((patient) => (
                    <div key={patient.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <Badge className={`${priorityColors[patient.priority as keyof typeof priorityColors]} text-white`}>
                          {patient.priority.toUpperCase()}
                        </Badge>
                        <div>
                          <p className="font-semibold">{patient.patient_name || 'Unknown Patient'}</p>
                          <p className="text-sm text-muted-foreground">
                            {patient.blood_pressure && `BP: ${patient.blood_pressure}`}
                            {patient.heart_rate && `, HR: ${patient.heart_rate}`}
                          </p>
                          {patient.symptoms && (
                            <p className="text-sm text-muted-foreground">Symptoms: {patient.symptoms}</p>
                          )}
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Assess
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground">No pending triage records</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Today's Appointments */}
          <Card>
            <CardHeader>
              <CardTitle>Today's Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  <p>Loading appointments...</p>
                ) : appointments.length > 0 ? (
                  appointments.map((apt) => (
                    <div key={apt.id} className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-center min-w-[60px]">
                            <p className="text-sm font-semibold">{apt.time}</p>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <User className="w-4 h-4" />
                              <p className="font-semibold">{apt.patient_name}</p>
                              {apt.priority && (
                                <Badge className={`text-xs ${getPriorityColor(apt.priority.name)}`}>
                                  {apt.priority.name.toUpperCase()}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{apt.appointment_type}</p>
                            <p className="text-sm"><strong>Condition:</strong> {apt.condition}</p>
                          </div>
                        </div>
                        <Badge variant={apt.status === 'pending' ? 'outline' : 'default'}>
                          {apt.status.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground">No appointments today</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Patient Information Access */}
        <Card>
          <CardHeader>
            <CardTitle>Patient Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <p>Loading patient information...</p>
              ) : patients.length > 0 ? (
                patients.map((patient) => (
                  <div key={patient.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <User className="w-8 h-8 text-blue-600" />
                      <div>
                        <p className="font-semibold">{patient.user.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {patient.age && `Age: ${patient.age}`}
                          {patient.gender && `, Gender: ${patient.gender}`}
                        </p>
                        {patient.contact_number && (
                          <p className="text-sm text-muted-foreground">Contact: {patient.contact_number}</p>
                        )}
                        {patient.medical_history && (
                          <p className="text-sm text-gray-600 mt-1">Medical History: {patient.medical_history}</p>
                        )}
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <FileText className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground">No patient records available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default NurseDashboard;
