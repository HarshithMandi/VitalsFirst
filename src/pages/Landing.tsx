import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Activity, Users, Shield, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

const roleCards = [
  {
    role: 'nurse',
    title: 'Nurse Portal',
    icon: Activity,
    description: 'Patient triage and vital monitoring',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    role: 'doctor',
    title: 'Doctor Portal',
    icon: Users,
    description: 'Patient management and scheduling',
    color: 'from-teal-500 to-emerald-500',
  },
  {
    role: 'administrator',
    title: 'Administrator Portal',
    icon: Shield,
    description: 'Staff and facility management',
    color: 'from-purple-500 to-indigo-500',
  },
  {
    role: 'patient',
    title: 'Patient Portal',
    icon: User,
    description: 'Appointments and health records',
    color: 'from-pink-500 to-rose-500',
  },
];

const Landing = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(`/${user.role}`);
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-background flex items-center justify-center p-6">
      <div className="w-full max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-primary mb-4">VitalsFirst</h1>
          <p className="text-xl text-muted-foreground">Healthcare Patient Triage & Scheduling System</p>
          <p className="text-sm text-muted-foreground mt-2">Select your role to access the portal</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {roleCards.map((card) => {
            const Icon = card.icon;
            return (
              <Card
                key={card.role}
                className="cursor-pointer transition-all hover:scale-105 hover:shadow-xl border-2 hover:border-primary overflow-hidden group"
                onClick={() => navigate(`/login/${card.role}`)}
              >
                <div className={`h-2 bg-gradient-to-r ${card.color}`} />
                <CardContent className="p-6 text-center">
                  <div className={`mx-auto w-16 h-16 rounded-full bg-gradient-to-br ${card.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{card.title}</h3>
                  <p className="text-sm text-muted-foreground">{card.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>Demo Credentials:</p>
          <p className="mt-2">Nurse: nurse1 / nurse123 | Doctor: doctor1 / doctor123</p>
          <p>Admin: admin / admin123 | Patient: patient1 / patient123</p>
        </div>
      </div>
    </div>
  );
};

export default Landing;
