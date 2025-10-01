import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, AlertCircle, Users, Calendar } from 'lucide-react';

const NurseDashboard = () => {
  const stats = [
    { label: 'Active Patients', value: '24', icon: Users, color: 'text-blue-600' },
    { label: 'Critical Cases', value: '3', icon: AlertCircle, color: 'text-red-600' },
    { label: 'Triage Queue', value: '8', icon: Activity, color: 'text-orange-600' },
    { label: 'Today\'s Shift', value: '6hrs', icon: Calendar, color: 'text-green-600' },
  ];

  const triageQueue = [
    { id: 1, name: 'Emma Wilson', priority: 'critical', vitals: 'BP: 180/110, HR: 120' },
    { id: 2, name: 'James Brown', priority: 'high', vitals: 'BP: 150/95, HR: 95' },
    { id: 3, name: 'Lisa Martinez', priority: 'medium', vitals: 'BP: 130/85, HR: 78' },
  ];

  const priorityColors = {
    critical: 'bg-red-500',
    high: 'bg-orange-500',
    medium: 'bg-yellow-500',
    low: 'bg-green-500',
  };

  return (
    <DashboardLayout title="Nurse Dashboard">
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
            <CardTitle>Triage Queue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {triageQueue.map((patient) => (
                <div key={patient.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <Badge className={`${priorityColors[patient.priority as keyof typeof priorityColors]} text-white`}>
                      {patient.priority.toUpperCase()}
                    </Badge>
                    <div>
                      <p className="font-semibold">{patient.name}</p>
                      <p className="text-sm text-muted-foreground">{patient.vitals}</p>
                    </div>
                  </div>
                  <Badge variant="outline">Assess</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default NurseDashboard;
