import React from 'react';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

interface AuthUser {
  id: string;
  email: string;
  role?: string;
  isAuthenticated: boolean;
}

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
}

const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
  // TODO: Replace with actual AuthContext hook
  // This is a mock implementation - replace with your actual auth system
  const authState: AuthState = React.useMemo(() => {
    // Mock auth state - replace this with actual auth context
    const mockUser: AuthUser = {
      id: 'admin-1',
      email: 'admin@yourmate.com.au',
      role: 'admin',
      isAuthenticated: true
    };

    // Simulate loading state
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
      // Simulate auth check
      const timer = setTimeout(() => {
        setLoading(false);
      }, 500);

      return () => clearTimeout(timer);
    }, []);

    return {
      user: mockUser,
      loading
    };
  }, []);

  // Show loading spinner while checking authentication
  if (authState.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Checking access permissions...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!authState.user || !authState.user.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has admin role
  // For now, we'll just check if authenticated (as requested)
  // In the future, uncomment the role check below
  /*
  if (authState.user.role !== 'admin') {
    return <Navigate to="/admin/unauthorized" replace />;
  }
  */

  // User is authenticated and authorized - render children
  return <>{children}</>;
};

export default AdminProtectedRoute;

// Example of how to integrate with a real auth context:
/*
import { useAuth } from '@/contexts/AuthContext';

const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Checking access permissions...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Optional: Check for admin role
  if (user.role !== 'admin') {
    return <Navigate to="/admin/unauthorized" replace />;
  }

  return <>{children}</>;
};
*/