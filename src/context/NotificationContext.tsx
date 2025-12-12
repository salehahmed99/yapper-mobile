import { registerForPushNotificationsAsync } from '@/src/utils/registerForPushNotificationsAsync';
import * as Notifications from 'expo-notifications';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface NotificationContextType {
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);

  useEffect(() => {
    registerForPushNotificationsAsync()
      .then((token) => setExpoPushToken(token ?? ''))
      .catch((error: any) => {
        console.error('Failed to register for push notifications:', error);
        setExpoPushToken(null);
      });
    const notificationListener = Notifications.addNotificationReceivedListener((notification) => {
      setNotification(notification);
    });

    const responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log(response);
    });

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, []);

  return (
    <NotificationContext.Provider value={{ expoPushToken, notification }}>{children}</NotificationContext.Provider>
  );
};
