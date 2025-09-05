import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import GrowMyBusiness from "./pages/GrowMyBusiness";
import Expertise from "./pages/Expertise";
import Learn from "./pages/Learn";
import About from "./pages/About";
import LocationPage from "./pages/LocationPage";
import NotFound from "./pages/NotFound";
import WebsiteDesignDevelopment from "./pages/services/WebsiteDesignDevelopment";
import SEOLocalSearch from "./pages/services/SEOLocalSearch";
import GoogleAdsManagement from "./pages/services/GoogleAdsManagement";
import SocialMediaMarketing from "./pages/services/SocialMediaMarketing";
import EmailMarketing from "./pages/services/EmailMarketing";
import ContentCreation from "./pages/services/ContentCreation";
import WhyWebsiteNotFound from "./pages/blog/WhyWebsiteNotFound";
import ClientProjectShowcase from "./pages/portfolio/ClientProjectShowcase";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
        <div className="min-h-screen flex flex-col">
          <Navigation />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<GrowMyBusiness />} />
              <Route path="/grow-my-business" element={<GrowMyBusiness />} />
              <Route path="/expertise" element={<Expertise />} />
              <Route path="/learn" element={<Learn />} />
              <Route path="/about" element={<About />} />
              <Route path="/locations/:location" element={<LocationPage />} />
              <Route path="/grow-my-business/website-design-development" element={<WebsiteDesignDevelopment />} />
              <Route path="/grow-my-business/seo-local-search" element={<SEOLocalSearch />} />
              <Route path="/grow-my-business/google-ads-management" element={<GoogleAdsManagement />} />
              <Route path="/grow-my-business/social-media-marketing" element={<SocialMediaMarketing />} />
              <Route path="/grow-my-business/email-marketing" element={<EmailMarketing />} />
              <Route path="/grow-my-business/content-creation" element={<ContentCreation />} />
              <Route path="/blog/why-website-not-found" element={<WhyWebsiteNotFound />} />
              <Route path="/portfolio/techflow-solutions" element={<ClientProjectShowcase />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
          <ScrollToTop />
        </div>
      </BrowserRouter>
      </TooltipProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
