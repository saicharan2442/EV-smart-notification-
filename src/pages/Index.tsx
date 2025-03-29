
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Battery, Bell, Car, MapPin, Navigation, Plug } from 'lucide-react';
import PageTransition from '@/components/layout/PageTransition';
import Card, { CardContent, CardFooter, CardHeader, CardTitle } from '@/components/shared/Card';
import BatteryGauge from '@/components/battery/BatteryGauge';
import { useApp } from '@/context/AppContext';

const Index = () => {
  const { selectedVehicle, batteryPercentage, notifications } = useApp();
  const unreadCount = notifications.filter(n => !n.read).length;

  // Define our cards for the dashboard
  const modules = [
    {
      title: 'Vehicle Selection',
      icon: <Car className="h-6 w-6" />,
      description: 'Select and manage your electric vehicle',
      link: '/vehicle',
      detail: selectedVehicle ? `${selectedVehicle.brand} ${selectedVehicle.name}` : 'No vehicle selected',
      color: 'bg-blue-50',
      iconColor: 'text-blue-500',
    },
    {
      title: 'Battery Monitor',
      icon: <Battery className="h-6 w-6" />,
      description: 'Track your vehicle\'s battery status',
      link: '/battery',
      detail: <BatteryGauge percentage={batteryPercentage} size="sm" showIcon={false} />,
      color: 'bg-green-50',
      iconColor: 'text-green-500',
    },
    {
      title: 'Notifications',
      icon: <Bell className="h-6 w-6" />,
      description: 'View system alerts and messages',
      link: '/notifications',
      detail: unreadCount > 0 ? `${unreadCount} unread notifications` : 'No new notifications',
      color: 'bg-yellow-50',
      iconColor: 'text-yellow-500',
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    {
      title: 'Location Services',
      icon: <MapPin className="h-6 w-6" />,
      description: 'View your current location on the map',
      link: '/location',
      detail: 'Map view and location tracking',
      color: 'bg-indigo-50',
      iconColor: 'text-indigo-500',
    },
    {
      title: 'Charging Stations',
      icon: <Plug className="h-6 w-6" />,
      description: 'Find nearby charging stations',
      link: '/stations',
      detail: 'View available stations near you',
      color: 'bg-purple-50',
      iconColor: 'text-purple-500',
    },
    {
      title: 'Navigation',
      icon: <Navigation className="h-6 w-6" />,
      description: 'Get directions to charging stations',
      link: '/navigation',
      detail: 'Plan your route to nearest station',
      color: 'bg-pink-50',
      iconColor: 'text-pink-500',
    },
  ];

  const staggerDelay = 0.05;

  return (
    <PageTransition>
      <div className="container max-w-6xl mx-auto pt-24 px-4 pb-16">
        <div className="text-center mb-12">
          <motion.h1 
            className="text-4xl font-bold tracking-tight"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            EV Charge Alert
          </motion.h1>
          <motion.p 
            className="text-xl text-muted-foreground mt-4 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            Your complete dashboard for electric vehicle charging management
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module, i) => (
            <Link to={module.link} key={module.title} className="block">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.4,
                  delay: i * staggerDelay,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <Card glass hoverable className="h-full">
                  <CardHeader className={`${module.color} ${module.iconColor}`}>
                    <div className="flex justify-between items-start">
                      <div className="p-3 rounded-xl bg-white/80 backdrop-blur-sm shadow-sm">
                        {module.icon}
                      </div>
                      {module.badge && (
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ev-red text-white text-xs">
                          {module.badge}
                        </span>
                      )}
                    </div>
                    <CardTitle className="mt-3">{module.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">
                      {module.description}
                    </p>
                  </CardContent>
                  <CardFooter className="border-t pt-4">
                    <div className="w-full">
                      {typeof module.detail === 'string' ? (
                        <p className="text-sm font-medium">{module.detail}</p>
                      ) : (
                        module.detail
                      )}
                    </div>
                  </CardFooter>
                </Card>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </PageTransition>
  );
};

export default Index;
