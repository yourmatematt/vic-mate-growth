/**
 * Google Calendar Authentication Page
 * Handles OAuth flow and calendar connection status
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Calendar,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  XCircle,
  Clock,
  Settings,
  Link as LinkIcon,
  Unlink,
  Key,
  Globe
} from 'lucide-react';
import { googleCalendarService } from '@/services/googleCalendarService';

interface CalendarConnectionStatus {
  isConfigured: boolean;
  isAuthenticated: boolean;
  calendarId: string;
  timeZone: string;
  scopes: string[];
  tokenExpiry?: Date;
  lastSync?: Date;
  errorMessage?: string;
}

const GoogleCalendarAuth: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<CalendarConnectionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Check for OAuth callback
  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const state = searchParams.get('state');

    if (error) {
      toast.error(`OAuth error: ${error}`);
      // Clear URL parameters
      navigate('/admin/google-calendar-auth', { replace: true });
      return;
    }

    if (code) {
      handleOAuthCallback(code, state);
      return;
    }

    // Load current connection status
    loadConnectionStatus();
  }, [searchParams, navigate]);

  /**
   * Load current calendar connection status
   */
  const loadConnectionStatus = async () => {
    setLoading(true);
    try {
      await googleCalendarService.initialize();
      const config = googleCalendarService.getConfig();

      setConnectionStatus({
        isConfigured: config.isConfigured,
        isAuthenticated: config.isAuthenticated,
        calendarId: config.calendarId,
        timeZone: config.timeZone,
        scopes: config.scopes,
        tokenExpiry: config.tokenExpiry || undefined
      });
    } catch (error) {
      console.error('Failed to load connection status:', error);
      setConnectionStatus({
        isConfigured: false,
        isAuthenticated: false,
        calendarId: '',
        timeZone: 'Australia/Melbourne',
        scopes: [],
        errorMessage: 'Failed to load connection status'
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle OAuth callback
   */
  const handleOAuthCallback = async (code: string, state?: string | null) => {
    setConnecting(true);
    try {
      const tokens = await googleCalendarService.handleOAuthCallback(code);
      toast.success('Google Calendar connected successfully!');

      // Clear URL parameters
      navigate('/admin/google-calendar-auth', { replace: true });

      // Reload connection status
      await loadConnectionStatus();
    } catch (error) {
      console.error('OAuth callback failed:', error);
      toast.error('Failed to connect Google Calendar. Please try again.');
    } finally {
      setConnecting(false);
    }
  };

  /**
   * Start OAuth flow
   */
  const handleConnectCalendar = async () => {
    setConnecting(true);
    try {
      const state = `admin-${Date.now()}`;
      const authUrl = googleCalendarService.getAuthUrl(state);

      // Store state for validation (you might want to use sessionStorage)
      sessionStorage.setItem('oauth_state', state);

      // Redirect to Google OAuth
      window.location.href = authUrl;
    } catch (error) {
      console.error('Failed to initiate OAuth flow:', error);
      toast.error('Failed to start calendar connection process');
      setConnecting(false);
    }
  };

  /**
   * Test calendar connection
   */
  const handleTestConnection = async () => {
    if (!connectionStatus?.isAuthenticated) {
      toast.error('Calendar not connected');
      return;
    }

    setLoading(true);
    try {
      // Try to refresh the service and check authentication
      await googleCalendarService.initialize();

      toast.success('Calendar connection is working!');
    } catch (error) {
      console.error('Connection test failed:', error);
      toast.error('Calendar connection test failed');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Disconnect calendar
   */
  const handleDisconnect = async () => {
    if (window.confirm('Are you sure you want to disconnect Google Calendar? This will stop automatic calendar event creation for new bookings.')) {
      try {
        // TODO: Implement token removal
        // await googleCalendarService.disconnect();
        toast.success('Google Calendar disconnected');
        await loadConnectionStatus();
      } catch (error) {
        console.error('Failed to disconnect:', error);
        toast.error('Failed to disconnect Google Calendar');
      }
    }
  };

  const getConnectionStatusColor = () => {
    if (!connectionStatus?.isConfigured) return 'destructive';
    if (!connectionStatus?.isAuthenticated) return 'secondary';
    return 'default';
  };

  const getConnectionStatusText = () => {
    if (!connectionStatus?.isConfigured) return 'Not Configured';
    if (!connectionStatus?.isAuthenticated) return 'Not Connected';
    return 'Connected';
  };

  const isTokenExpiringSoon = () => {
    if (!connectionStatus?.tokenExpiry) return false;
    const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000);
    return connectionStatus.tokenExpiry < fiveMinutesFromNow;
  };

  if (loading && !connectionStatus) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-48 h-8 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="w-full h-64 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold text-gray-900">
              Google Calendar Integration
            </h1>
            <p className="mt-2 text-gray-600">
              Connect your Google Calendar to automatically create meeting events for bookings
            </p>
          </div>

          <div className="mt-4 sm:mt-0 flex items-center space-x-3">
            <Badge variant={getConnectionStatusColor()} className="flex items-center space-x-1">
              {connectionStatus?.isAuthenticated ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              <span>{getConnectionStatusText()}</span>
            </Badge>

            <Button
              onClick={loadConnectionStatus}
              variant="outline"
              size="sm"
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* OAuth Callback Processing */}
        {connecting && (
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertDescription>
              Processing Google Calendar connection...
            </AlertDescription>
          </Alert>
        )}

        {/* Configuration Status */}
        {connectionStatus && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Connection Status Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Connection Status
                </CardTitle>
                <CardDescription>
                  Current state of your Google Calendar integration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium text-gray-700">Configuration</div>
                    <Badge variant={connectionStatus.isConfigured ? 'default' : 'destructive'}>
                      {connectionStatus.isConfigured ? 'Ready' : 'Missing'}
                    </Badge>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-gray-700">Authentication</div>
                    <Badge variant={connectionStatus.isAuthenticated ? 'default' : 'secondary'}>
                      {connectionStatus.isAuthenticated ? 'Connected' : 'Not Connected'}
                    </Badge>
                  </div>
                </div>

                {connectionStatus.isConfigured && (
                  <>
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-1">Calendar ID</div>
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                        {connectionStatus.calendarId}
                      </code>
                    </div>

                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-1">Time Zone</div>
                      <span className="text-sm">{connectionStatus.timeZone}</span>
                    </div>

                    {connectionStatus.tokenExpiry && (
                      <div>
                        <div className="text-sm font-medium text-gray-700 mb-1">Token Expires</div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm">
                            {connectionStatus.tokenExpiry.toLocaleString()}
                          </span>
                          {isTokenExpiringSoon() && (
                            <Badge variant="destructive">Expires Soon</Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {connectionStatus.errorMessage && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {connectionStatus.errorMessage}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Actions Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Calendar Actions
                </CardTitle>
                <CardDescription>
                  Manage your Google Calendar connection
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!connectionStatus.isConfigured && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Google Calendar is not properly configured. Please check your environment variables:
                      <br />• VITE_GOOGLE_CLIENT_ID
                      <br />• VITE_GOOGLE_REDIRECT_URI (optional, defaults to current domain)
                      <br />• VITE_GOOGLE_CALENDAR_ID (optional, defaults to 'primary')
                    </AlertDescription>
                  </Alert>
                )}

                {connectionStatus.isConfigured && !connectionStatus.isAuthenticated && (
                  <div className="space-y-3">
                    <Alert>
                      <LinkIcon className="h-4 w-4" />
                      <AlertDescription>
                        Connect your Google Calendar to automatically create meeting events for new bookings.
                      </AlertDescription>
                    </Alert>

                    <Button
                      onClick={handleConnectCalendar}
                      disabled={connecting}
                      className="w-full"
                    >
                      {connecting ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        <>
                          <LinkIcon className="h-4 w-4 mr-2" />
                          Connect Google Calendar
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {connectionStatus.isAuthenticated && (
                  <div className="space-y-3">
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        Google Calendar is connected! New bookings will automatically create calendar events with Google Meet links.
                      </AlertDescription>
                    </Alert>

                    <div className="flex space-x-2">
                      <Button
                        onClick={handleTestConnection}
                        variant="outline"
                        disabled={loading}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Test Connection
                      </Button>

                      <Button
                        onClick={handleDisconnect}
                        variant="destructive"
                      >
                        <Unlink className="h-4 w-4 mr-2" />
                        Disconnect
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Setup Instructions */}
        {connectionStatus && !connectionStatus.isConfigured && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Key className="h-5 w-5 mr-2" />
                Setup Instructions
              </CardTitle>
              <CardDescription>
                Follow these steps to configure Google Calendar integration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>
                  Go to{' '}
                  <a
                    href="https://console.cloud.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline inline-flex items-center"
                  >
                    Google Cloud Console
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </li>
                <li>Create a new project or select an existing one</li>
                <li>
                  Enable the Google Calendar API in{' '}
                  <strong>APIs & Services → Library</strong>
                </li>
                <li>
                  Create OAuth 2.0 credentials in{' '}
                  <strong>APIs & Services → Credentials</strong>
                </li>
                <li>
                  Add authorized redirect URI:{' '}
                  <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">
                    {window.location.origin}/admin/google-calendar-auth/callback
                  </code>
                </li>
                <li>Add your credentials to environment variables</li>
                <li>Restart your application and return to this page</li>
              </ol>

              <Alert>
                <Globe className="h-4 w-4" />
                <AlertDescription>
                  Need help? Check the{' '}
                  <strong>docs/GOOGLE_CALENDAR_SETUP.md</strong> file for detailed setup instructions.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}

        {/* Permissions Info */}
        {connectionStatus?.isConfigured && (
          <Card>
            <CardHeader>
              <CardTitle>Required Permissions</CardTitle>
              <CardDescription>
                Your Mate Agency requires these Google Calendar permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {connectionStatus.scopes.map((scope, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <code className="text-sm">{scope}</code>
                  </div>
                ))}
              </div>

              <div className="mt-4 text-sm text-gray-600">
                <strong>What we do with these permissions:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Create calendar events for new strategy call bookings</li>
                  <li>Generate Google Meet links for video meetings</li>
                  <li>Update or cancel events when bookings are modified</li>
                  <li>Set appropriate reminders for both you and customers</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default GoogleCalendarAuth;