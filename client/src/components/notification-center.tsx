import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  X, 
  Check, 
  Clock,
  AlertCircle,
  Trophy,
  Heart,
  Droplets,
  Activity,
  Moon,
  Smartphone,
  ChevronRight,
  Filter
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { apiRequest, queryClient } from '@/lib/queryClient';

interface UserNotification {
  id: string;
  userId: number;
  triggerId: string;
  type: 'missed_goal' | 'ai_wellness' | 'sync_issue' | 'achievement' | 'reminder';
  title: string;
  body: string;
  actionText?: string;
  actionUrl?: string;
  priority: 'high' | 'medium' | 'low';
  createdAt: string;
  readAt?: string;
  dismissedAt?: string;
  deliveredVia: string[];
}

interface NotificationCenterProps {
  variant?: 'dropdown' | 'page' | 'widget';
  maxHeight?: string;
  showFilters?: boolean;
}

export default function NotificationCenter({ 
  variant = 'dropdown',
  maxHeight = '400px',
  showFilters = false 
}: NotificationCenterProps) {
  const [filter, setFilter] = useState<string>('all');
  const [isOpen, setIsOpen] = useState(false);

  // Fetch notifications
  const { data: notifications = [], isLoading } = useQuery<UserNotification[]>({
    queryKey: ['/api/notifications'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      await apiRequest('POST', `/api/notifications/${notificationId}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    }
  });

  // Dismiss notification mutation
  const dismissMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      await apiRequest('POST', `/api/notifications/${notificationId}/dismiss`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    }
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'missed_goal': return Activity;
      case 'ai_wellness': return Heart;
      case 'sync_issue': return Smartphone;
      case 'achievement': return Trophy;
      case 'reminder': return Clock;
      default: return Bell;
    }
  };

  const getNotificationColor = (type: string, priority: string) => {
    if (priority === 'high') return 'from-red-500 to-pink-600';
    if (type === 'achievement') return 'from-green-500 to-emerald-600';
    if (type === 'ai_wellness') return 'from-blue-500 to-cyan-600';
    if (type === 'sync_issue') return 'from-yellow-500 to-orange-600';
    return 'from-gray-500 to-slate-600';
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      high: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
    };
    return colors[priority as keyof typeof colors] || colors.low;
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notif.readAt;
    return notif.type === filter;
  });

  const unreadCount = notifications.filter(n => !n.readAt).length;

  const handleNotificationClick = (notification: UserNotification) => {
    if (!notification.readAt) {
      markAsReadMutation.mutate(notification.id);
    }
    
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  const handleDismiss = (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    dismissMutation.mutate(notificationId);
  };

  if (variant === 'widget') {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
              <Bell className="h-4 w-4" />
              <span>Recent Nudges</span>
            </h3>
            {unreadCount > 0 && (
              <Badge className="bg-red-500 text-white">
                {unreadCount}
              </Badge>
            )}
          </div>
          
          <div className="space-y-2">
            {filteredNotifications.slice(0, 3).map((notification) => {
              const NotificationIcon = getNotificationIcon(notification.type);
              return (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`p-3 rounded-lg border cursor-pointer hover:shadow-md transition-all ${
                    notification.readAt ? 'bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-700'
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-1.5 rounded-lg bg-gradient-to-r ${getNotificationColor(notification.type, notification.priority)}`}>
                      <NotificationIcon className="h-3 w-3 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {notification.title}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                        {notification.body}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
            
            {filteredNotifications.length === 0 && (
              <div className="text-center py-4">
                <Bell className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  No notifications yet
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.div>
        )}
      </Button>

      {/* Notification Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute right-0 top-full mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border z-50"
          >
            {/* Header */}
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  Notifications
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              {showFilters && (
                <div className="flex items-center space-x-2 mt-3">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <select 
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="text-sm border rounded px-2 py-1"
                  >
                    <option value="all">All</option>
                    <option value="unread">Unread</option>
                    <option value="missed_goal">Missed Goals</option>
                    <option value="ai_wellness">AI Wellness</option>
                    <option value="sync_issue">Sync Issues</option>
                    <option value="achievement">Achievements</option>
                  </select>
                </div>
              )}
            </div>

            {/* Notifications List */}
            <ScrollArea className="max-h-96">
              <div className="p-2">
                {isLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded mb-2"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-2/3"></div>
                      </div>
                    ))}
                  </div>
                ) : filteredNotifications.length > 0 ? (
                  <div className="space-y-2">
                    {filteredNotifications.map((notification) => {
                      const NotificationIcon = getNotificationIcon(notification.type);
                      return (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`p-3 rounded-lg border cursor-pointer hover:shadow-md transition-all group ${
                            notification.readAt 
                              ? 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700' 
                              : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                          }`}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3 flex-1">
                              <div className={`p-2 rounded-lg bg-gradient-to-r ${getNotificationColor(notification.type, notification.priority)}`}>
                                <NotificationIcon className="h-4 w-4 text-white" />
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2 mb-1">
                                  <h4 className={`text-sm font-medium ${
                                    notification.readAt ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-gray-100'
                                  }`}>
                                    {notification.title}
                                  </h4>
                                  <Badge className={getPriorityBadge(notification.priority)}>
                                    {notification.priority}
                                  </Badge>
                                </div>
                                
                                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                                  {notification.body}
                                </p>
                                
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-gray-500">
                                    {new Date(notification.createdAt).toLocaleTimeString([], { 
                                      hour: '2-digit', 
                                      minute: '2-digit' 
                                    })}
                                  </span>
                                  
                                  {notification.actionText && (
                                    <div className="flex items-center space-x-1 text-blue-600 dark:text-blue-400">
                                      <span className="text-xs">{notification.actionText}</span>
                                      <ChevronRight className="h-3 w-3" />
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => handleDismiss(e, notification.id)}
                              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">
                      All caught up! No new notifications.
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Footer */}
            {filteredNotifications.length > 0 && (
              <div className="p-3 border-t bg-gray-50 dark:bg-gray-900">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-blue-600 dark:text-blue-400"
                  onClick={() => {
                    filteredNotifications.forEach(notif => {
                      if (!notif.readAt) {
                        markAsReadMutation.mutate(notif.id);
                      }
                    });
                  }}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Mark all as read
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}