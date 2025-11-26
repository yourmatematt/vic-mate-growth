import React from 'react';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { getCurrentUser, UserWithProfile } from '@/lib/auth-utils';
import { supabase } from '@/lib/supabase';
import AdminLogin from '@/pages/admin/AdminLogin';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
  const [user, setUser] = React.useState<UserWithProfile | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [authError, setAuthError] = React.useState<string | null>(null);
  const initialCheckDone = React.useRef(false);

  React.useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        console.log('AdminProtectedRoute: Starting initial auth check...');
        const currentUser = await getCurrentUser();
        console.log('AdminProtectedRoute: getCurrentUser result:', currentUser);
        if (mounted) {
          setUser(currentUser);
          setLoading(false);
          initialCheckDone.current = true;
          console.log('AdminProtectedRoute: Initial check complete');
        }
      } catch (error) {
        console.error('AdminProtectedRoute: Auth check error:', error);
        if (mounted) {
          setAuthError('Failed to check authentication');
          setLoading(false);
          initialCheckDone.current = true;
        }
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('AdminProtectedRoute: Auth event:', event);
      if (!mounted) return;

      if (event === 'SIGNED_OUT') {
        setUser(null);
      } else if (event === 'SIGNED_IN' && initialCheckDone.current) {
        const currentUser = await getCurrentUser();
        if (mounted) {
          setUser(currentUser);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
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