import React, { useState } from 'react';
import { Users, User, Search, Plus, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConnectionProfile } from "@/components/connection-profile";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Sample data for connections with expanded profiles including privacy settings
const connectionsData = [
  { 
    id: 1,
    name: "Dr. Jane Smith", 
    type: "Health Professional", 
    specialty: "Nutritionist",
    bio: "Certified nutritionist with 10+ years of experience specializing in holistic nutrition and wellness. I help clients develop sustainable eating habits for optimal health.",
    healthInterests: ["Nutrition", "Holistic Health", "Preventive Care"],
    healthChoices: [
      {
        title: "Mediterranean Diet",
        category: "Nutrition",
        description: "Focus on plant-based foods, healthy fats, and limited red meat intake for overall health maintenance.",
        effectiveness: "high" as "high" | "moderate" | "low",
        date: "January 2023"
      },
      {
        title: "Morning Yoga",
        category: "Fitness",
        description: "15-minute yoga routine every morning to improve flexibility and start the day with mental clarity.",
        effectiveness: "moderate" as "high" | "moderate" | "low",
        date: "March 2023"
      }
    ],
    healthMetrics: [
      { name: "Steps", value: "8,500", unit: "daily avg", trend: "up" as "up" | "down" | "stable", isPublic: true },
      { name: "Sleep", value: "7.5", unit: "hours", trend: "stable" as "up" | "down" | "stable", isPublic: true }
    ],
    healthGoals: [
      {
        title: "Improve client success rates",
        description: "Help 90% of clients achieve their primary nutrition goals within 6 months",
        progress: 75,
        targetDate: "December 2025",
        isPublic: true
      }
    ],
    privacySettings: {
      profileVisibility: "public" as "public" | "connections" | "private",
      healthMetricsVisibility: "public" as "public" | "connections" | "private",
      healthChoicesVisibility: "public" as "public" | "connections" | "private",
      healthGoalsVisibility: "public" as "public" | "connections" | "private"
    }
  },
  { 
    id: 2,
    name: "Mike Johnson", 
    type: "Friend", 
    joinedDate: "2 months ago",
    bio: "Fitness enthusiast and tech professional. I'm passionate about using technology to improve health and wellness outcomes.",
    healthInterests: ["Running", "Strength Training", "Biohacking"],
    healthChoices: [
      {
        title: "High-Intensity Interval Training",
        category: "Fitness",
        description: "3 HIIT sessions per week for cardiovascular health and efficient fat burning.",
        effectiveness: "high" as "high" | "moderate" | "low",
        date: "April 2023"
      },
      {
        title: "Time-Restricted Eating",
        category: "Nutrition",
        description: "8-hour eating window (11am-7pm) to regulate metabolism and improve energy levels.",
        effectiveness: "moderate" as "high" | "moderate" | "low",
        date: "February 2024"
      }
    ],
    healthMetrics: [
      { name: "Weight", value: "175", unit: "lbs", trend: "down" as "up" | "down" | "stable", isPublic: false },
      { name: "Run Distance", value: "25", unit: "miles/week", trend: "up" as "up" | "down" | "stable", isPublic: true }
    ],
    healthGoals: [
      {
        title: "Complete Marathon",
        description: "Train for and complete the upcoming city marathon in under 4 hours",
        progress: 60,
        targetDate: "November 2025",
        isPublic: true
      }
    ],
    privacySettings: {
      profileVisibility: "connections" as "public" | "connections" | "private",
      healthMetricsVisibility: "connections" as "public" | "connections" | "private",
      healthChoicesVisibility: "public" as "public" | "connections" | "private",
      healthGoalsVisibility: "public" as "public" | "connections" | "private"
    }
  },
  { 
    id: 3,
    name: "Health Club SF", 
    type: "Organization", 
    members: "243 members",
    bio: "A community-focused health club promoting wellness through accessible fitness programs and health education for all ages and abilities.",
    healthInterests: ["Community Health", "Fitness Education", "Wellness Programs"],
    healthChoices: [
      {
        title: "Group Fitness Classes",
        category: "Community",
        description: "Building community through shared fitness experiences and social support networks.",
        effectiveness: "high" as "high" | "moderate" | "low",
        date: "January 2022"
      }
    ],
    healthMetrics: [
      { name: "Member Retention", value: "87", unit: "%", trend: "up" as "up" | "down" | "stable", isPublic: true },
      { name: "Class Attendance", value: "90", unit: "%", trend: "stable" as "up" | "down" | "stable", isPublic: true }
    ],
    healthGoals: [
      {
        title: "Expand Community Programs",
        description: "Launch 5 new community health initiatives targeting underserved populations",
        progress: 40,
        targetDate: "December 2025",
        isPublic: true
      }
    ],
    privacySettings: {
      profileVisibility: "public" as "public" | "connections" | "private",
      healthMetricsVisibility: "public" as "public" | "connections" | "private",
      healthChoicesVisibility: "public" as "public" | "connections" | "private",
      healthGoalsVisibility: "public" as "public" | "connections" | "private"
    }
  },
  { 
    id: 4,
    name: "Fitness with Tom", 
    type: "Health Coach", 
    specialty: "Cardio Training",
    bio: "Certified personal trainer specializing in cardio fitness, interval training, and endurance building for athletes and fitness enthusiasts.",
    healthInterests: ["Cardiovascular Health", "Athletic Performance", "Endurance Training"],
    healthChoices: [
      {
        title: "Heart Rate Zone Training",
        category: "Fitness",
        description: "Structured workouts based on specific heart rate zones to maximize cardio development.",
        effectiveness: "high" as "high" | "moderate" | "low",
        date: "June 2023"
      },
      {
        title: "Recovery Protocol",
        category: "Wellness",
        description: "Systematic approach to recovery including contrast therapy, stretching, and nutrition timing.",
        effectiveness: "high" as "high" | "moderate" | "low",
        date: "August 2023"
      }
    ],
    healthMetrics: [
      { name: "VO2 Max", value: "58", unit: "ml/kg/min", trend: "up" as "up" | "down" | "stable", isPublic: true },
      { name: "Resting HR", value: "48", unit: "bpm", trend: "down" as "up" | "down" | "stable", isPublic: true }
    ],
    healthGoals: [
      {
        title: "Client Performance",
        description: "Help 80% of clients improve their aerobic capacity by at least 15%",
        progress: 65,
        targetDate: "October 2025",
        isPublic: true
      }
    ],
    privacySettings: {
      profileVisibility: "public" as "public" | "connections" | "private",
      healthMetricsVisibility: "connections" as "public" | "connections" | "private",
      healthChoicesVisibility: "public" as "public" | "connections" | "private",
      healthGoalsVisibility: "connections" as "public" | "connections" | "private"
    }
  }
];

export function Connections() {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [currentUserConnection, setCurrentUserConnection] = useState({
    id: 0,
    name: "John Doe",
    type: "You",
    bio: "Health enthusiast focused on preventive care and holistic approaches to wellness.",
    healthInterests: ["Meditation", "Plant-based Diet", "Functional Fitness"],
    healthChoices: [
      {
        title: "Daily Meditation",
        category: "Mental Health",
        description: "20-minute guided meditation sessions to reduce stress and improve focus.",
        effectiveness: "high" as "high" | "moderate" | "low",
        date: "January 2024"
      },
      {
        title: "Plant-Based Diet",
        category: "Nutrition",
        description: "Following a primarily plant-based diet with limited animal products for environmental and health benefits.",
        effectiveness: "moderate" as "high" | "moderate" | "low",
        date: "November 2023"
      }
    ],
    healthMetrics: [
      { name: "Meditation", value: "20", unit: "min/day", trend: "stable" as "up" | "down" | "stable", isPublic: false },
      { name: "Sleep", value: "7.2", unit: "hours", trend: "up" as "up" | "down" | "stable", isPublic: true },
      { name: "Weight", value: "170", unit: "lbs", trend: "stable" as "up" | "down" | "stable", isPublic: false }
    ],
    healthGoals: [
      {
        title: "Consistent Meditation",
        description: "Maintain daily meditation practice of at least 20 minutes",
        progress: 80,
        targetDate: "Ongoing",
        isPublic: true
      },
      {
        title: "Improve Sleep Quality",
        description: "Achieve 8 hours of quality sleep consistently",
        progress: 65,
        targetDate: "July 2025",
        isPublic: false
      }
    ],
    privacySettings: {
      profileVisibility: "connections" as "public" | "connections" | "private",
      healthMetricsVisibility: "connections" as "public" | "connections" | "private",
      healthChoicesVisibility: "connections" as "public" | "connections" | "private",
      healthGoalsVisibility: "private" as "public" | "connections" | "private"
    }
  });

  const [updatedPrivacySettings, setUpdatedPrivacySettings] = useState<{
    profileVisibility: "public" | "connections" | "private";
    healthMetricsVisibility: "public" | "connections" | "private";
    healthChoicesVisibility: "public" | "connections" | "private";
    healthGoalsVisibility: "public" | "connections" | "private";
  }>(currentUserConnection.privacySettings);

  const handleUpdatePrivacy = (id: number, settings: { 
    profileVisibility: "public" | "connections" | "private";
    healthMetricsVisibility: "public" | "connections" | "private";
    healthChoicesVisibility: "public" | "connections" | "private";
    healthGoalsVisibility: "public" | "connections" | "private";
  }) => {
    if (id === 0) {
      // This is the current user
      setUpdatedPrivacySettings(settings);
    }
    // In a real app, you would save these settings to the backend
    console.log(`Updated privacy settings for user ${id}:`, settings);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-6">
        <Users className="w-6 h-6" />
        <h1 className="text-3xl font-bold">Connections</h1>
      </div>

      <p className="text-lg mb-8">
        Connect with family, friends, health professionals, and communities to share your health journey and learn from others.
      </p>

      <div className="bg-white p-4 rounded-lg shadow mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="text"
              placeholder="Search for connections..."
              className="w-full pl-10 py-2 border rounded-md"
            />
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Health Professionals</DropdownMenuItem>
                <DropdownMenuItem>Communities</DropdownMenuItem>
                <DropdownMenuItem>Friends & Family</DropdownMenuItem>
                <DropdownMenuItem>Recently Active</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button>Find Connections</Button>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All Connections</TabsTrigger>
          <TabsTrigger value="professionals">Health Professionals</TabsTrigger>
          <TabsTrigger value="communities">Communities</TabsTrigger>
          <TabsTrigger value="personal">Friends & Family</TabsTrigger>
          <TabsTrigger value="your-profile">Your Profile</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-4">
          <div className="grid md:grid-cols-2 gap-6">
            {connectionsData.map((connection) => (
              <ConnectionProfile 
                key={connection.id} 
                connection={connection}
              />
            ))}
            
            <div className="bg-white p-6 rounded-lg shadow border-2 border-dashed border-primary/30 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors">
              <Button variant="ghost" className="w-full h-full flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Plus className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold mb-2">Add Connection</h2>
                  <p className="text-sm text-muted-foreground">Connect with health professionals and like-minded individuals</p>
                </div>
              </Button>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="professionals" className="mt-4">
          <div className="grid md:grid-cols-2 gap-6">
            {connectionsData
              .filter(conn => conn.type === "Health Professional" || conn.type === "Health Coach")
              .map((connection) => (
                <ConnectionProfile 
                  key={connection.id} 
                  connection={connection}
                />
              ))}
          </div>
        </TabsContent>
        
        <TabsContent value="communities" className="mt-4">
          <div className="grid md:grid-cols-2 gap-6">
            {connectionsData
              .filter(conn => conn.type === "Organization")
              .map((connection) => (
                <ConnectionProfile 
                  key={connection.id} 
                  connection={connection}
                />
              ))}
          </div>
        </TabsContent>
        
        <TabsContent value="personal" className="mt-4">
          <div className="grid md:grid-cols-2 gap-6">
            {connectionsData
              .filter(conn => conn.type === "Friend" || conn.type === "Family")
              .map((connection) => (
                <ConnectionProfile 
                  key={connection.id} 
                  connection={connection}
                />
              ))}
          </div>
        </TabsContent>
        
        <TabsContent value="your-profile" className="mt-4">
          <div className="max-w-3xl mx-auto">
            <ConnectionProfile 
              connection={{
                ...currentUserConnection,
                privacySettings: updatedPrivacySettings
              }}
              onUpdatePrivacy={handleUpdatePrivacy}
              isOwnProfile={true}
            />
            
            <div className="mt-8 bg-primary/5 border border-primary/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">About Your Connection Profile</h3>
              <p className="text-sm mb-4">
                Your connection profile allows you to share selected health information with your connections while maintaining privacy control. Here's how it works:
              </p>
              
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-xs mt-0.5">1</div>
                  <p>Choose what health information you want to share: metrics, choices, and goals</p>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-xs mt-0.5">2</div>
                  <p>Set privacy levels for each category: Public, Connections Only, or Private</p>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-xs mt-0.5">3</div>
                  <p>Share your health journey while protecting sensitive information</p>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-xs mt-0.5">4</div>
                  <p>Learn from others' health choices while respecting their privacy preferences</p>
                </li>
              </ul>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default Connections;