import { ReactNode, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { User, UserRole } from '../types';

interface AuthGuardProps {
  children: ReactNode;
  role: UserRole;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children, role }) => {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  
  useEffect(() => {
    const userJson = sessionStorage.getItem('currentUser');
    
    if (!userJson) {
      setIsAuthorized(false);
      return;
    }
    
    try {
      const user = JSON.parse(userJson) as User;
      setIsAuthorized(user.role === role);
    } catch (error) {
      setIsAuthorized(false);
    }
  }, [role]);
  
  if (isAuthorized === null) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  
  if (!isAuthorized) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

export default AuthGuard;
