import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  User, 
  MessageSquare, 
  Heart, 
  Lock, 
  Unlock, 
  Shield, 
  CheckCircle2, 
  Calendar, 
  Activity 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface ConnectionHealthChoice {
  title: string;
  category: string;
  description: string;
  effectiveness: 'high' | 'moderate' | 'low';
  date: string;
}

interface ConnectionHealthMetric {
  name: string;
  value: string;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  isPublic: boolean;
}

interface ConnectionHealthGoal {
  title: string;
  description: string;
  progress: number;
  targetDate: string;
  isPublic: boolean;
}

interface ConnectionProfile {
  id: number;
  name: string;
  type: string;
  avatarUrl?: string;
  specialty?: string;
  joinedDate?: string;
  members?: string;
  bio?: string;
  healthInterests?: string[];
  healthChoices?: ConnectionHealthChoice[];
  healthMetrics?: ConnectionHealthMetric[];
  healthGoals?: ConnectionHealthGoal[];
  privacySettings: {
    profileVisibility: 'public' | 'connections' | 'private';
    healthMetricsVisibility: 'public' | 'connections' | 'private';
    healthChoicesVisibility: 'public' | 'connections' | 'private';
    healthGoalsVisibility: 'public' | 'connections' | 'private';
  };
}

interface ConnectionProfileProps {
  connection: ConnectionProfile;
  onUpdatePrivacy?: (id: number, settings: ConnectionProfile['privacySettings']) => void;
  isOwnProfile?: boolean;
}

export function ConnectionProfile({ 
  connection, 
  onUpdatePrivacy,
  isOwnProfile = false
}: ConnectionProfileProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [privacySettings, setPrivacySettings] = useState(connection.privacySettings);

  const handlePrivacyChange = (category: keyof ConnectionProfile['privacySettings'], value: 'public' | 'connections' | 'private') => {
    const newSettings = {
      ...privacySettings,
      [category]: value
    };
    setPrivacySettings(newSettings);
    onUpdatePrivacy && onUpdatePrivacy(connection.id, newSettings);
  };

  const getPrivacyIcon = (visibility: 'public' | 'connections' | 'private') => {
    switch (visibility) {
      case 'public':
        return <Unlock className="w-4 h-4 text-green-500" />;
      case 'connections':
        return <Shield className="w-4 h-4 text-blue-500" />;
      case 'private':
        return <Lock className="w-4 h-4 text-red-500" />;
    }
  };

  const getPrivacyLabel = (visibility: 'public' | 'connections' | 'private') => {
    switch (visibility) {
      case 'public':
        return 'Public';
      case 'connections':
        return 'Connections Only';
      case 'private':
        return 'Private';
    }
  };

  const getEffectivenessColor = (effectiveness: 'high' | 'moderate' | 'low') => {
    switch (effectiveness) {
      case 'high':
        return 'bg-green-100 text-green-800';
      case 'moderate':
        return 'bg-amber-100 text-amber-800';
      case 'low':
        return 'bg-red-100 text-red-800';
    }
  };

  if (!isExpanded) {
    return (
      <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
            {connection.avatarUrl ? (
              <img 
                src={connection.avatarUrl} 
                alt={connection.name} 
                className="w-full h-full rounded-full object-cover" 
              />
            ) : (
              <User className="w-8 h-8 text-primary" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold">{connection.name}</h3>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              {connection.type}
              {connection.privacySettings.profileVisibility !== 'public' && (
                <span>{getPrivacyIcon(connection.privacySettings.profileVisibility)}</span>
              )}
            </p>
          </div>
        </div>
        <div className="border-t pt-4">
          {connection.specialty && (
            <p className="text-sm mb-2"><strong>Specialty:</strong> {connection.specialty}</p>
          )}
          {connection.joinedDate && (
            <p className="text-sm mb-2"><strong>Joined:</strong> {connection.joinedDate}</p>
          )}
          {connection.members && (
            <p className="text-sm mb-2"><strong>Community:</strong> {connection.members}</p>
          )}
          <div className="flex justify-between mt-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsExpanded(true)}
            >
              View Profile
            </Button>
            <Button variant="outline" size="sm">
              <MessageSquare className="w-4 h-4 mr-2" />
              Message
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
              {connection.avatarUrl ? (
                <img 
                  src={connection.avatarUrl} 
                  alt={connection.name} 
                  className="w-full h-full rounded-full object-cover" 
                />
              ) : (
                <User className="w-8 h-8 text-primary" />
              )}
            </div>
            <div>
              <CardTitle>{connection.name}</CardTitle>
              <CardDescription className="flex items-center gap-1">
                {connection.type}
                {!isOwnProfile && connection.privacySettings.profileVisibility !== 'public' && (
                  <span>{getPrivacyIcon(connection.privacySettings.profileVisibility)}</span>
                )}
              </CardDescription>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <MessageSquare className="w-4 h-4 mr-2" />
              Message
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsExpanded(false)}
            >
              Collapse
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="health">Health Choices</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
            {isOwnProfile && <TabsTrigger value="privacy">Privacy</TabsTrigger>}
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            {connection.bio && (
              <div>
                <h3 className="text-sm font-semibold mb-2">About</h3>
                <p className="text-sm text-muted-foreground">{connection.bio}</p>
              </div>
            )}
            
            {connection.specialty && (
              <div>
                <h3 className="text-sm font-semibold mb-2">Specialty</h3>
                <p className="text-sm text-muted-foreground">{connection.specialty}</p>
              </div>
            )}
            
            {connection.healthInterests && connection.healthInterests.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-2">Health Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {connection.healthInterests.map(interest => (
                    <Badge key={interest} variant="secondary">{interest}</Badge>
                  ))}
                </div>
              </div>
            )}
            
            {connection.healthMetrics && connection.healthMetrics.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold">Health Metrics</h3>
                  {!isOwnProfile && (
                    <span className="text-xs flex items-center gap-1">
                      {getPrivacyIcon(connection.privacySettings.healthMetricsVisibility)}
                      {getPrivacyLabel(connection.privacySettings.healthMetricsVisibility)}
                    </span>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  {connection.healthMetrics
                    .filter(metric => isOwnProfile || metric.isPublic || 
                      (connection.privacySettings.healthMetricsVisibility === 'public') ||
                      (connection.privacySettings.healthMetricsVisibility === 'connections'))
                    .map(metric => (
                      <div key={metric.name} className="bg-gray-50 p-3 rounded">
                        <div className="flex justify-between items-center">
                          <p className="text-xs text-muted-foreground">{metric.name}</p>
                          {isOwnProfile && (
                            <Switch 
                              checked={metric.isPublic} 
                              onCheckedChange={() => {/* Handle metric privacy toggle */}}
                              className="scale-75 origin-right"
                            />
                          )}
                        </div>
                        <div className="flex items-end mt-1">
                          <span className="text-lg font-semibold">{metric.value}</span>
                          {metric.unit && <span className="text-xs ml-1 mb-0.5">{metric.unit}</span>}
                          {metric.trend && (
                            <span className="ml-2">
                              {metric.trend === 'up' ? '↑' : metric.trend === 'down' ? '↓' : '→'}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="health" className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold">Health Choices That Work For Me</h3>
              {!isOwnProfile && (
                <span className="text-xs flex items-center gap-1">
                  {getPrivacyIcon(connection.privacySettings.healthChoicesVisibility)}
                  {getPrivacyLabel(connection.privacySettings.healthChoicesVisibility)}
                </span>
              )}
            </div>
            
            {isOwnProfile || 
             connection.privacySettings.healthChoicesVisibility === 'public' || 
             connection.privacySettings.healthChoicesVisibility === 'connections' ? (
              <div className="space-y-4">
                {connection.healthChoices && connection.healthChoices.length > 0 ? (
                  connection.healthChoices.map((choice, i) => (
                    <div key={i} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{choice.title}</h4>
                        <Badge 
                          variant="outline" 
                          className={getEffectivenessColor(choice.effectiveness)}
                        >
                          {choice.effectiveness === 'high' ? 'High Impact' : 
                           choice.effectiveness === 'moderate' ? 'Moderate Impact' : 
                           'Low Impact'}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Category: {choice.category}
                      </p>
                      <p className="text-sm mb-2">{choice.description}</p>
                      <p className="text-xs text-muted-foreground flex items-center">
                        <Calendar className="w-3 h-3 mr-1" /> 
                        Started: {choice.date}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No health choices shared yet.</p>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Lock className="w-10 h-10 text-muted-foreground mb-2" />
                <p className="text-sm font-medium">This information is private</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {connection.name} has chosen to keep their health choices private.
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="goals" className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold">Health Goals</h3>
              {!isOwnProfile && (
                <span className="text-xs flex items-center gap-1">
                  {getPrivacyIcon(connection.privacySettings.healthGoalsVisibility)}
                  {getPrivacyLabel(connection.privacySettings.healthGoalsVisibility)}
                </span>
              )}
            </div>
            
            {isOwnProfile || 
             connection.privacySettings.healthGoalsVisibility === 'public' || 
             connection.privacySettings.healthGoalsVisibility === 'connections' ? (
              <div className="space-y-4">
                {connection.healthGoals && connection.healthGoals.length > 0 ? (
                  connection.healthGoals.map((goal, i) => (
                    <div key={i} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">{goal.title}</h4>
                          <p className="text-xs text-muted-foreground">
                            Target: {goal.targetDate}
                          </p>
                        </div>
                        {isOwnProfile && (
                          <Switch 
                            checked={goal.isPublic} 
                            onCheckedChange={() => {/* Handle goal privacy toggle */}}
                            className="scale-75 origin-right"
                          />
                        )}
                      </div>
                      <p className="text-sm mb-3">{goal.description}</p>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-primary h-2.5 rounded-full" 
                          style={{ width: `${goal.progress}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-muted-foreground">Progress</span>
                        <span className="text-xs font-medium">{goal.progress}%</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No health goals shared yet.</p>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Lock className="w-10 h-10 text-muted-foreground mb-2" />
                <p className="text-sm font-medium">This information is private</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {connection.name} has chosen to keep their health goals private.
                </p>
              </div>
            )}
          </TabsContent>
          
          {isOwnProfile && (
            <TabsContent value="privacy" className="space-y-4">
              <div className="border rounded-lg p-4">
                <h3 className="text-base font-medium mb-4">Privacy Settings</h3>
                
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="profile-visibility" className="font-medium">Profile Visibility</Label>
                      <span className="text-xs flex items-center gap-1">
                        {getPrivacyIcon(privacySettings.profileVisibility)}
                        {getPrivacyLabel(privacySettings.profileVisibility)}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <Button 
                        variant={privacySettings.profileVisibility === 'public' ? 'default' : 'outline'} 
                        size="sm"
                        onClick={() => handlePrivacyChange('profileVisibility', 'public')}
                        className="text-xs h-8"
                      >
                        <Unlock className="w-3 h-3 mr-1" /> Public
                      </Button>
                      <Button 
                        variant={privacySettings.profileVisibility === 'connections' ? 'default' : 'outline'} 
                        size="sm"
                        onClick={() => handlePrivacyChange('profileVisibility', 'connections')}
                        className="text-xs h-8"
                      >
                        <Shield className="w-3 h-3 mr-1" /> Connections
                      </Button>
                      <Button 
                        variant={privacySettings.profileVisibility === 'private' ? 'default' : 'outline'} 
                        size="sm"
                        onClick={() => handlePrivacyChange('profileVisibility', 'private')}
                        className="text-xs h-8"
                      >
                        <Lock className="w-3 h-3 mr-1" /> Private
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Controls who can see your basic profile information.
                    </p>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="health-metrics-visibility" className="font-medium">Health Metrics</Label>
                      <span className="text-xs flex items-center gap-1">
                        {getPrivacyIcon(privacySettings.healthMetricsVisibility)}
                        {getPrivacyLabel(privacySettings.healthMetricsVisibility)}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <Button 
                        variant={privacySettings.healthMetricsVisibility === 'public' ? 'default' : 'outline'} 
                        size="sm"
                        onClick={() => handlePrivacyChange('healthMetricsVisibility', 'public')}
                        className="text-xs h-8"
                      >
                        <Unlock className="w-3 h-3 mr-1" /> Public
                      </Button>
                      <Button 
                        variant={privacySettings.healthMetricsVisibility === 'connections' ? 'default' : 'outline'} 
                        size="sm"
                        onClick={() => handlePrivacyChange('healthMetricsVisibility', 'connections')}
                        className="text-xs h-8"
                      >
                        <Shield className="w-3 h-3 mr-1" /> Connections
                      </Button>
                      <Button 
                        variant={privacySettings.healthMetricsVisibility === 'private' ? 'default' : 'outline'} 
                        size="sm"
                        onClick={() => handlePrivacyChange('healthMetricsVisibility', 'private')}
                        className="text-xs h-8"
                      >
                        <Lock className="w-3 h-3 mr-1" /> Private
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Controls who can see your health metrics and statistics.
                    </p>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="health-choices-visibility" className="font-medium">Health Choices</Label>
                      <span className="text-xs flex items-center gap-1">
                        {getPrivacyIcon(privacySettings.healthChoicesVisibility)}
                        {getPrivacyLabel(privacySettings.healthChoicesVisibility)}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <Button 
                        variant={privacySettings.healthChoicesVisibility === 'public' ? 'default' : 'outline'} 
                        size="sm"
                        onClick={() => handlePrivacyChange('healthChoicesVisibility', 'public')}
                        className="text-xs h-8"
                      >
                        <Unlock className="w-3 h-3 mr-1" /> Public
                      </Button>
                      <Button 
                        variant={privacySettings.healthChoicesVisibility === 'connections' ? 'default' : 'outline'} 
                        size="sm"
                        onClick={() => handlePrivacyChange('healthChoicesVisibility', 'connections')}
                        className="text-xs h-8"
                      >
                        <Shield className="w-3 h-3 mr-1" /> Connections
                      </Button>
                      <Button 
                        variant={privacySettings.healthChoicesVisibility === 'private' ? 'default' : 'outline'} 
                        size="sm"
                        onClick={() => handlePrivacyChange('healthChoicesVisibility', 'private')}
                        className="text-xs h-8"
                      >
                        <Lock className="w-3 h-3 mr-1" /> Private
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Controls who can see your health choices and what works for you.
                    </p>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="health-goals-visibility" className="font-medium">Health Goals</Label>
                      <span className="text-xs flex items-center gap-1">
                        {getPrivacyIcon(privacySettings.healthGoalsVisibility)}
                        {getPrivacyLabel(privacySettings.healthGoalsVisibility)}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <Button 
                        variant={privacySettings.healthGoalsVisibility === 'public' ? 'default' : 'outline'} 
                        size="sm"
                        onClick={() => handlePrivacyChange('healthGoalsVisibility', 'public')}
                        className="text-xs h-8"
                      >
                        <Unlock className="w-3 h-3 mr-1" /> Public
                      </Button>
                      <Button 
                        variant={privacySettings.healthGoalsVisibility === 'connections' ? 'default' : 'outline'} 
                        size="sm"
                        onClick={() => handlePrivacyChange('healthGoalsVisibility', 'connections')}
                        className="text-xs h-8"
                      >
                        <Shield className="w-3 h-3 mr-1" /> Connections
                      </Button>
                      <Button 
                        variant={privacySettings.healthGoalsVisibility === 'private' ? 'default' : 'outline'} 
                        size="sm"
                        onClick={() => handlePrivacyChange('healthGoalsVisibility', 'private')}
                        className="text-xs h-8"
                      >
                        <Lock className="w-3 h-3 mr-1" /> Private
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Controls who can see your health goals and progress.
                    </p>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <Button className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Save Privacy Settings
                  </Button>
                </div>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default ConnectionProfile;