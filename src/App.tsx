import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import SocialProofBanner from "./components/SocialProofBanner";
import ExitIntentPopup from "./components/ExitIntentPopup";
import DashboardLayout from "./components/DashboardLayout";
import GrowMyBusiness from "./pages/GrowMyBusiness";
import Expertise from "./pages/Expertise";
import CaseStudy from "./pages/CaseStudy";
import Learn from "./pages/Learn";
import About from "./pages/About";
import LocationPage from "./pages/LocationPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";
import WebsiteDesignDevelopment from "./pages/services/WebsiteDesignDevelopment";
import SEOLocalSearch from "./pages/services/SEOLocalSearch";
import GoogleAdsManagement from "./pages/services/GoogleAdsManagement";
import SocialMediaMarketing from "./pages/services/SocialMediaMarketing";
import EmailMarketing from "./pages/services/EmailMarketing";
import ContentCreation from "./pages/services/ContentCreation";
import WhyWebsiteNotFound from "./pages/blog/WhyWebsiteNotFound";
import ClientProjectShowcase from "./pages/portfolio/ClientProjectShowcase";
import Overview from "./pages/dashboard/Overview";
import Campaigns from "./pages/dashboard/Campaigns";
import Reports from "./pages/dashboard/Reports";
import Invoices from "./pages/dashboard/Invoices";
import Settings from "./pages/dashboard/Settings";
import Support from "./pages/dashboard/Support";
import MyTools from "./pages/dashboard/MyTools";
import Tools from "./pages/Tools";
import BreakEvenCalculator from "./pages/tools/BreakEvenCalculator";
import SubjectLineScorer from "./pages/tools/SubjectLineScorer";
import MarketingAssessment from "./pages/tools/MarketingAssessment";
import BudgetAllocator from "./pages/tools/BudgetAllocator";

// Admin Components
import AdminProtectedRoute from "./components/admin/AdminProtectedRoute";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminSettings from "./pages/admin/Settings";
import AdminUnauthorized from "./pages/admin/Unauthorized";
import CaseStudiesList from "./pages/admin/CaseStudiesList";
import CreateCaseStudy from "./pages/admin/CreateCaseStudy";
import EditCaseStudy from "./pages/admin/EditCaseStudy";
import BookingsList from "./pages/admin/BookingsList";
import BookingDetail from "./pages/admin/BookingDetail";
import TimeSlots from "./pages/admin/TimeSlots";
import BlackoutDates from "./pages/admin/BlackoutDates";
import BookStrategyCall from "./pages/BookStrategyCall";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={
                <div className="min-h-screen flex flex-col">
                  <Navigation />
                  <main className="flex-1">
                    <GrowMyBusiness />
                  </main>
                  <Footer />
                  <ScrollToTop />
                  <SocialProofBanner />
                </div>
              } />
              <Route path="/grow-my-business" element={
                <div className="min-h-screen flex flex-col">
                  <Navigation />
                  <main className="flex-1">
                    <GrowMyBusiness />
                  </main>
                  <Footer />
                  <ScrollToTop />
                  <SocialProofBanner />
                </div>
              } />
              <Route path="/expertise" element={
                <div className="min-h-screen flex flex-col">
                  <Navigation />
                  <main className="flex-1">
                    <Expertise />
                  </main>
                  <Footer />
                  <ScrollToTop />
                  <SocialProofBanner />
                </div>
              } />
              <Route path="/expertise/:slug" element={
                <div className="min-h-screen flex flex-col">
                  <Navigation />
                  <main className="flex-1">
                    <CaseStudy />
                  </main>
                  <Footer />
                  <ScrollToTop />
                </div>
              } />
              <Route path="/learn" element={
                <div className="min-h-screen flex flex-col">
                  <Navigation />
                  <main className="flex-1">
                    <Learn />
                  </main>
                  <Footer />
                  <ScrollToTop />
                  <SocialProofBanner />
                </div>
              } />
              <Route path="/about" element={
                <div className="min-h-screen flex flex-col">
                  <Navigation />
                  <main className="flex-1">
                    <About />
                  </main>
                  <Footer />
                  <ScrollToTop />
                  <SocialProofBanner />
                </div>
              } />
              <Route path="/locations/:location" element={
                <div className="min-h-screen flex flex-col">
                  <Navigation />
                  <main className="flex-1">
                    <LocationPage />
                  </main>
                  <Footer />
                  <ScrollToTop />
                  <SocialProofBanner />
                </div>
              } />
              <Route path="/grow-my-business/website-design-development" element={
                <div className="min-h-screen flex flex-col">
                  <Navigation />
                  <main className="flex-1">
                    <WebsiteDesignDevelopment />
                  </main>
                  <Footer />
                  <ScrollToTop />
                  <SocialProofBanner />
                </div>
              } />
              <Route path="/grow-my-business/seo-local-search" element={
                <div className="min-h-screen flex flex-col">
                  <Navigation />
                  <main className="flex-1">
                    <SEOLocalSearch />
                  </main>
                  <Footer />
                  <ScrollToTop />
                  <SocialProofBanner />
                </div>
              } />
              <Route path="/grow-my-business/google-ads-management" element={
                <div className="min-h-screen flex flex-col">
                  <Navigation />
                  <main className="flex-1">
                    <GoogleAdsManagement />
                  </main>
                  <Footer />
                  <ScrollToTop />
                  <SocialProofBanner />
                </div>
              } />
              <Route path="/grow-my-business/social-media-marketing" element={
                <div className="min-h-screen flex flex-col">
                  <Navigation />
                  <main className="flex-1">
                    <SocialMediaMarketing />
                  </main>
                  <Footer />
                  <ScrollToTop />
                  <SocialProofBanner />
                </div>
              } />
              <Route path="/grow-my-business/email-marketing" element={
                <div className="min-h-screen flex flex-col">
                  <Navigation />
                  <main className="flex-1">
                    <EmailMarketing />
                  </main>
                  <Footer />
                  <ScrollToTop />
                  <SocialProofBanner />
                </div>
              } />
              <Route path="/grow-my-business/content-creation" element={
                <div className="min-h-screen flex flex-col">
                  <Navigation />
                  <main className="flex-1">
                    <ContentCreation />
                  </main>
                  <Footer />
                  <ScrollToTop />
                  <SocialProofBanner />
                </div>
              } />
              <Route path="/blog/why-website-not-found" element={
                <div className="min-h-screen flex flex-col">
                  <Navigation />
                  <main className="flex-1">
                    <WhyWebsiteNotFound />
                  </main>
                  <Footer />
                  <ScrollToTop />
                  <SocialProofBanner />
                </div>
              } />
              <Route path="/portfolio/techflow-solutions" element={
                <div className="min-h-screen flex flex-col">
                  <Navigation />
                  <main className="flex-1">
                    <ClientProjectShowcase />
                  </main>
                  <Footer />
                  <ScrollToTop />
                  <SocialProofBanner />
                </div>
              } />

              {/* Book Strategy Call */}
              <Route path="/book-strategy-call" element={
                <div className="min-h-screen flex flex-col">
                  <Navigation />
                  <main className="flex-1">
                    <BookStrategyCall />
                  </main>
                  <Footer />
                  <ScrollToTop />
                  <SocialProofBanner />
                </div>
              } />

              {/* Tools Routes */}
              <Route path="/tools" element={
                <div className="min-h-screen flex flex-col">
                  <Navigation />
                  <main className="flex-1">
                    <Tools />
                  </main>
                  <Footer />
                  <ScrollToTop />
                  <SocialProofBanner />
                </div>
              } />
              <Route path="/tools/break-even-calculator" element={<BreakEvenCalculator />} />
              <Route path="/tools/subject-line-scorer" element={<SubjectLineScorer />} />
              <Route path="/tools/marketing-assessment" element={<MarketingAssessment />} />
              <Route path="/tools/budget-allocator" element={<BudgetAllocator />} />

              {/* Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Protected Dashboard Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Overview />} />
                <Route path="campaigns" element={<Campaigns />} />
                <Route path="reports" element={<Reports />} />
                <Route path="my-tools" element={<MyTools />} />
                <Route path="settings" element={<Settings />} />
                <Route path="settings/billing" element={<Settings defaultTab="billing" />} />
                <Route path="support" element={<Support />} />
              </Route>

              {/* Admin Routes */}
              <Route path="/admin/unauthorized" element={<AdminUnauthorized />} />
              <Route path="/admin" element={
                <AdminProtectedRoute>
                  <AdminDashboard />
                </AdminProtectedRoute>
              } />
              <Route path="/admin/settings" element={
                <AdminProtectedRoute>
                  <AdminSettings />
                </AdminProtectedRoute>
              } />
              <Route path="/admin/case-studies" element={
                <AdminProtectedRoute>
                  <CaseStudiesList />
                </AdminProtectedRoute>
              } />
              <Route path="/admin/case-studies/new" element={
                <AdminProtectedRoute>
                  <CreateCaseStudy />
                </AdminProtectedRoute>
              } />
              <Route path="/admin/case-studies/:id/edit" element={
                <AdminProtectedRoute>
                  <EditCaseStudy />
                </AdminProtectedRoute>
              } />

              {/* Admin Booking Routes */}
              <Route path="/admin/bookings" element={
                <AdminProtectedRoute>
                  <BookingsList />
                </AdminProtectedRoute>
              } />
              <Route path="/admin/bookings/:id" element={
                <AdminProtectedRoute>
                  <BookingDetail />
                </AdminProtectedRoute>
              } />
              <Route path="/admin/time-slots" element={
                <AdminProtectedRoute>
                  <TimeSlots />
                </AdminProtectedRoute>
              } />
              <Route path="/admin/blackout-dates" element={
                <AdminProtectedRoute>
                  <BlackoutDates />
                </AdminProtectedRoute>
              } />

              {/* 404 - ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <ExitIntentPopup enabled={true} />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
