import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Users, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Doctor {
  id: string;
  user_id: string;
  specialization?: string;
  license_number?: string;
  department?: string;
  years_of_experience?: number;
  is_available: boolean;
  user?: {
    id: string;
    username: string;
    email: string;
    name: string;
    is_active: boolean;
  };
}

interface Nurse {
  id: string;
  user_id: string;
  department?: string;
  shift?: string;
  license_number?: string;
  is_available: boolean;
  user?: {
    id: string;
    username: string;
    email: string;
    name: string;
    is_active: boolean;
  };
}

const StaffManagement = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [nurses, setNurses] = useState<Nurse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [staffType, setStaffType] = useState<'doctor' | 'nurse'>('doctor');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    name: '',
    password: '',
    specialization: '',
    license_number: '',
    department: '',
    years_of_experience: '',
    shift: ''
  });

  useEffect(() => {
    loadStaff();
  }, []);

  const getAuthHeaders = () => {
    const authData = localStorage.getItem('vitalsfirst_auth');
    if (authData) {
      const { token } = JSON.parse(authData);
      return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };
    }
    return { 'Content-Type': 'application/json' };
  };

  const loadStaff = async () => {
    try {
      const headers = getAuthHeaders();
      
      // Load doctors
      const doctorsResponse = await fetch('http://localhost:8000/admin/doctors/', { headers });
      if (doctorsResponse.ok) {
        const doctorsData = await doctorsResponse.json();
        setDoctors(doctorsData);
      }
      
      // Load nurses
      const nursesResponse = await fetch('http://localhost:8000/admin/nurses/', { headers });
      if (nursesResponse.ok) {
        const nursesData = await nursesResponse.json();
        setNurses(nursesData);
      }
    } catch (error) {
      console.error('Error loading staff:', error);
      toast({
        title: 'Error',
        description: 'Failed to load staff members',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createStaff = async () => {
    if (!formData.username || !formData.email || !formData.name || !formData.password) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      const headers = getAuthHeaders();
      const endpoint = staffType === 'doctor' ? '/admin/doctors/' : '/admin/nurses/';
      
      const requestData: any = {
        username: formData.username,
        email: formData.email,
        name: formData.name,
        password: formData.password,
      };

      if (staffType === 'doctor') {
        if (formData.specialization) requestData.specialization = formData.specialization;
        if (formData.license_number) requestData.license_number = formData.license_number;
        if (formData.department) requestData.department = formData.department;
        if (formData.years_of_experience) requestData.years_of_experience = parseInt(formData.years_of_experience);
      } else {
        if (formData.department) requestData.department = formData.department;
        if (formData.shift) requestData.shift = formData.shift;
        if (formData.license_number) requestData.license_number = formData.license_number;
      }

      const response = await fetch(`http://localhost:8000${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: `${staffType === 'doctor' ? 'Doctor' : 'Nurse'} created successfully`,
        });
        setFormData({
          username: '',
          email: '',
          name: '',
          password: '',
          specialization: '',
          license_number: '',
          department: '',
          years_of_experience: '',
          shift: ''
        });
        setIsDialogOpen(false);
        loadStaff();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create staff member');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const deleteStaff = async (id: string, type: 'doctor' | 'nurse', name: string) => {
    if (!confirm(`Are you sure you want to deactivate ${name}?`)) return;

    try {
      const headers = getAuthHeaders();
      const endpoint = type === 'doctor' ? `/admin/doctors/${id}` : `/admin/nurses/${id}`;
      
      const response = await fetch(`http://localhost:8000${endpoint}`, {
        method: 'DELETE',
        headers,
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: `${name} has been deactivated`,
        });
        loadStaff();
      } else {
        throw new Error('Failed to delete staff member');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete staff member',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Staff Management</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="w-4 h-4 mr-2" />
              Add Staff Member
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Staff Member</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Staff Type</Label>
                <Select value={staffType} onValueChange={(value: 'doctor' | 'nurse') => setStaffType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="doctor">Doctor</SelectItem>
                    <SelectItem value="nurse">Nurse</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Username*</Label>
                  <Input
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    placeholder="Enter username"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Email*</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="Enter email"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Full Name*</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Enter full name"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Password*</Label>
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder="Enter password"
                  />
                </div>
              </div>

              {staffType === 'doctor' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Specialization</Label>
                      <Input
                        value={formData.specialization}
                        onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                        placeholder="e.g., Cardiology"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Years of Experience</Label>
                      <Input
                        type="number"
                        value={formData.years_of_experience}
                        onChange={(e) => setFormData({...formData, years_of_experience: e.target.value})}
                        placeholder="Years"
                      />
                    </div>
                  </div>
                </>
              )}

              {staffType === 'nurse' && (
                <div className="grid gap-2">
                  <Label>Shift</Label>
                  <Select value={formData.shift} onValueChange={(value) => setFormData({...formData, shift: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select shift" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">Morning</SelectItem>
                      <SelectItem value="afternoon">Afternoon</SelectItem>
                      <SelectItem value="night">Night</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Department</Label>
                  <Input
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                    placeholder="e.g., Emergency"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>License Number</Label>
                  <Input
                    value={formData.license_number}
                    onChange={(e) => setFormData({...formData, license_number: e.target.value})}
                    placeholder="License #"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={createStaff}>
                Create {staffType === 'doctor' ? 'Doctor' : 'Nurse'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Doctors */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Doctors ({doctors.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading doctors...</p>
            ) : doctors.length === 0 ? (
              <p className="text-muted-foreground">No doctors found</p>
            ) : (
              <div className="space-y-4">
                {doctors.map((doctor) => (
                  <div key={doctor.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{doctor.user?.name}</h3>
                        <p className="text-sm text-muted-foreground">@{doctor.user?.username}</p>
                        <p className="text-sm text-muted-foreground">{doctor.user?.email}</p>
                        {doctor.specialization && (
                          <Badge variant="outline" className="mt-1">
                            {doctor.specialization}
                          </Badge>
                        )}
                        {doctor.department && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Department: {doctor.department}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteStaff(doctor.id, 'doctor', doctor.user?.name || '')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Nurses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Nurses ({nurses.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading nurses...</p>
            ) : nurses.length === 0 ? (
              <p className="text-muted-foreground">No nurses found</p>
            ) : (
              <div className="space-y-4">
                {nurses.map((nurse) => (
                  <div key={nurse.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{nurse.user?.name}</h3>
                        <p className="text-sm text-muted-foreground">@{nurse.user?.username}</p>
                        <p className="text-sm text-muted-foreground">{nurse.user?.email}</p>
                        {nurse.shift && (
                          <Badge variant="outline" className="mt-1">
                            {nurse.shift} shift
                          </Badge>
                        )}
                        {nurse.department && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Department: {nurse.department}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteStaff(nurse.id, 'nurse', nurse.user?.name || '')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StaffManagement;