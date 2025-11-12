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
import DashboardLayout from "./components/DashboardLayout";
import GrowMyBusiness from "./pages/GrowMyBusiness";
import Expertise from "./pages/Expertise";
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
                <Route path="invoices" element={<Invoices />} />
                <Route path="settings" element={<Settings />} />
                <Route path="support" element={<Support />} />
              </Route>

              {/* 404 - ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
