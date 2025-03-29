
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckSquare, Trash2 } from 'lucide-react';
import PageTransition from '@/components/layout/PageTransition';
import Card from '@/components/shared/Card';
import Button from '@/components/shared/Button';
import NotificationToast from '@/components/shared/NotificationToast';
import { useApp } from '@/context/AppContext';
import { toast } from 'sonner';

const Notifications = () => {
  const { notifications, markNotificationAsRead, clearNotifications, addNotification } = useApp();
  
  const handleClearAll = () => {
    clearNotifications();
    toast.success('Notifications cleared', {
      description: 'All notifications have been removed.',
    });
  };
  
  const handleMarkAllAsRead = () => {
    notifications.forEach(notification => {
      if (!notification.read) {
        markNotificationAsRead(notification.id);
      }
    });
    toast.success('Notifications marked as read', {
      description: 'All notifications have been marked as read.',
    });
  };
  
  const handleDismissNotification = (id: string) => {
    markNotificationAsRead(id);
  };
  
  const handleCreateTestNotification = () => {
    const types = ['info', 'warning', 'error', 'success'] as const;
    const randomType = types[Math.floor(Math.random() * types.length)];
    
    const notifications = {
      info: {
        title: 'New Feature Available',
        message: 'Check out our new station finder feature for improved charging experience.',
      },
      warning: {
        title: 'Upcoming Maintenance',
        message: 'The charging network will undergo maintenance tonight from 2-4 AM.',
      },
      error: {
        title: 'Connection Error',
        message: 'Unable to connect to the charging network. Please try again later.',
      },
      success: {
        title: 'Charging Complete',
        message: 'Your vehicle has been successfully charged to 100%.',
      },
    };
    
    addNotification({
      title: notifications[randomType].title,
      message: notifications[randomType].message,
      type: randomType,
    });
  };
  
  return (
    <PageTransition>
      <div className="container max-w-4xl mx-auto pt-24 px-4 pb-16">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center"
        >
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground mt-2">
            Stay updated with alerts and important information
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4"
        >
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleMarkAllAsRead}
              icon={<CheckSquare className="h-4 w-4" />}
              disabled={notifications.length === 0 || notifications.every(n => n.read)}
            >
              Mark All as Read
            </Button>
            <Button
              variant="outline"
              onClick={handleClearAll}
              icon={<Trash2 className="h-4 w-4" />}
              disabled={notifications.length === 0}
            >
              Clear All
            </Button>
          </div>
          
          <Button
            variant="secondary"
            onClick={handleCreateTestNotification}
            icon={<Bell className="h-4 w-4" />}
          >
            Test Notification
          </Button>
        </motion.div>
        
        <div className="space-y-4">
          <AnimatePresence>
            {notifications.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="text-center p-12 bg-secondary rounded-xl"
              >
                <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold mb-2">No Notifications</h2>
                <p className="text-muted-foreground">
                  You don't have any notifications at the moment.
                </p>
              </motion.div>
            ) : (
              notifications.map((notification, i) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{
                    duration: 0.4,
                    delay: i * 0.05,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <NotificationToast
                    notification={notification}
                    onDismiss={() => handleDismissNotification(notification.id)}
                  />
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </PageTransition>
  );
};

export default Notifications;
