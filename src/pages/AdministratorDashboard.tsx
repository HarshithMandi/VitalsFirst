import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, UserCheck, TrendingUp, Building, Calendar, FileText, AlertTriangle, User, UserPlus, Settings } from 'lucide-react';
import { appointmentsApi, patientsApi, usersApi } from '@/services/api';
import { toast } from '@/hooks/use-toast';

interface Appointment {
  id: string;
  date: string;
  time: string;
  patient_name: string;
  doctor_name?: string;
  appointment_type: string;
  condition: string;
  status: string;
  priority?: {
    name: string;
    description: string;
  };
}

const AdministratorDashboard = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load appointments
      const appointmentsResponse = await appointmentsApi.getAppointments();
      if (appointmentsResponse.data) {
        setAppointments(appointmentsResponse.data);
      }

      // Load patients
      const patientsResponse = await patientsApi.getPatients();
      if (patientsResponse.data) {
        setPatients(patientsResponse.data);
      }

      // Load staff
      const staffResponse = await usersApi.getUsers();
      if (staffResponse.data) {
        const staffMembers = staffResponse.data.filter((user: any) => 
          ['nurse', 'doctor'].includes(user.role)
        );
        setStaff(staffMembers);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkConsulted = async (appointmentId: string) => {
    try {
      const response = await appointmentsApi.markConsulted(appointmentId, 'Completed by admin');
      
      if (response.error) {
        toast({
          title: 'Error',
          description: response.error,
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Success',
        description: 'Appointment marked as consulted.',
      });

      loadDashboardData(); // Refresh data
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update appointment.',
        variant: 'destructive',
      });
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const pendingAppointments = appointments.filter(apt => apt.status === 'pending');
  const completedAppointments = appointments.filter(apt => apt.status === 'completed');
  const highPriorityAppointments = appointments.filter(apt => apt.priority?.name === 'high');

  const stats = [
    { label: 'Total Patients', value: patients.length.toString(), icon: Users, color: 'text-blue-600' },
    { label: 'Active Staff', value: staff.length.toString(), icon: UserCheck, color: 'text-green-600' },
    { label: 'Pending Appointments', value: pendingAppointments.length.toString(), icon: Calendar, color: 'text-orange-600' },
    { label: 'High Priority Cases', value: highPriorityAppointments.length.toString(), icon: AlertTriangle, color: 'text-red-600' },
  ];

  return (
    <DashboardLayout title="Administrator Dashboard">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => {
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

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/administrator/staff')}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Staff Management</p>
                  <p className="text-lg font-semibold mt-1">Manage Doctors & Nurses</p>
                </div>
                <UserPlus className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">System Settings</p>
                  <p className="text-lg font-semibold mt-1">Configure System</p>
                </div>
                <Settings className="w-8 h-8 text-gray-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Reports</p>
                  <p className="text-lg font-semibold mt-1">View Analytics</p>
                </div>
                <FileText className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Appointment Management */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Appointments */}
          <Card>
            <CardHeader>
              <CardTitle>Pending Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p>Loading appointments...</p>
              ) : pendingAppointments.length === 0 ? (
                <p className="text-muted-foreground">No pending appointments</p>
              ) : (
                <div className="space-y-4">
                  {pendingAppointments.slice(0, 5).map((apt) => (
                    <div key={apt.id} className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="text-center min-w-[60px]">
                            <p className="text-sm font-semibold">{apt.time}</p>
                            <p className="text-xs text-muted-foreground">{apt.date}</p>
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
                            {apt.doctor_name && (
                              <p className="text-sm text-muted-foreground">Dr. {apt.doctor_name}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm"
                            onClick={() => handleMarkConsulted(apt.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Mark Consulted
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Completed Appointments */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Completed Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p>Loading completed appointments...</p>
              ) : completedAppointments.length === 0 ? (
                <p className="text-muted-foreground">No completed appointments</p>
              ) : (
                <div className="space-y-4">
                  {completedAppointments.slice(0, 5).map((apt) => (
                    <div key={apt.id} className="p-4 border rounded-lg bg-green-50 dark:bg-green-950/10">
                      <div className="flex items-center gap-3">
                        <div className="text-center min-w-[60px]">
                          <p className="text-sm font-semibold">{apt.time}</p>
                          <p className="text-xs text-muted-foreground">{apt.date}</p>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <User className="w-4 h-4" />
                            <p className="font-semibold">{apt.patient_name}</p>
                            <Badge variant="outline" className="text-green-600 border-green-600 text-xs">
                              COMPLETED
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{apt.appointment_type}</p>
                          <p className="text-sm"><strong>Condition:</strong> {apt.condition}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* System Overview */}
        <Card>
          <CardHeader>
            <CardTitle>System Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{patients.length}</div>
                <p className="text-sm text-muted-foreground">Total Patients</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{staff.length}</div>
                <p className="text-sm text-muted-foreground">Active Staff</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{appointments.length}</div>
                <p className="text-sm text-muted-foreground">Total Appointments</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdministratorDashboard;
