import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Trash2, UserPlus, Stethoscope, Heart, ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Doctor {
  id: number
  specialization: string
  license_number: string
  years_of_experience: number
  department: string
  user: {
    id: number
    username: string
    email: string
    full_name: string
    phone: string
    is_active: boolean
  }
}

interface Nurse {
  id: number
  department: string
  shift: string
  license_number: string
  user: {
    id: number
    username: string
    email: string
    full_name: string
    phone: string
    is_active: boolean
  }
}

interface User {
  id: number
  username: string
  email: string
  name: string
  phone: string
  role: string
  is_active: boolean
}

interface DoctorFormData {
  username: string
  email: string
  full_name: string
  phone: string
  password: string
  specialization: string
  license_number: string
  years_of_experience: number
  department: string
}

interface NurseFormData {
  username: string
  email: string
  full_name: string
  phone: string
  password: string
  department: string
  shift: string
  license_number: string
}

const API_BASE_URL = 'http://localhost:8000'

export default function StaffManagement() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [nurses, setNurses] = useState<Nurse[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('doctors')
  const { toast } = useToast()
  const navigate = useNavigate()

  const [doctorForm, setDoctorForm] = useState<DoctorFormData>({
    username: '',
    email: '',
    full_name: '',
    phone: '',
    password: '',
    specialization: '',
    license_number: '',
    years_of_experience: 0,
    department: ''
  })

  const [nurseForm, setNurseForm] = useState<NurseFormData>({
    username: '',
    email: '',
    full_name: '',
    phone: '',
    password: '',
    department: '',
    shift: '',
    license_number: ''
  })

  const getAuthHeaders = () => {
    const authData = localStorage.getItem('vitalsfirst_auth')
    if (authData) {
      const { token } = JSON.parse(authData)
      return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
    return {
      'Content-Type': 'application/json'
    }
  }

  const fetchDoctors = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/admin/doctors/`, {
        headers: getAuthHeaders()
      })
      if (response.ok) {
        const data = await response.json()
        setDoctors(data)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch doctors",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to connect to server",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchNurses = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/admin/nurses/`, {
        headers: getAuthHeaders()
      })
      if (response.ok) {
        const data = await response.json()
        setNurses(data)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch nurses",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to connect to server",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/admin/users/`, {
        headers: getAuthHeaders()
      })
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch users",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to connect to server",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDoctorSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/admin/doctors/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(doctorForm)
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Doctor added successfully"
        })
        setDoctorForm({
          username: '',
          email: '',
          full_name: '',
          phone: '',
          password: '',
          specialization: '',
          license_number: '',
          years_of_experience: 0,
          department: ''
        })
        fetchDoctors()
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.detail || "Failed to add doctor",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to connect to server",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleNurseSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/admin/nurses/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(nurseForm)
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Nurse added successfully"
        })
        setNurseForm({
          username: '',
          email: '',
          full_name: '',
          phone: '',
          password: '',
          department: '',
          shift: '',
          license_number: ''
        })
        fetchNurses()
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.detail || "Failed to add nurse",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to connect to server",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteDoctor = async (doctorId: number) => {
    if (!confirm('Are you sure you want to permanently delete this doctor? This action cannot be undone.')) {
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/admin/doctors/${doctorId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Doctor deleted successfully"
        })
        fetchDoctors()
      } else {
        toast({
          title: "Error",
          description: "Failed to delete doctor",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to connect to server",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleToggleDoctorStatus = async (doctorId: number) => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/admin/doctors/${doctorId}/toggle-status`, {
        method: 'PATCH',
        headers: getAuthHeaders()
      })

      if (response.ok) {
        const result = await response.json()
        toast({
          title: "Success",
          description: result.message
        })
        fetchDoctors()
      } else {
        toast({
          title: "Error",
          description: "Failed to toggle doctor status",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to connect to server",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteNurse = async (nurseId: number) => {
    if (!confirm('Are you sure you want to permanently delete this nurse? This action cannot be undone.')) {
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/admin/nurses/${nurseId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Nurse deleted successfully"
        })
        fetchNurses()
      } else {
        toast({
          title: "Error",
          description: "Failed to delete nurse",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to connect to server",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleToggleNurseStatus = async (nurseId: number) => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/admin/nurses/${nurseId}/toggle-status`, {
        method: 'PATCH',
        headers: getAuthHeaders()
      })

      if (response.ok) {
        const result = await response.json()
        toast({
          title: "Success",
          description: result.message
        })
        fetchNurses()
      } else {
        toast({
          title: "Error",
          description: "Failed to toggle nurse status",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to connect to server",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Are you sure you want to permanently delete this user? This action cannot be undone.')) {
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "User deleted successfully"
        })
        fetchUsers()
      } else {
        toast({
          title: "Error",
          description: "Failed to delete user",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to connect to server",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleToggleUserStatus = async (userId: number) => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/toggle-status`, {
        method: 'PATCH',
        headers: getAuthHeaders()
      })

      if (response.ok) {
        const result = await response.json()
        toast({
          title: "Success",
          description: result.message
        })
        fetchUsers()
      } else {
        toast({
          title: "Error",
          description: "Failed to toggle user status",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to connect to server",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDoctors()
    fetchNurses()
    fetchUsers()
  }, [])

  const departments = [
    'Emergency',
    'Cardiology',
    'Neurology',
    'Orthopedics',
    'Pediatrics',
    'Internal Medicine',
    'Surgery',
    'Radiology',
    'Pathology',
    'ICU'
  ]

  const specializations = [
    'General Medicine',
    'Cardiology',
    'Neurology',
    'Orthopedics',
    'Pediatrics',
    'Surgery',
    'Emergency Medicine',
    'Radiology',
    'Pathology',
    'Anesthesiology'
  ]

  const shifts = ['Morning', 'Afternoon', 'Night']

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <UserPlus className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Staff Management</h1>
        </div>
        <Button 
          variant="outline" 
          onClick={() => navigate('/administrator')}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="doctors" className="flex items-center space-x-2">
            <Stethoscope className="h-4 w-4" />
            <span>Doctors</span>
          </TabsTrigger>
          <TabsTrigger value="nurses" className="flex items-center space-x-2">
            <Heart className="h-4 w-4" />
            <span>Nurses</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center space-x-2">
            <UserPlus className="h-4 w-4" />
            <span>Users</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="doctors" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Add Doctor Form */}
            <Card>
              <CardHeader>
                <CardTitle>Add New Doctor</CardTitle>
                <CardDescription>
                  Register a new doctor in the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleDoctorSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="doctor-username">Username</Label>
                      <Input
                        id="doctor-username"
                        value={doctorForm.username}
                        onChange={(e) => setDoctorForm({...doctorForm, username: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="doctor-email">Email</Label>
                      <Input
                        id="doctor-email"
                        type="email"
                        value={doctorForm.email}
                        onChange={(e) => setDoctorForm({...doctorForm, email: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="doctor-full-name">Full Name</Label>
                    <Input
                      id="doctor-full-name"
                      value={doctorForm.full_name}
                      onChange={(e) => setDoctorForm({...doctorForm, full_name: e.target.value})}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="doctor-phone">Phone</Label>
                    <Input
                      id="doctor-phone"
                      value={doctorForm.phone}
                      onChange={(e) => setDoctorForm({...doctorForm, phone: e.target.value})}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="doctor-password">Password</Label>
                    <Input
                      id="doctor-password"
                      type="password"
                      value={doctorForm.password}
                      onChange={(e) => setDoctorForm({...doctorForm, password: e.target.value})}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="doctor-specialization">Specialization</Label>
                      <Select value={doctorForm.specialization} onValueChange={(value) => setDoctorForm({...doctorForm, specialization: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select specialization" />
                        </SelectTrigger>
                        <SelectContent>
                          {specializations.map(spec => (
                            <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="doctor-department">Department</Label>
                      <Select value={doctorForm.department} onValueChange={(value) => setDoctorForm({...doctorForm, department: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map(dept => (
                            <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="doctor-license">License Number</Label>
                      <Input
                        id="doctor-license"
                        value={doctorForm.license_number}
                        onChange={(e) => setDoctorForm({...doctorForm, license_number: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="doctor-experience">Years of Experience</Label>
                      <Input
                        id="doctor-experience"
                        type="number"
                        min="0"
                        value={doctorForm.years_of_experience}
                        onChange={(e) => setDoctorForm({...doctorForm, years_of_experience: parseInt(e.target.value) || 0})}
                        required
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Adding...' : 'Add Doctor'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Doctors List */}
            <Card>
              <CardHeader>
                <CardTitle>Current Doctors ({doctors.length})</CardTitle>
                <CardDescription>
                  Manage existing doctors
                </CardDescription>
              </CardHeader>
              <CardContent>
                {doctors.length === 0 ? (
                  <Alert>
                    <AlertDescription>
                      No doctors found. Add a doctor to get started.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-4">
                    {doctors.map((doctor) => (
                      <div key={doctor.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <div className="font-medium">{doctor.user.full_name}</div>
                          <div className="text-sm text-muted-foreground">@{doctor.user.username} • {doctor.user.email}</div>
                          <div className="text-sm text-muted-foreground">📞 {doctor.user.phone}</div>
                          <div className="text-sm text-muted-foreground">{doctor.specialization} • {doctor.department}</div>
                          <div className="text-sm text-muted-foreground">License: {doctor.license_number}</div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={doctor.user.is_active ? "default" : "secondary"}>
                              {doctor.user.is_active ? "Active" : "Inactive"}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {doctor.years_of_experience} years exp.
                            </span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleDoctorStatus(doctor.id)}
                            disabled={loading}
                          >
                            {doctor.user.is_active ? "Deactivate" : "Activate"}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteDoctor(doctor.id)}
                            disabled={loading}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="nurses" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Add Nurse Form */}
            <Card>
              <CardHeader>
                <CardTitle>Add New Nurse</CardTitle>
                <CardDescription>
                  Register a new nurse in the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleNurseSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nurse-username">Username</Label>
                      <Input
                        id="nurse-username"
                        value={nurseForm.username}
                        onChange={(e) => setNurseForm({...nurseForm, username: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nurse-email">Email</Label>
                      <Input
                        id="nurse-email"
                        type="email"
                        value={nurseForm.email}
                        onChange={(e) => setNurseForm({...nurseForm, email: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nurse-full-name">Full Name</Label>
                    <Input
                      id="nurse-full-name"
                      value={nurseForm.full_name}
                      onChange={(e) => setNurseForm({...nurseForm, full_name: e.target.value})}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nurse-phone">Phone</Label>
                    <Input
                      id="nurse-phone"
                      value={nurseForm.phone}
                      onChange={(e) => setNurseForm({...nurseForm, phone: e.target.value})}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nurse-password">Password</Label>
                    <Input
                      id="nurse-password"
                      type="password"
                      value={nurseForm.password}
                      onChange={(e) => setNurseForm({...nurseForm, password: e.target.value})}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nurse-department">Department</Label>
                      <Select value={nurseForm.department} onValueChange={(value) => setNurseForm({...nurseForm, department: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map(dept => (
                            <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nurse-shift">Shift</Label>
                      <Select value={nurseForm.shift} onValueChange={(value) => setNurseForm({...nurseForm, shift: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select shift" />
                        </SelectTrigger>
                        <SelectContent>
                          {shifts.map(shift => (
                            <SelectItem key={shift} value={shift}>{shift}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nurse-license">License Number</Label>
                    <Input
                      id="nurse-license"
                      value={nurseForm.license_number}
                      onChange={(e) => setNurseForm({...nurseForm, license_number: e.target.value})}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Adding...' : 'Add Nurse'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Nurses List */}
            <Card>
              <CardHeader>
                <CardTitle>Current Nurses ({nurses.length})</CardTitle>
                <CardDescription>
                  Manage existing nurses
                </CardDescription>
              </CardHeader>
              <CardContent>
                {nurses.length === 0 ? (
                  <Alert>
                    <AlertDescription>
                      No nurses found. Add a nurse to get started.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-4">
                    {nurses.map((nurse) => (
                      <div key={nurse.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <div className="font-medium">{nurse.user.full_name}</div>
                          <div className="text-sm text-muted-foreground">@{nurse.user.username} • {nurse.user.email}</div>
                          <div className="text-sm text-muted-foreground">📞 {nurse.user.phone}</div>
                          <div className="text-sm text-muted-foreground">{nurse.department} • {nurse.shift} Shift</div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={nurse.user.is_active ? "default" : "secondary"}>
                              {nurse.user.is_active ? "Active" : "Inactive"}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              License: {nurse.license_number}
                            </span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleNurseStatus(nurse.id)}
                            disabled={loading}
                          >
                            {nurse.user.is_active ? "Deactivate" : "Activate"}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteNurse(nurse.id)}
                            disabled={loading}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>All Users</CardTitle>
              <CardDescription>
                View and manage all system users including patients, doctors, and nurses. Administrator accounts cannot be modified.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center p-4">
                  <div className="text-muted-foreground">Loading users...</div>
                </div>
              ) : users.length === 0 ? (
                <div className="text-center p-4 text-muted-foreground">
                  No users found
                </div>
              ) : (
                <div className="space-y-3">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">@{user.username} • {user.email}</div>
                        <div className="text-sm text-muted-foreground">📞 {user.phone}</div>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant={user.role === "administrator" ? "default" : user.role === "doctor" ? "secondary" : user.role === "nurse" ? "outline" : "destructive"}>
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </Badge>
                          <Badge variant={user.is_active ? "default" : "secondary"}>
                            {user.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                      {user.role !== "administrator" && (
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleUserStatus(user.id)}
                            disabled={loading}
                          >
                            {user.is_active ? "Deactivate" : "Activate"}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={loading}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  )
}