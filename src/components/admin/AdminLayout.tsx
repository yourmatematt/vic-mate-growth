import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  Home,
  FolderOpen,
  Settings,
  ArrowLeft,
  LogOut,
  User,
  ChevronRight,
  Calendar,
  Clock,
  CalendarX
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface AdminLayoutProps {
  children: React.ReactNode;
}

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  current: boolean;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Mock user data - replace with actual auth context
  const user = {
    name: 'Admin User',
    email: 'admin@yourmate.com.au',
    role: 'Admin'
  };

  const navigation: NavigationItem[] = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: Home,
      current: location.pathname === '/admin'
    },
    {
      name: 'Bookings',
      href: '/admin/bookings',
      icon: Calendar,
      current: location.pathname.startsWith('/admin/bookings')
    },
    {
      name: 'Time Slots',
      href: '/admin/time-slots',
      icon: Clock,
      current: location.pathname.startsWith('/admin/time-slots')
    },
    {
      name: 'Blackout Dates',
      href: '/admin/blackout-dates',
      icon: CalendarX,
      current: location.pathname.startsWith('/admin/blackout-dates')
    },
    {
      name: 'Case Studies',
      href: '/admin/case-studies',
      icon: FolderOpen,
      current: location.pathname.startsWith('/admin/case-studies')
    },
    {
      name: 'Settings',
      href: '/admin/settings',
      icon: Settings,
      current: location.pathname.startsWith('/admin/settings')
    }
  ];

  // Generate breadcrumbs based on current path
  const generateBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = [];

    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;

      let displayName = segment;
      switch (segment) {
        case 'admin':
          displayName = 'Admin';
          break;
        case 'bookings':
          displayName = 'Bookings';
          break;
        case 'time-slots':
          displayName = 'Time Slots';
          break;
        case 'blackout-dates':
          displayName = 'Blackout Dates';
          break;
        case 'case-studies':
          displayName = 'Case Studies';
          break;
        case 'new':
          displayName = 'New Case Study';
          break;
        case 'edit':
          displayName = 'Edit Case Study';
          break;
        case 'settings':
          displayName = 'Settings';
          break;
        default:
          // Capitalize first letter for other segments
          displayName = segment.charAt(0).toUpperCase() + segment.slice(1);
      }

      breadcrumbs.push({
        name: displayName,
        href: currentPath,
        current: index === pathSegments.length - 1
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  const handleLogout = () => {
    // TODO: Implement logout logic
    console.log('Logging out...');
    navigate('/');
  };

  const Sidebar = ({ mobile = false }) => (
    <div className={`flex flex-col h-full ${mobile ? 'p-4' : 'p-6'}`}>
      {/* Logo/Brand */}
      <div className="flex items-center space-x-2 mb-8">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">YM</span>
        </div>
        <div className="flex flex-col">
          <span className="font-heading font-bold text-lg">Your Mate</span>
          <span className="text-xs text-muted-foreground">Admin Panel</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => mobile && setSidebarOpen(false)}
              className={`
                group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                ${item.current
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }
              `}
            >
              <Icon
                className={`mr-3 h-5 w-5 transition-colors ${
                  item.current ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'
                }`}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Navigation */}
      <div className="pt-4 border-t">
        <Link
          to="/"
          className="group flex items-center px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
          onClick={() => mobile && setSidebarOpen(false)}
        >
          <ArrowLeft className="mr-3 h-5 w-5" />
          Back to Website
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-64 bg-card border-r">
            <div className="flex items-center justify-between p-4 border-b">
              <span className="font-heading font-bold text-lg">Menu</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <Sidebar mobile />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow border-r bg-card">
          <Sidebar />
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-x-4 border-b bg-background px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Open sidebar</span>
          </Button>

          {/* Breadcrumbs */}
          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              {breadcrumbs.map((breadcrumb, index) => (
                <React.Fragment key={breadcrumb.href}>
                  {index > 0 && <ChevronRight className="h-4 w-4" />}
                  <Link
                    to={breadcrumb.href}
                    className={`hover:text-foreground transition-colors ${
                      breadcrumb.current ? 'text-foreground font-medium' : ''
                    }`}
                  >
                    {breadcrumb.name}
                  </Link>
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* User menu */}
          <div className="flex items-center gap-x-4 lg:gap-x-6">
            <Separator orientation="vertical" className="h-6" />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 h-auto p-2">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium text-foreground hidden sm:block">
                      {user.name}
                    </span>
                    <Badge variant="secondary" className="text-xs hidden sm:inline-flex">
                      {user.role}
                    </Badge>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex flex-col space-y-1 p-2">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                  <Badge variant="secondary" className="w-fit">
                    {user.role}
                  </Badge>
                </div>
                <Separator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;