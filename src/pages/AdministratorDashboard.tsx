import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCheck, TrendingUp, Building } from 'lucide-react';

const AdministratorDashboard = () => {
  const stats = [
    { label: 'Total Staff', value: '48', icon: Users, color: 'text-blue-600' },
    { label: 'On Duty', value: '32', icon: UserCheck, color: 'text-green-600' },
    { label: 'Bed Occupancy', value: '78%', icon: Building, color: 'text-orange-600' },
    { label: 'Efficiency', value: '94%', icon: TrendingUp, color: 'text-purple-600' },
  ];

  const staffAllocation = [
    { department: 'Emergency', nurses: 8, doctors: 4, status: 'optimal' },
    { department: 'ICU', nurses: 12, doctors: 6, status: 'optimal' },
    { department: 'General Ward', nurses: 10, doctors: 5, status: 'understaffed' },
    { department: 'Pediatrics', nurses: 6, doctors: 3, status: 'optimal' },
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

        <Card>
          <CardHeader>
            <CardTitle>Staff Allocation by Department</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {staffAllocation.map((dept) => (
                <div key={dept.department} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-semibold">{dept.department}</p>
                    <p className="text-sm text-muted-foreground">
                      {dept.nurses} Nurses • {dept.doctors} Doctors
                    </p>
                  </div>
                  <span className={`text-sm font-medium ${dept.status === 'optimal' ? 'text-green-600' : 'text-orange-600'}`}>
                    {dept.status === 'optimal' ? '✓ Optimal' : '⚠ Understaffed'}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdministratorDashboard;
