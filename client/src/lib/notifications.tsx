import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiRequest } from './queryClient';

export interface SystemAlert {
  id: number;
  title: string;
  content: string;
  timestamp: string;
  category: string;
}

interface NotificationContextType {
  unreadCount: number;
  alerts: SystemAlert[];
  refresh: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);

  const fetchData = async () => {
    try {
      const data = await apiRequest('/api/messages/unread-count');
      setUnreadCount(data.count || 0);
    } catch (err) {
      // Silently handle error - API endpoint exists but may return empty data
      setUnreadCount(0);
    }

    try {
      const data = await apiRequest('/api/alerts');
      setAlerts(Array.isArray(data) ? data : []);
    } catch (err) {
      // Silently handle error - API endpoint exists but may return empty data
      setAlerts([]);
    }
  };

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, 10000);
    return () => clearInterval(id);
  }, []);

  return (
    <NotificationContext.Provider value={{ unreadCount, alerts, refresh: fetchData }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return ctx;
};
