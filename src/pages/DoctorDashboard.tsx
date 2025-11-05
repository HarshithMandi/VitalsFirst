import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, Clock, FileText, AlertTriangle, User, CheckCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { appointmentsApi } from '@/services/api';

interface Appointment {
  id: string;
  date: string;
  time: string;
  patient_name: string;
  patient_id: string;
  appointment_type: string;
  condition: string;
  status: string;
  notes?: string;
  doctor_remarks?: string;
  priority?: {
    name: string;
    description: string;
  };
}

const DoctorDashboard = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [consultDialogOpen, setConsultDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [doctorRemarks, setDoctorRemarks] = useState('');

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      const response = await appointmentsApi.getAppointments();
      if (response.data) {
        setAppointments(response.data);
      }
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConsultation = async () => {
    if (!selectedAppointment) return;

    try {
      const response = await appointmentsApi.markConsulted(selectedAppointment.id, doctorRemarks);
      
      if (response.error) {
        toast({
          title: 'Error',
          description: response.error,
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Consultation Completed',
        description: 'Appointment has been marked as consulted.',
      });

      setConsultDialogOpen(false);
      setDoctorRemarks('');
      setSelectedAppointment(null);
      loadAppointments(); // Refresh the list
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to complete consultation.',
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

  const stats = [
    { label: 'Today\'s Appointments', value: pendingAppointments.length.toString(), icon: Calendar, color: 'text-blue-600' },
    { label: 'Pending Reviews', value: pendingAppointments.length.toString(), icon: FileText, color: 'text-purple-600' },
    { label: 'Completed Today', value: completedAppointments.length.toString(), icon: CheckCircle, color: 'text-green-600' },
    { label: 'High Priority', value: appointments.filter(apt => apt.priority?.name === 'high').length.toString(), icon: AlertTriangle, color: 'text-red-600' },
  ];

  return (
    <DashboardLayout title="Doctor Dashboard">
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
                {pendingAppointments.map((apt) => (
                  <div key={apt.id} className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="text-center min-w-[80px]">
                          <p className="text-sm font-semibold">{apt.time}</p>
                          <p className="text-xs text-muted-foreground">{apt.date}</p>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <User className="w-4 h-4" />
                            <p className="font-semibold">{apt.patient_name}</p>
                            {apt.priority && (
                              <Badge className={`text-xs ${getPriorityColor(apt.priority.name)}`}>
                                {apt.priority.name.toUpperCase()} PRIORITY
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{apt.appointment_type}</p>
                          <p className="text-sm"><strong>Condition:</strong> {apt.condition}</p>
                          {apt.notes && (
                            <p className="text-sm text-muted-foreground mt-1"><strong>Notes:</strong> {apt.notes}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Dialog open={consultDialogOpen} onOpenChange={setConsultDialogOpen}>
                          <DialogTrigger asChild>
                            <Button 
                              onClick={() => setSelectedAppointment(apt)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Consulted
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle>Complete Consultation</DialogTitle>
                              <DialogDescription>
                                Mark appointment as consulted and add your remarks.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label>Patient: {selectedAppointment?.patient_name}</Label>
                                <p className="text-sm text-muted-foreground">
                                  Condition: {selectedAppointment?.condition}
                                </p>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="doctor_remarks">Doctor's Remarks</Label>
                                <Textarea
                                  id="doctor_remarks"
                                  value={doctorRemarks}
                                  onChange={(e) => setDoctorRemarks(e.target.value)}
                                  placeholder="Enter your diagnosis, treatment plan, or notes..."
                                  rows={4}
                                />
                              </div>
                              <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setConsultDialogOpen(false)}>
                                  Cancel
                                </Button>
                                <Button onClick={handleConsultation}>
                                  Complete Consultation
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Completed Appointments */}
        {completedAppointments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Completed Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {completedAppointments.map((apt) => (
                  <div key={apt.id} className="p-4 border rounded-lg bg-green-50 dark:bg-green-950/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="text-center min-w-[80px]">
                          <p className="text-sm font-semibold">{apt.time}</p>
                          <p className="text-xs text-muted-foreground">{apt.date}</p>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <User className="w-4 h-4" />
                            <p className="font-semibold">{apt.patient_name}</p>
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              COMPLETED
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{apt.appointment_type}</p>
                          <p className="text-sm"><strong>Condition:</strong> {apt.condition}</p>
                          {apt.doctor_remarks && (
                            <p className="text-sm mt-1"><strong>Remarks:</strong> {apt.doctor_remarks}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DoctorDashboard;
