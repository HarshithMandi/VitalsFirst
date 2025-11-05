import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState, UserRole } from '@/types';
import { toast } from '@/hooks/use-toast';
import { authApi } from '@/services/api';

interface AuthContextType extends AuthState {
  login: (username: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedAuth = localStorage.getItem('vitalsfirst_auth');
    if (storedAuth) {
      try {
        const parsed = JSON.parse(storedAuth);
        setAuthState(parsed);
        
        // Verify token is still valid
        authApi.getCurrentUser().then(response => {
          if (response.error) {
            // Token is invalid, clear auth
            localStorage.removeItem('vitalsfirst_auth');
            setAuthState({
              user: null,
              token: null,
              isAuthenticated: false,
            });
          }
        });
      } catch (error) {
        localStorage.removeItem('vitalsfirst_auth');
      }
    }
  }, []);

  const login = async (username: string, password: string, role: UserRole): Promise<boolean> => {
    setLoading(true);
    
    try {
      const response = await authApi.login(username, password, role);
      
      if (response.error) {
        toast({
          title: 'Login Failed',
          description: response.error,
          variant: 'destructive',
        });
        return false;
      }

      const { access_token, user } = response.data as any;
      const newAuthState = {
        user,
        token: access_token,
        isAuthenticated: true,
      };
      
      setAuthState(newAuthState);
      localStorage.setItem('vitalsfirst_auth', JSON.stringify(newAuthState));
      
      toast({
        title: 'Login Successful',
        description: `Welcome back, ${user.name}!`,
      });
      
      return true;
    } catch (error) {
      toast({
        title: 'Login Failed',
        description: 'Network error. Please try again.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
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
    <AuthContext.Provider value={{ ...authState, login, logout, loading }}>
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
