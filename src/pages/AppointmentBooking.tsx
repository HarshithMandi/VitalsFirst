import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, ArrowLeft, User } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { authApi } from '@/services/api';

interface Doctor {
  id: string;
  name: string;
  username: string;
  email: string;
}

const AppointmentBooking = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [formData, setFormData] = useState({
    doctor_id: '',
    date: '',
    time: '',
    appointment_type: 'consultation',
    condition: '',
    notes: ''
  });

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    try {
      const response = await authApi.getDoctors();
      if (response.data) {
        setDoctors(response.data);
      }
    } catch (error) {
      console.error('Error loading doctors:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.doctor_id || !formData.date || !formData.time || !formData.condition) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    
    try {
      const response = await authApi.bookAppointment(formData);

      if (response.error) {
        toast({
          title: 'Booking Failed',
          description: response.error,
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Appointment Booked',
        description: 'Your appointment has been successfully scheduled.',
      });

      navigate('/patient');
    } catch (error) {
      toast({
        title: 'Booking Failed',
        description: 'Network error. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const conditionOptions = [
    { value: 'fever', label: 'Fever' },
    { value: 'cold', label: 'Cold/Flu' },
    { value: 'headache', label: 'Headache' },
    { value: 'chest pain', label: 'Chest Pain' },
    { value: 'difficulty breathing', label: 'Difficulty Breathing' },
    { value: 'injury', label: 'Injury/Fracture' },
    { value: 'severe pain', label: 'Severe Pain' },
    { value: 'heart attack', label: 'Heart Attack' },
    { value: 'stroke', label: 'Stroke' },
    { value: 'cancer', label: 'Cancer Related' },
    { value: 'diabetes complication', label: 'Diabetes Complication' },
    { value: 'checkup', label: 'Routine Checkup' },
    { value: 'consultation', label: 'General Consultation' },
    { value: 'other', label: 'Other' }
  ];

  const appointmentTypes = [
    { value: 'consultation', label: 'Consultation' },
    { value: 'checkup', label: 'Health Checkup' },
    { value: 'follow-up', label: 'Follow-up' },
    { value: 'emergency', label: 'Emergency' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-background flex items-center justify-center p-6">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <Button
            variant="ghost"
            size="sm"
            className="w-fit mb-4"
            onClick={() => navigate('/patient')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex items-center gap-3">
            <Calendar className="w-8 h-8 text-blue-600" />
            <div>
              <CardTitle className="text-2xl">Book Appointment</CardTitle>
              <CardDescription>
                Schedule a new appointment with our healthcare professionals
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Doctor Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">Doctor & Schedule</h3>
              <div className="space-y-2">
                <Label htmlFor="doctor_id">Select Doctor *</Label>
                <Select onValueChange={(value) => handleInputChange('doctor_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          Dr. {doctor.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Time *</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="time"
                      type="time"
                      value={formData.time}
                      onChange={(e) => handleInputChange('time', e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Appointment Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">Appointment Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="appointment_type">Appointment Type</Label>
                  <Select onValueChange={(value) => handleInputChange('appointment_type', value)} defaultValue="consultation">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {appointmentTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="condition">Condition/Symptoms *</Label>
                  <Select onValueChange={(value) => handleInputChange('condition', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your condition" />
                    </SelectTrigger>
                    <SelectContent>
                      {conditionOptions.map((condition) => (
                        <SelectItem key={condition.value} value={condition.value}>
                          {condition.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Describe your symptoms or any additional information"
                  rows={4}
                />
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Priority Assignment</h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Your appointment priority will be automatically assigned based on your condition:
              </p>
              <ul className="text-sm text-blue-700 dark:text-blue-300 mt-2 list-disc list-inside">
                <li><strong>High Priority:</strong> Emergency conditions (chest pain, breathing issues, stroke, etc.)</li>
                <li><strong>Medium Priority:</strong> Serious conditions (injuries, infections, complications)</li>
                <li><strong>Low Priority:</strong> General consultations and routine checkups</li>
              </ul>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700" 
              disabled={loading}
            >
              {loading ? 'Booking Appointment...' : 'Book Appointment'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AppointmentBooking;