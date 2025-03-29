
import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Battery, Bell, Car, MapPin, Navigation, Plug } from 'lucide-react';
import { motion } from 'framer-motion';
import { useApp } from '@/context/AppContext';

const Navbar: React.FC = () => {
  const { notifications } = useApp();
  const location = useLocation();
  const [hasScrolled, setHasScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    setMounted(true);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Count unread notifications
  const unreadCount = notifications.filter(n => !n.read).length;

  // Navigation links
  const navLinks = [
    { to: '/', icon: <Car className="h-5 w-5" />, label: 'Home' },
    { to: '/vehicle', icon: <Car className="h-5 w-5" />, label: 'Vehicle' },
    { to: '/battery', icon: <Battery className="h-5 w-5" />, label: 'Battery' },
    { to: '/notifications', icon: <Bell className="h-5 w-5" />, label: 'Notifications', badge: unreadCount },
    { to: '/location', icon: <MapPin className="h-5 w-5" />, label: 'Location' },
    { to: '/stations', icon: <Plug className="h-5 w-5" />, label: 'Stations' },
    { to: '/navigation', icon: <Navigation className="h-5 w-5" />, label: 'Navigation' },
  ];

  if (!mounted) return null;

  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 inset-x-0 z-50 ${
        hasScrolled ? 'glass shadow-sm' : 'bg-transparent'
      } transition-all duration-300 ease-in-out`}
    >
      <div className="container px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center">
          <span className="text-lg font-medium">EV Charge Alert</span>
        </div>
        
        <div className="hidden md:flex space-x-1">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => 
                `relative px-3 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out 
                 ${isActive 
                   ? 'text-primary' 
                   : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                 }`
              }
            >
              <div className="flex items-center space-x-1">
                {link.icon}
                <span>{link.label}</span>
                {link.badge && link.badge > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-ev-red text-white text-xs">
                    {link.badge}
                  </span>
                )}
              </div>
              {location.pathname === link.to && (
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                  layoutId="navbar-indicator"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </NavLink>
          ))}
        </div>
        
        <div className="block md:hidden">
          {/* Mobile menu button - will implement if needed */}
          <button className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100">
            <span className="sr-only">Open menu</span>
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
