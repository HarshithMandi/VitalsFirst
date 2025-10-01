import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, FileText, AlertTriangle } from 'lucide-react';

const DoctorDashboard = () => {
  const stats = [
    { label: 'Today\'s Appointments', value: '12', icon: Calendar, color: 'text-blue-600' },
    { label: 'Pending Reviews', value: '5', icon: FileText, color: 'text-purple-600' },
    { label: 'Critical Alerts', value: '2', icon: AlertTriangle, color: 'text-red-600' },
    { label: 'Avg Wait Time', value: '15m', icon: Clock, color: 'text-green-600' },
  ];

  const appointments = [
    { id: 1, time: '09:00 AM', patient: 'Sarah Johnson', type: 'Follow-up', status: 'scheduled' },
    { id: 2, time: '10:00 AM', patient: 'Mike Davis', type: 'Consultation', status: 'in-progress' },
    { id: 3, time: '11:30 AM', patient: 'Emily Chen', type: 'Check-up', status: 'scheduled' },
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

        <Card>
          <CardHeader>
            <CardTitle>Today's Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {appointments.map((apt) => (
                <div key={apt.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-sm font-semibold">{apt.time}</p>
                    </div>
                    <div>
                      <p className="font-semibold">{apt.patient}</p>
                      <p className="text-sm text-muted-foreground">{apt.type}</p>
                    </div>
                  </div>
                  <Badge variant={apt.status === 'in-progress' ? 'default' : 'outline'}>
                    {apt.status === 'in-progress' ? 'In Progress' : 'Scheduled'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DoctorDashboard;
