
import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, Info, X, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Notification } from '@/context/AppContext';

type NotificationToastProps = {
  notification: Notification;
  onDismiss: () => void;
};

const NotificationToast: React.FC<NotificationToastProps> = ({ notification, onDismiss }) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };
  
  const getContainerClasses = () => {
    const baseClasses = "relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-lg p-6 shadow-lg";
    
    switch (notification.type) {
      case 'success':
        return cn(baseClasses, "bg-green-50 text-green-900 border-l-4 border-green-500");
      case 'error':
        return cn(baseClasses, "bg-red-50 text-red-900 border-l-4 border-red-500");
      case 'warning':
        return cn(baseClasses, "bg-yellow-50 text-yellow-900 border-l-4 border-yellow-500");
      default:
        return cn(baseClasses, "bg-blue-50 text-blue-900 border-l-4 border-blue-500");
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      className={getContainerClasses()}
    >
      <div className="flex items-start space-x-3">
        {getIcon()}
        <div>
          <h4 className="font-medium">{notification.title}</h4>
          <p className="text-sm opacity-90">{notification.message}</p>
          <p className="text-xs opacity-70 mt-1">
            {notification.timestamp.toLocaleTimeString()}
          </p>
        </div>
      </div>
      
      <button 
        onClick={onDismiss}
        className="rounded-full p-1 transition-colors duration-200 hover:bg-black/5"
      >
        <X className="h-5 w-5" />
      </button>
    </motion.div>
  );
};

export default NotificationToast;
