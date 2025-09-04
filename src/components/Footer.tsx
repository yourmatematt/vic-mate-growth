import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Instagram, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Footer = () => {
  const quickLinks = [
    { name: 'Grow My Business', path: '/grow-my-business' },
    { name: 'See Our Expertise', path: '/expertise' },
    { name: 'Learn Digital Marketing', path: '/learn' },
    { name: 'About Us', path: '/about' }
  ];

  const services = [
    'Website Design & Development',
    'SEO & Local Search',
    'Google Ads Management',
    'Social Media Marketing',
    'Email Marketing',
    'Content Creation'
  ];

  const topLocations = [
    'Geelong', 'Ballarat', 'Bendigo', 'Torquay', 'Ocean Grove',
    'Newtown', 'Wendouree', 'Eaglehawk', 'Anglesea', 'Barwon Heads'
  ];

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="bg-primary-foreground text-primary w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg">
                YM
              </div>
              <span className="font-heading font-bold text-xl">
                Your Mate Agency
              </span>
            </div>
            
            <p className="text-primary-foreground/80 leading-relaxed">
              Honest digital marketing that actually works for regional Victorian businesses. 
              We're your local mates helping you grow online.
            </p>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-3 text-sm">
                <Phone className="w-4 h-4" />
                <span>1300 YOUR MATE</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <Mail className="w-4 h-4" />
                <span>hello@yourmateagency.com.au</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <MapPin className="w-4 h-4" />
                <span>Geelong, Victoria</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link 
                    to={link.path}
                    className="text-primary-foreground/80 hover:text-primary-foreground transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
            
            <h4 className="font-semibold text-lg mt-6 mb-4">Services</h4>
            <ul className="space-y-2">
              {services.slice(0, 4).map((service) => (
                <li key={service}>
                  <span className="text-primary-foreground/80 text-sm">
                    {service}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Locations */}
          <div>
            <h4 className="font-semibold text-lg mb-4">We Serve</h4>
            <ul className="space-y-2">
              {topLocations.map((location) => (
                <li key={location}>
                  <Link 
                    to={`/locations/${location.toLowerCase().replace(' ', '-')}`}
                    className="text-primary-foreground/80 hover:text-primary-foreground transition-colors text-sm"
                  >
                    {location}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Weekly Tips</h4>
            <p className="text-primary-foreground/80 text-sm mb-4">
              Get practical digital marketing tips delivered to your inbox every week.
            </p>
            
            <div className="space-y-3">
              <Input 
                type="email"
                placeholder="Your email"
                className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/60"
              />
              <Button 
                className="w-full bg-accent hover:bg-accent-hover text-accent-foreground"
              >
                Subscribe
              </Button>
            </div>

            {/* Social Media */}
            <div className="flex space-x-4 mt-6">
              <a 
                href="#" 
                className="p-2 rounded-lg bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="p-2 rounded-lg bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="p-2 rounded-lg bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-primary-foreground/20 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-primary-foreground/80 text-sm">
              <p>&copy; 2024 Your Mate Agency. All rights reserved.</p>
              <p>ABN: 12 345 678 901</p>
            </div>
            
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;