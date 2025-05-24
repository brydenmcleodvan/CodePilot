import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { apiRequest } from '@/lib/queryClient';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Calendar,
  Clock,
  Heart,
  Stethoscope,
  MessageSquare,
  Activity,
  Pill,
  UserCheck,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Filter,
  Users,
} from 'lucide-react';

interface FamilyMember {
  id: number;
  name: string;
  profileImage?: string;
  relationship: 'self' | 'spouse' | 'child' | 'parent' | 'sibling';
  dateOfBirth: string;
  healthcareProvider?: string;
}

interface TimelineEvent {
  id: string;
  memberId: number;
  memberName: string;
  memberImage?: string;
  type: 'appointment' | 'message' | 'health_metric' | 'medication' | 'checkup' | 'emergency';
  title: string;
  description: string;
  timestamp: string;
  priority: 'high' | 'medium' | 'low';
  status: 'completed' | 'upcoming' | 'pending' | 'cancelled';
  metadata?: {
    appointmentType?: string;
    doctorName?: string;
    healthValue?: string;
    medicationName?: string;
    location?: string;
  };
}

interface FamilyTimelineProps {
  familyId?: number;
  showAllMembers?: boolean;
  maxEvents?: number;
}

const eventTypeConfig = {
  appointment: {
    icon: Calendar,
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-900/10',
  },
  message: {
    icon: MessageSquare,
    color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-900/10',
  },
  health_metric: {
    icon: Activity,
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-900/10',
  },
  medication: {
    icon: Pill,
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    bgColor: 'bg-orange-50 dark:bg-orange-900/10',
  },
  checkup: {
    icon: Stethoscope,
    color: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400',
    bgColor: 'bg-teal-50 dark:bg-teal-900/10',
  },
  emergency: {
    icon: AlertCircle,
    color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-900/10',
  },
};

const priorityConfig = {
  high: 'border-l-red-500',
  medium: 'border-l-yellow-500',
  low: 'border-l-green-500',
};

const statusConfig = {
  completed: { icon: CheckCircle, color: 'text-green-500' },
  upcoming: { icon: Clock, color: 'text-blue-500' },
  pending: { icon: Clock, color: 'text-yellow-500' },
  cancelled: { icon: AlertCircle, color: 'text-red-500' },
};

export default function FamilyTimeline({ 
  familyId, 
  showAllMembers = true, 
  maxEvents = 50 
}: FamilyTimelineProps) {
  const [selectedMember, setSelectedMember] = useState<number | 'all'>('all');
  const [selectedEventType, setSelectedEventType] = useState<string>('all');
  const [timeFilter, setTimeFilter] = useState<'week' | 'month' | 'quarter' | 'all'>('month');

  // Fetch family members
  const { data: familyMembers = [], isLoading: membersLoading } = useQuery<FamilyMember[]>({
    queryKey: ['/api/family/members', familyId],
  });

  // Fetch timeline events
  const { data: timelineEvents = [], isLoading: eventsLoading } = useQuery<TimelineEvent[]>({
    queryKey: ['/api/family/timeline', familyId, selectedMember, timeFilter],
    enabled: familyMembers.length > 0,
  });

  const isLoading = membersLoading || eventsLoading;

  // Filter events based on selected criteria
  const filteredEvents = timelineEvents
    .filter(event => {
      if (selectedMember !== 'all' && event.memberId !== selectedMember) return false;
      if (selectedEventType !== 'all' && event.type !== selectedEventType) return false;
      return true;
    })
    .slice(0, maxEvents);

  // Group events by date
  const groupedEvents = filteredEvents.reduce((groups, event) => {
    const date = new Date(event.timestamp).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(event);
    return groups;
  }, {} as Record<string, TimelineEvent[]>);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getMemberInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Family Health Timeline</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-1" />
              Filters
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="space-y-4">
          <Tabs value={timeFilter} onValueChange={(value) => setTimeFilter(value as any)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="week">This Week</TabsTrigger>
              <TabsTrigger value="month">This Month</TabsTrigger>
              <TabsTrigger value="quarter">3 Months</TabsTrigger>
              <TabsTrigger value="all">All Time</TabsTrigger>
            </TabsList>
          </Tabs>

          {showAllMembers && familyMembers.length > 1 && (
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedMember === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedMember('all')}
              >
                All Members
              </Button>
              {familyMembers.map((member) => (
                <Button
                  key={member.id}
                  variant={selectedMember === member.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedMember(member.id)}
                  className="flex items-center space-x-2"
                >
                  <Avatar className="w-4 h-4">
                    <AvatarImage src={member.profileImage} />
                    <AvatarFallback className="text-xs">
                      {getMemberInitials(member.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span>{member.name}</span>
                </Button>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedEventType === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedEventType('all')}
            >
              All Events
            </Button>
            {Object.entries(eventTypeConfig).map(([type, config]) => {
              const Icon = config.icon;
              return (
                <Button
                  key={type}
                  variant={selectedEventType === type ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedEventType(type)}
                  className="flex items-center space-x-1"
                >
                  <Icon className="h-3 w-3" />
                  <span className="capitalize">{type.replace('_', ' ')}</span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Timeline */}
        <ScrollArea className="h-[600px] pr-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                No events found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                No health events match your current filters.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedEvents).map(([date, events]) => (
                <div key={date} className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {formatDate(date)}
                    </h3>
                    <Badge variant="outline">{events.length} events</Badge>
                  </div>

                  <div className="space-y-3">
                    {events.map((event, index) => {
                      const config = eventTypeConfig[event.type];
                      const Icon = config.icon;
                      const StatusIcon = statusConfig[event.status].icon;

                      return (
                        <motion.div
                          key={event.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          <Card className={`border-l-4 ${priorityConfig[event.priority]} ${config.bgColor}`}>
                            <CardContent className="p-4">
                              <div className="flex items-start space-x-3">
                                <div className={`p-2 rounded-lg ${config.color}`}>
                                  <Icon className="h-4 w-4" />
                                </div>

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center space-x-2">
                                      <h4 className="font-medium text-gray-900 dark:text-gray-100">
                                        {event.title}
                                      </h4>
                                      <StatusIcon className={`h-4 w-4 ${statusConfig[event.status].color}`} />
                                    </div>
                                    <span className="text-sm text-gray-500">
                                      {formatTime(event.timestamp)}
                                    </span>
                                  </div>

                                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                    {event.description}
                                  </p>

                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                      <Avatar className="w-6 h-6">
                                        <AvatarImage src={event.memberImage} />
                                        <AvatarFallback className="text-xs">
                                          {getMemberInitials(event.memberName)}
                                        </AvatarFallback>
                                      </Avatar>
                                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {event.memberName}
                                      </span>
                                    </div>

                                    <div className="flex space-x-2">
                                      <Badge className={config.color}>
                                        {event.type.replace('_', ' ')}
                                      </Badge>
                                      {event.priority === 'high' && (
                                        <Badge variant="destructive">Urgent</Badge>
                                      )}
                                    </div>
                                  </div>

                                  {event.metadata && (
                                    <div className="mt-3 text-xs text-gray-500 space-y-1">
                                      {event.metadata.doctorName && (
                                        <div>Doctor: {event.metadata.doctorName}</div>
                                      )}
                                      {event.metadata.location && (
                                        <div>Location: {event.metadata.location}</div>
                                      )}
                                      {event.metadata.healthValue && (
                                        <div>Value: {event.metadata.healthValue}</div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}