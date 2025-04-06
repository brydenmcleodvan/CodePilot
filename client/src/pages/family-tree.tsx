import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Heart, User, UserPlus, Users, Share2, FileDown, ArrowLeft } from "lucide-react";
import { FamilyTree } from '@/components/family-tree';
import FamilyMemberProfile from '@/components/family-member-profile';
import { Link } from "wouter";

interface FamilyMember {
  id: number;
  name: string;
  relation: string;
  lastActive: string;
  profilePicture?: string;
  healthSummary?: {
    status: string;
    insights: Array<{
      type: 'alert' | 'info' | 'success';
      content: string;
    }>;
  };
  healthStats?: Array<{
    statType: string;
    value: string;
    unit?: string;
    colorScheme: string;
  }>;
  medications?: Array<{
    name: string;
    dosage: string;
    schedule: string;
    nextDose: string;
    lastTaken?: string;
  }>;
  upcomingAppointments?: Array<{
    type: string;
    date: string;
    time: string;
    provider: string;
  }>;
  geneticHealth?: {
    inheritedConditions?: Array<{
      name: string;
      description: string;
      riskLevel: 'low' | 'moderate' | 'high';
      recommendedAction: string;
    }>;
    geneticTesting?: {
      lastUpdated: string;
      findings: Array<{
        type: 'positive' | 'negative' | 'warning';
        description: string;
      }>;
    };
  };
}

// Sample data for family members is defined in family.tsx
// This is just a simplified reference for the relation to FamilyTree component
const familyMembers: FamilyMember[] = [];

export default function FamilyTreePage() {
  const [activeTab, setActiveTab] = useState<string>('tree');
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/family">
            <Button variant="ghost" size="sm" className="mr-2">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Family
            </Button>
          </Link>
          
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6" />
            <h1 className="text-3xl font-bold">Family Tree</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <FileDown className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </div>
      
      <p className="text-lg mb-6">
        Track your family's health history, identify inherited conditions, and understand potential health risks through your genetic connections.
      </p>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="mb-6">
          <TabsTrigger value="tree">Family Tree</TabsTrigger>
          <TabsTrigger value="members">Family Members</TabsTrigger>
          <TabsTrigger value="genetic-analysis">Genetic Analysis</TabsTrigger>
        </TabsList>
        
        <TabsContent value="tree" className="space-y-6">
          <FamilyTree />
          
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">About Your Family Health Tree</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-primary" />
                    Track Inherited Conditions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Visualize health conditions passed through generations to better understand your genetic health risks.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    Connect Family Members
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Invite relatives to join your family tree and contribute their health information for a more complete picture.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    Personalized Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Receive tailored health recommendations based on your family's medical history and genetic patterns.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="members" className="space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Family Members</h2>
            <Button>
              <UserPlus className="w-4 h-4 mr-2" />
              Add New Member
            </Button>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* This would render the family members from the original Family component */}
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                  <span className="text-xl text-primary font-bold">JD</span>
                </div>
                <div>
                  <h2 className="text-lg font-semibold">John Doe</h2>
                  <p className="text-sm text-muted-foreground">Self</p>
                </div>
              </div>
              <div className="border-t pt-4">
                <p className="text-sm mb-2"><strong>Last Active:</strong> Today</p>
                <p className="text-sm mb-2">
                  <strong>Health Status:</strong>{' '}
                  <span className="text-green-600">Good</span>
                </p>
                <p className="text-sm"><strong>Upcoming:</strong> Annual checkup in 3 weeks</p>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                  <span className="text-xl text-primary font-bold">SD</span>
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Sarah Doe</h2>
                  <p className="text-sm text-muted-foreground">Spouse</p>
                </div>
              </div>
              <div className="border-t pt-4">
                <p className="text-sm mb-2"><strong>Last Active:</strong> Today</p>
                <p className="text-sm mb-2">
                  <strong>Health Status:</strong>{' '}
                  <span className="text-green-600">Good</span>
                </p>
                <p className="text-sm"><strong>Upcoming:</strong> Annual physical in 2 weeks</p>
              </div>
            </div>
            
            {/* Add Family Member card */}
            <div className="bg-white p-6 rounded-lg shadow border-2 border-dashed border-primary/30 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors">
              <Button variant="ghost" className="w-full h-full flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <UserPlus className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold mb-2">Add Family Member</h2>
                  <p className="text-sm text-muted-foreground">Invite a family member to connect and share health information</p>
                </div>
              </Button>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="genetic-analysis" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Family Genetic Analysis</CardTitle>
              <CardDescription>
                Analyze inherited health patterns across your family
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="p-6 bg-primary/5 rounded-lg border border-primary/20">
                  <h3 className="text-lg font-medium mb-4">Top Inherited Conditions in Your Family</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-amber-100 rounded-full p-2">
                        <Heart className="w-5 h-5 text-amber-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <h4 className="font-medium">Hypertension</h4>
                          <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">Moderate Risk</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Present in 3 family members across 2 generations
                        </p>
                        <div className="flex items-center text-xs text-primary">
                          <span>You have a 40-60% chance of developing this condition</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-100 rounded-full p-2">
                        <Heart className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <h4 className="font-medium">Vitamin D Deficiency</h4>
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">Moderate Risk</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Present in 4 family members across 3 generations
                        </p>
                        <div className="flex items-center text-xs text-primary">
                          <span>Regular testing and supplementation recommended</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="bg-red-100 rounded-full p-2">
                        <Heart className="w-5 h-5 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <h4 className="font-medium">Early Heart Disease</h4>
                          <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full">High Risk</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Present in 2 family members in previous generations
                        </p>
                        <div className="flex items-center text-xs text-primary">
                          <span>Early preventive screening recommended starting at age 40</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Genetic Testing Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-primary font-semibold">2/6</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Family Members Tested</p>
                            <p className="text-xs text-muted-foreground">33% of your family</p>
                          </div>
                        </div>
                        <Button size="sm">Schedule Test</Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Genetic testing can provide more accurate insights about inherited conditions. Consider testing more family members.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Next Steps</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-xs mt-0.5">1</div>
                          <span>Complete genetic testing for all immediate family members</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-xs mt-0.5">2</div>
                          <span>Schedule a consultation with a genetic counselor</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-xs mt-0.5">3</div>
                          <span>Update your preventive care plan based on family risk factors</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}