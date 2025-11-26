import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldX, ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Unauthorized: React.FC = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="text-center">
          <CardHeader className="pb-4">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldX className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-2xl font-heading font-bold">
              Access Denied
            </CardTitle>
            <CardDescription className="text-base">
              Sorry mate, you don't have access to this area
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="text-sm text-muted-foreground space-y-2">
              <p>
                The admin panel is restricted to authorized users only.
                If you believe this is an error, please contact your administrator.
              </p>
              <p>
                Need help? Reach out to us and we'll sort you out!
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                asChild
                className="flex-1"
              >
                <Link to="/">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Website
                </Link>
              </Button>

              <Button
                asChild
                className="flex-1 mate-button-primary"
              >
                <Link to="/">
                  <Home className="mr-2 h-4 w-4" />
                  Go Home
                </Link>
              </Button>
            </div>

            <div className="pt-4 border-t">
              <div className="text-xs text-muted-foreground space-y-1">
                <p>Need admin access?</p>
                <p>
                  Contact us at{' '}
                  <a
                    href="mailto:admin@yourmate.com.au"
                    className="text-primary hover:underline"
                  >
                    admin@yourmate.com.au
                  </a>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fun Australian touch */}
        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground italic">
            "No worries mate, not everyone gets to see behind the curtain! 🇦🇺"
          </p>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;