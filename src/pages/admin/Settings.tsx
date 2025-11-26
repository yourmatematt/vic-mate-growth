import React from 'react';
import { Settings as SettingsIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AdminLayout from '@/components/admin/AdminLayout';

const Settings: React.FC = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">
            Settings
          </h1>
          <p className="mt-2 text-muted-foreground">
            Manage your admin preferences and system settings
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <SettingsIcon className="h-5 w-5" />
              <CardTitle>Admin Settings</CardTitle>
            </div>
            <CardDescription>
              This page is under construction. Coming soon mate!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <p>Settings panel will be implemented here.</p>
              <p className="text-sm mt-2">Features to include:</p>
              <ul className="text-sm mt-4 space-y-1 text-left max-w-md mx-auto">
                <li>• User management</li>
                <li>• Site configuration</li>
                <li>• SEO settings</li>
                <li>• Email templates</li>
                <li>• Analytics settings</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Settings;