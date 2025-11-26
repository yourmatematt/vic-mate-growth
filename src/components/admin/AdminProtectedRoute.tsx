import React from 'react';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { getCurrentUser, onAuthStateChange, UserWithProfile } from '@/lib/auth-utils';
import AdminLogin from '@/pages/admin/AdminLogin';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
  const [user, setUser] = React.useState<UserWithProfile | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [authError, setAuthError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;

    // Initial auth check
    const checkAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (mounted) {
          setUser(currentUser);
          setLoading(false);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        if (mounted) {
          setAuthError('Failed to check authentication');
          setLoading(false);
        }
      }
    };

    // Listen for auth state changes
    const { data: authListener } = onAuthStateChange((user) => {
      if (mounted) {
        setUser(user);
        setLoading(false);
      }
    });

    checkAuth();

    return () => {
      mounted = false;
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  // Show loading spinner while checking authentication
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

  // Show error if auth check failed
  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Authentication error. Please try refreshing the page.</p>
        </div>
      </div>
    );
  }

  // Show admin login if not authenticated
  if (!user) {
    return <AdminLogin onSuccess={() => window.location.reload()} />;
  }

  // Check if user has admin role
  if (!user.isAdmin) {
    return <Navigate to="/admin/unauthorized" replace />;
  }

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