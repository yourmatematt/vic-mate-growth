import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Shield, ArrowLeft } from 'lucide-react';
import { signIn, getCurrentUser } from '@/lib/auth-utils';

const adminLoginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

type AdminLoginFormData = z.infer<typeof adminLoginSchema>;

interface AdminLoginProps {
  onSuccess?: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess }) => {
  const navigate = useNavigate();
  const [error, setError] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<AdminLoginFormData>({
    resolver: zodResolver(adminLoginSchema)
  });

  const onSubmit = async (data: AdminLoginFormData) => {
    try {
      setError('');

      // Sign in with Supabase
      const { error: signInError } = await signIn(data.email, data.password);

      if (signInError) {
        setError('Invalid email or password. Please try again.');
        return;
      }

      // Check if user has admin role
      const user = await getCurrentUser();

      if (!user) {
        setError('Authentication failed. Please try again.');
        return;
      }

      if (!user.isAdmin) {
        setError('Access denied. You need administrator privileges to access this area.');
        return;
      }

      // Success - call onSuccess callback or navigate
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/admin/dashboard');
      }

    } catch (err) {
      console.error('Admin login error:', err);
      setError('An error occurred during login. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Admin Access
          </CardTitle>
          <CardDescription className="text-center">
            Sign in to access the admin panel
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-email">Email Address</Label>
              <Input
                {...register('email')}
                id="admin-email"
                type="email"
                placeholder="admin@yourmateagency.com.au"
                autoComplete="email"
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-password">Password</Label>
              <Input
                {...register('password')}
                id="admin-password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                className={errors.password ? 'border-destructive' : ''}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full mate-button-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  Sign In as Admin
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to main website
            </Link>
          </div>

          <div className="mt-4 pt-4 border-t">
            <div className="text-xs text-muted-foreground text-center space-y-1">
              <p><strong>Admin Access Only</strong></p>
              <p>Contact support if you need admin privileges</p>
              <p>
                <a
                  href="mailto:admin@yourmateagency.com.au"
                  className="text-primary hover:underline"
                >
                  admin@yourmateagency.com.au
                </a>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;