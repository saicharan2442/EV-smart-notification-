
import React, { createContext, useContext, useState, useEffect } from 'react';
import { vehicles } from '@/data/mockData';
import { toast } from 'sonner';

export type Vehicle = {
  id: string;
  name: string;
  brand: string;
  type: 'car' | 'bike';
  image: string;
};

export type Station = {
  id: string;
  name: string;
  distance: number;
  available: boolean;
  rating: number;
  address: string;
  coordinates: [number, number];
  connectorTypes: string[];
  price: string;
};

export type Notification = {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  timestamp: Date;
  read: boolean;
};

type AppContextType = {
  selectedVehicle: Vehicle | null;
  setSelectedVehicle: (vehicle: Vehicle | null) => void;
  batteryPercentage: number;
  setBatteryPercentage: (percentage: number) => void;
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationAsRead: (id: string) => void;
  clearNotifications: () => void;
  userLocation: [number, number];
  setUserLocation: (location: [number, number]) => void;
  nearbyStations: Station[];
  setNearbyStations: (stations: Station[]) => void;
  selectedStation: Station | null;
  setSelectedStation: (station: Station | null) => void;
  routeDirections: any | null;
  setRouteDirections: (directions: any | null) => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

// Store notification key in localStorage
const NOTIFICATIONS_STORAGE_KEY = 'evChargingAppNotifications';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [batteryPercentage, setBatteryPercentage] = useState<number>(75);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // Visakhapatnam city center coordinates (corrected)
  const [userLocation, setUserLocation] = useState<[number, number]>([83.3184, 17.7268]); 
  const [nearbyStations, setNearbyStations] = useState<Station[]>([]);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [routeDirections, setRouteDirections] = useState<any | null>(null);

  // Load saved vehicle from localStorage
  useEffect(() => {
    const savedVehicle = localStorage.getItem('selectedVehicle');
    if (savedVehicle) {
      try {
        setSelectedVehicle(JSON.parse(savedVehicle));
      } catch (e) {
        console.error('Failed to parse saved vehicle', e);
      }
    }
    
    // Load saved notifications
    const savedNotifications = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (savedNotifications) {
      try {
        const parsedNotifications = JSON.parse(savedNotifications);
        // Convert string dates back to Date objects
        const processedNotifications = parsedNotifications.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        }));
        setNotifications(processedNotifications);
      } catch (e) {
        console.error('Failed to parse saved notifications', e);
      }
    }
  }, []);

  // Save selected vehicle to localStorage
  useEffect(() => {
    if (selectedVehicle) {
      localStorage.setItem('selectedVehicle', JSON.stringify(selectedVehicle));
    }
  }, [selectedVehicle]);
  
  // Save notifications to localStorage
  useEffect(() => {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
  }, [notifications]);

  // Monitor battery and trigger notifications
  useEffect(() => {
    if (batteryPercentage <= 20 && batteryPercentage > 10) {
      addNotification({
        title: 'Low Battery Warning',
        message: `Your battery is at ${batteryPercentage}%. Consider charging soon.`,
        type: 'warning',
      });
    } else if (batteryPercentage <= 10) {
      addNotification({
        title: 'Critical Battery Level',
        message: `Battery critically low at ${batteryPercentage}%. Find a charging station immediately.`,
        type: 'error',
      });
    }
  }, [batteryPercentage]);

  // Add notification
  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false,
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    
    // Show toast for the notification
    toast[notification.type === 'error' ? 'error' : 
         notification.type === 'warning' ? 'warning' : 
         notification.type === 'success' ? 'success' : 'info'](
      notification.title,
      {
        description: notification.message,
      }
    );
  };

  // Mark notification as read
  const markNotificationAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  // Clear all notifications
  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <AppContext.Provider
      value={{
        selectedVehicle,
        setSelectedVehicle,
        batteryPercentage,
        setBatteryPercentage,
        notifications,
        addNotification,
        markNotificationAsRead,
        clearNotifications,
        userLocation,
        setUserLocation,
        nearbyStations,
        setNearbyStations,
        selectedStation,
        setSelectedStation,
        routeDirections,
        setRouteDirections,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
