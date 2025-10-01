import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, FileText, Activity, Clock } from 'lucide-react';

const PatientDashboard = () => {
  const stats = [
    { label: 'Upcoming Appointments', value: '2', icon: Calendar, color: 'text-blue-600' },
    { label: 'Medical Records', value: '8', icon: FileText, color: 'text-purple-600' },
    { label: 'Triage Priority', value: 'Low', icon: Activity, color: 'text-green-600' },
    { label: 'Last Visit', value: '12d', icon: Clock, color: 'text-orange-600' },
  ];

  const appointments = [
    { id: 1, date: '2025-10-05', time: '10:00 AM', doctor: 'Dr. Michael Chen', type: 'Check-up', status: 'scheduled' },
    { id: 2, date: '2025-10-12', time: '02:30 PM', doctor: 'Dr. Sarah Williams', type: 'Follow-up', status: 'scheduled' },
  ];

  return (
    <DashboardLayout title="Patient Dashboard">
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>My Appointments</CardTitle>
            <Button>Book New Appointment</Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {appointments.map((apt) => (
                <div key={apt.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="text-center min-w-[80px]">
                      <p className="text-xs text-muted-foreground">{apt.date}</p>
                      <p className="text-sm font-semibold">{apt.time}</p>
                    </div>
                    <div>
                      <p className="font-semibold">{apt.doctor}</p>
                      <p className="text-sm text-muted-foreground">{apt.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{apt.status}</Badge>
                    <Button variant="ghost" size="sm">Reschedule</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default PatientDashboard;
