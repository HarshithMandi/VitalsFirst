import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, User, Calendar, FileText, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PatientDashboard = () => {
  const navigate = useNavigate();

  return (
    <DashboardLayout title="Patient Dashboard">
      <div className="space-y-6">
        {/* Book Appointment Button */}
        <div className="flex justify-end">
          <Button 
            onClick={() => navigate('/book-appointment')}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Book New Appointment
          </Button>
        </div>

        {/* Last Visit Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6 text-orange-600" />
              <CardTitle>Last Visit</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Visit Date</p>
                    <p className="font-semibold">October 15, 2024</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Doctor</p>
                    <p className="font-semibold">Dr. Sarah Johnson</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Visit Type</p>
                    <p className="font-semibold">Regular Checkup</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Diagnosis</p>
                  <p className="font-semibold">Routine Health Assessment</p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Status</p>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Completed
                  </span>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <p className="text-sm text-muted-foreground mb-2">Doctor's Notes</p>
              <p className="text-sm bg-blue-50 text-blue-800 p-4 rounded-lg border border-blue-200">
                Patient is in good health. Blood pressure and heart rate are normal. 
                Continue current medication regimen. Schedule follow-up in 6 months.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default PatientDashboard;
