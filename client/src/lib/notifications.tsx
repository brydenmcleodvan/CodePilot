import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiRequest } from './queryClient';

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

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
      const res = await apiRequest('GET', '/api/messages/unread-count');
      await throwIfResNotOk(res);
      const data = await res.json();
      setUnreadCount(data.count || 0);
    } catch (err) {
      setUnreadCount(0);
    }

    try {
      const res = await apiRequest('GET', '/api/alerts');
      await throwIfResNotOk(res);
      const data = await res.json();
      setAlerts(Array.isArray(data) ? data : []);
    } catch (err) {
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
