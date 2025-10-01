import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState, UserRole } from '@/types';
import { toast } from '@/hooks/use-toast';

interface AuthContextType extends AuthState {
  login: (username: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users database
const mockUsers = [
  { id: '1', username: 'admin', password: 'admin123', role: 'administrator' as UserRole, name: 'Admin User', email: 'admin@vitalsfirst.com' },
  { id: '2', username: 'nurse1', password: 'nurse123', role: 'nurse' as UserRole, name: 'Sarah Johnson', email: 'sarah@vitalsfirst.com' },
  { id: '3', username: 'doctor1', password: 'doctor123', role: 'doctor' as UserRole, name: 'Dr. Michael Chen', email: 'mchen@vitalsfirst.com' },
  { id: '4', username: 'patient1', password: 'patient123', role: 'patient' as UserRole, name: 'John Doe', email: 'john.doe@email.com' },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
  });

  useEffect(() => {
    const storedAuth = localStorage.getItem('vitalsfirst_auth');
    if (storedAuth) {
      const parsed = JSON.parse(storedAuth);
      setAuthState(parsed);
    }
  }, []);

  const login = async (username: string, password: string, role: UserRole): Promise<boolean> => {
    const user = mockUsers.find(
      u => u.username === username && u.password === password && u.role === role
    );

    if (user) {
      const { password: _, ...userWithoutPassword } = user;
      const token = `mock_jwt_${Date.now()}_${user.id}`;
      const newAuthState = {
        user: userWithoutPassword,
        token,
        isAuthenticated: true,
      };
      
      setAuthState(newAuthState);
      localStorage.setItem('vitalsfirst_auth', JSON.stringify(newAuthState));
      
      toast({
        title: 'Login Successful',
        description: `Welcome back, ${user.name}!`,
      });
      
      return true;
    }

    toast({
      title: 'Login Failed',
      description: 'Invalid credentials. Please try again.',
      variant: 'destructive',
    });
    
    return false;
  };

  const logout = () => {
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
    });
    localStorage.removeItem('vitalsfirst_auth');
    
    toast({
      title: 'Logged Out',
      description: 'You have been successfully logged out.',
    });
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
