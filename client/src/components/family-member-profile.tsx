import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

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

interface FamilyMemberProfileProps {
  member: FamilyMember;
}

const FamilyMemberProfile: React.FC<FamilyMemberProfileProps> = ({ member }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" className="w-full h-full text-left p-0 hover:bg-transparent">
          <div className="flex flex-col w-full">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                {member.profilePicture ? (
                  <img
                    src={member.profilePicture}
                    alt={`${member.name}'s profile`}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-xl text-primary font-bold">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </span>
                )}
              </div>
              <div>
                <h2 className="text-lg font-semibold dark:text-white">{member.name}</h2>
                <p className="text-sm text-muted-foreground dark:text-gray-300">{member.relation}</p>
              </div>
            </div>
            <div className="border-t dark:border-gray-700 pt-4">
              <p className="text-sm mb-2 dark:text-gray-300"><strong>Last Active:</strong> {member.lastActive}</p>
              <p className="text-sm mb-2 dark:text-gray-300">
                <strong>Health Status:</strong>{' '}
                <span className={`${
                  member.healthSummary?.status === 'Good' ? 'text-green-600 dark:text-green-400' : 
                  member.healthSummary?.status === 'Fair' ? 'text-amber-600 dark:text-amber-400' : 
                  member.healthSummary?.status === 'Poor' ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'
                }`}>
                  {member.healthSummary?.status || 'Unknown'}
                </span>
              </p>
              <p className="text-sm dark:text-gray-300"><strong>Upcoming:</strong> Annual checkup in 2 weeks</p>
            </div>
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <span>{member.name}</span>
            <span className="text-base font-normal text-muted-foreground">({member.relation})</span>
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="overview" className="mt-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="genetic-health">Genetic Health</TabsTrigger>
            <TabsTrigger value="health-data">Health Data</TabsTrigger>
            <TabsTrigger value="medications">Medications</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6 dark:border dark:border-gray-700">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex flex-col items-center text-center mb-6 md:mb-0 md:w-1/3">
                  <div className="w-24 h-24 bg-primary/20 dark:bg-primary/30 rounded-full flex items-center justify-center mb-4">
                    {member.profilePicture ? (
                      <img
                        src={member.profilePicture}
                        alt={`${member.name}'s profile`}
                        className="w-24 h-24 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl text-primary dark:text-primary-400 font-bold">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-medium dark:text-white">{member.name}</h2>
                  <p className="text-gray-500 dark:text-gray-400">{member.relation}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Last active: {member.lastActive}</p>
                  <Button className="mt-4 w-full" variant="outline">Send Message</Button>
                </div>
                
                <div className="md:w-2/3">
                  <h3 className="text-xl font-medium mb-4 dark:text-white">Health Summary</h3>
                  {member.healthSummary?.insights ? (
                    <ul className="space-y-2">
                      {member.healthSummary.insights.map((insight, idx) => (
                        <li key={idx} className="flex items-start space-x-2">
                          <i className={`mt-1 ${
                            insight.type === 'alert' ? 'ri-alert-line text-red-500 dark:text-red-400' : 
                            insight.type === 'info' ? 'ri-information-line text-blue-500 dark:text-blue-400' : 
                            'ri-checkbox-circle-line text-green-500 dark:text-green-400'
                          }`}></i>
                          <span className="dark:text-gray-300">{insight.content}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">
                      No health insights available. Connect their health data to see more information.
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Health Stats Overview */}
            {member.healthStats && member.healthStats.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {member.healthStats.map((stat, index) => (
                  <div 
                    key={index} 
                    className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 flex items-center space-x-4 transition-transform hover:scale-105 duration-200 dark:border dark:border-gray-700`}
                  >
                    <div className={`bg-${stat.colorScheme}/10 dark:bg-${stat.colorScheme}/20 rounded-full p-4`}>
                      <i className="ri-heart-pulse-line text-2xl" style={{color: `var(--${stat.colorScheme})`}}></i>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium dark:text-white">
                        {stat.statType.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                      </h3>
                      <p className="text-2xl font-bold" style={{color: `var(--${stat.colorScheme})`}}>
                        {stat.value}
                        {stat.unit && <span className="text-sm text-gray-500 dark:text-gray-400"> {stat.unit}</span>}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Health Data Not Found</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Connect their health data to see their stats here.</p>
                  <div className="mt-4">
                    <Button>Connect Health Data</Button>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Upcoming Appointments */}
            {member.upcomingAppointments && member.upcomingAppointments.length > 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 dark:border dark:border-gray-700">
                <h3 className="text-xl font-medium mb-4 dark:text-white">Upcoming Appointments</h3>
                <div className="space-y-4">
                  {member.upcomingAppointments.map((appointment, idx) => (
                    <div key={idx} className="p-4 border dark:border-gray-700 rounded-md dark:bg-gray-800">
                      <div className="flex justify-between mb-2">
                        <h4 className="font-semibold dark:text-white">{appointment.type}</h4>
                        <span className="text-sm bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-400 px-2 py-1 rounded">{appointment.date}</span>
                      </div>
                      <p className="text-sm text-muted-foreground dark:text-gray-300 mb-3">{appointment.time} with Dr. {appointment.provider}</p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">Reschedule</Button>
                        <Button size="sm" variant="outline">Cancel</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <Card className="dark:border-gray-700 dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="dark:text-white">No Upcoming Appointments</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300">No appointments scheduled at this time.</p>
                  <div className="mt-4">
                    <Button>Schedule Appointment</Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          {/* Genetic Health Tab */}
          <TabsContent value="genetic-health" className="mt-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 dark:border dark:border-gray-700">
              <h3 className="text-xl font-medium mb-6 dark:text-white">Genetic Health Profile</h3>
              
              {member.relation === "Parent" && (
                <div className="mb-8">
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <i className="ri-information-line text-blue-500 text-xl"></i>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-lg font-medium text-blue-700">Parent Health Information</h3>
                        <p className="text-blue-700 mt-2">
                          Health conditions in parents may impact your own genetic risk factors. Monitoring these conditions can help with early detection and preventive care.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <h4 className="font-medium text-lg mb-4 dark:text-white">Hereditary Conditions You May Have Passed Down</h4>
                  <div className="space-y-4">
                    <div className="border dark:border-gray-700 rounded-md p-4 dark:bg-gray-800/50">
                      <div className="flex items-start">
                        <div className="bg-amber-100 dark:bg-amber-900/30 rounded-full p-2 mr-3">
                          <i className="ri-heart-pulse-line text-amber-600 dark:text-amber-400"></i>
                        </div>
                        <div>
                          <h5 className="font-medium dark:text-white">Hypertension</h5>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                            Your history of hypertension has a genetic component that may have been passed to your children. Regular blood pressure monitoring is recommended for the whole family.
                          </p>
                          <div className="mt-3 flex items-center text-sm text-amber-700 dark:text-amber-400">
                            <i className="ri-user-heart-line mr-2"></i>
                            <span>Your children have a 40-60% chance of developing this condition</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border dark:border-gray-700 rounded-md p-4 dark:bg-gray-800/50">
                      <div className="flex items-start">
                        <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-2 mr-3">
                          <i className="ri-psychotherapy-line text-blue-600"></i>
                        </div>
                        <div>
                          <h5 className="font-medium">Cholesterol Management</h5>
                          <p className="text-sm text-gray-600 mt-1">
                            Your family history of elevated cholesterol levels may affect your children. Regular screening starting at age 20 is recommended to monitor lipid profiles.
                          </p>
                          <div className="mt-3 flex items-center text-sm text-blue-700">
                            <i className="ri-user-heart-line mr-2"></i>
                            <span>Your children should begin testing by age 20</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {member.relation === "Spouse" && (
                <div className="mb-8">
                  <div className="bg-purple-50 border-l-4 border-purple-500 p-4 mb-6">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <i className="ri-information-line text-purple-500 text-xl"></i>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-lg font-medium text-purple-700">Spouse Health Information</h3>
                        <p className="text-purple-700 mt-2">
                          Combined genetic factors from both parents affect your children's health risks. Understanding these shared risks can help with proactive healthcare planning.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <h4 className="font-medium text-lg mb-4 dark:text-white">Shared Genetic Influences on Children</h4>
                  <div className="space-y-4">
                    <div className="border dark:border-gray-700 rounded-md p-4 dark:bg-gray-800/50">
                      <div className="flex items-start">
                        <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-2 mr-3">
                          <i className="ri-mental-health-line text-green-600"></i>
                        </div>
                        <div>
                          <h5 className="font-medium">Vitamin D Metabolism</h5>
                          <p className="text-sm text-gray-600 mt-1">
                            Both you and your spouse show genetic markers for vitamin D deficiency, which has been passed to your children. Supplementation and monitoring may be beneficial.
                          </p>
                          <div className="mt-3 flex items-center text-sm text-green-700">
                            <i className="ri-user-heart-line mr-2"></i>
                            <span>Regular vitamin D level testing recommended for all children</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border dark:border-gray-700 rounded-md p-4 dark:bg-gray-800/50">
                      <div className="flex items-start">
                        <div className="bg-pink-100 dark:bg-pink-900/30 rounded-full p-2 mr-3">
                          <i className="ri-hand-heart-line text-pink-600"></i>
                        </div>
                        <div>
                          <h5 className="font-medium">Allergy Predisposition</h5>
                          <p className="text-sm text-gray-600 mt-1">
                            Combined family history shows elevated risk for environmental allergies. Early exposure protocols and monitoring may help reduce severity in children.
                          </p>
                          <div className="mt-3 flex items-center text-sm text-pink-700">
                            <i className="ri-user-heart-line mr-2"></i>
                            <span>Your children have a 65% higher risk of developing allergies</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {member.relation === "Child" && (
                <div className="mb-8">
                  <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <i className="ri-information-line text-green-500 text-xl"></i>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-lg font-medium text-green-700">Child Genetic Profile</h3>
                        <p className="text-green-700 mt-2">
                          Understanding inherited health risks allows for personalized preventive care and early interventions. Regular screening for these conditions is recommended.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <h4 className="font-medium text-lg mb-4">Inherited Risk Factors to Monitor</h4>
                  <div className="space-y-4">
                    <div className="border rounded-md p-4">
                      <div className="flex items-start">
                        <div className="bg-amber-100 rounded-full p-2 mr-3">
                          <i className="ri-heart-pulse-line text-amber-600"></i>
                        </div>
                        <div>
                          <h5 className="font-medium">Cardiovascular Health</h5>
                          <p className="text-sm text-gray-600 mt-1">
                            Inherited risk from paternal grandfather's history of early heart disease. Proactive monitoring of cholesterol and blood pressure beginning in early adulthood is recommended.
                          </p>
                          <div className="mt-3 flex items-center text-sm text-amber-700">
                            <i className="ri-user-heart-line mr-2"></i>
                            <span>Begin regular screening at age 25</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {member.name === "Emma Doe" && (
                      <div className="border rounded-md p-4">
                        <div className="flex items-start">
                          <div className="bg-blue-100 rounded-full p-2 mr-3">
                            <i className="ri-lungs-line text-blue-600"></i>
                          </div>
                          <div>
                            <h5 className="font-medium">Asthma & Respiratory Health</h5>
                            <p className="text-sm text-gray-600 mt-1">
                              Maternal family history of asthma has manifested in your respiratory health. Continue monitoring lung function and maintain current treatment plan.
                            </p>
                            <div className="mt-3 flex items-center text-sm text-blue-700">
                              <i className="ri-user-heart-line mr-2"></i>
                              <span>Annual pulmonary function tests recommended</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {member.name === "Tommy Doe" && (
                      <div className="border rounded-md p-4">
                        <div className="flex items-start">
                          <div className="bg-blue-100 rounded-full p-2 mr-3">
                            <i className="ri-microscope-line text-blue-600"></i>
                          </div>
                          <div>
                            <h5 className="font-medium">Allergy Sensitivity</h5>
                            <p className="text-sm text-gray-600 mt-1">
                              Inherited from both parents, showing moderate environmental allergies with seasonal patterns. Monitor for potential development of asthma as a complication.
                            </p>
                            <div className="mt-3 flex items-center text-sm text-blue-700">
                              <i className="ri-user-heart-line mr-2"></i>
                              <span>Allergy panel testing recommended annually</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="border rounded-md p-4">
                      <div className="flex items-start">
                        <div className="bg-purple-100 rounded-full p-2 mr-3">
                          <i className="ri-capsule-line text-purple-600"></i>
                        </div>
                        <div>
                          <h5 className="font-medium">Vitamin D Metabolism</h5>
                          <p className="text-sm text-gray-600 mt-1">
                            Family history on both sides shows tendency toward vitamin D deficiency. Regular supplementation and blood level monitoring recommended.
                          </p>
                          <div className="mt-3 flex items-center text-sm text-purple-700">
                            <i className="ri-user-heart-line mr-2"></i>
                            <span>Test vitamin D levels every 6 months</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div>
                <h4 className="font-medium text-lg mb-4">Genetic Testing Status</h4>
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="bg-primary/10 rounded-full p-2 mr-3">
                        <i className="ri-dna-line text-primary"></i>
                      </div>
                      <div>
                        <h5 className="font-medium">Comprehensive Genetic Panel</h5>
                        <p className="text-sm text-gray-600">Last updated: January 15, 2025</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">View Report</Button>
                  </div>
                  
                  <div className="border-t pt-4 mt-2">
                    <h6 className="font-medium mb-3">Key Findings:</h6>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start">
                        <i className="ri-checkbox-circle-line text-primary mt-0.5 mr-2"></i>
                        <span>No high-risk variants detected for major inherited disorders</span>
                      </li>
                      <li className="flex items-start">
                        <i className="ri-information-line text-amber-500 mt-0.5 mr-2"></i>
                        <span>Moderate risk factors for cardiovascular conditions</span>
                      </li>
                      <li className="flex items-start">
                        <i className="ri-information-line text-amber-500 mt-0.5 mr-2"></i>
                        <span>Genetic markers for enhanced inflammatory response</span>
                      </li>
                      {member.relation === "Child" && (
                        <li className="flex items-start">
                          <i className="ri-information-line text-amber-500 mt-0.5 mr-2"></i>
                          <span>Carries one copy of MTHFR variant affecting B vitamin metabolism</span>
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
                
                <div className="flex justify-center mt-6">
                  <Button variant="outline" className="mr-3">
                    <i className="ri-file-list-3-line mr-2"></i>
                    Update Genetic History
                  </Button>
                  <Button>
                    <i className="ri-calendar-check-line mr-2"></i>
                    Schedule Genetic Counseling
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Health Data Tab */}
          <TabsContent value="health-data" className="mt-4">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-medium mb-6">Health Metrics</h3>
              
              {member.healthStats && member.healthStats.length > 0 ? (
                <div className="space-y-8">
                  {member.healthStats.map((stat, idx) => (
                    <div key={idx}>
                      <h4 className="text-lg font-medium mb-2">
                        {stat.statType.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                      </h4>
                      <div className="flex items-center mb-2">
                        <span className="text-3xl font-bold" style={{color: `var(--${stat.colorScheme})`}}>
                          {stat.value}
                        </span>
                        {stat.unit && <span className="text-gray-500 ml-1">{stat.unit}</span>}
                      </div>
                      
                      {/* Mock trend visualization */}
                      <div className="h-24 bg-gray-100 rounded-md flex items-center justify-center mb-2">
                        <p className="text-sm text-gray-500">Historical trend data would appear here</p>
                      </div>
                      
                      <Separator className="my-6" />
                    </div>
                  ))}
                  
                  <div className="flex justify-center">
                    <Button>
                      <i className="ri-download-line mr-2"></i>
                      Export Health Data
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="mb-4">
                    <i className="ri-health-book-line text-5xl text-gray-300"></i>
                  </div>
                  <h4 className="text-lg font-medium mb-2">No Health Data Available</h4>
                  <p className="text-gray-500 mb-6">
                    Connect their health devices and apps to see detailed health metrics.
                  </p>
                  <Button>Connect Health Data</Button>
                </div>
              )}
            </div>
          </TabsContent>
          
          {/* Medications Tab */}
          <TabsContent value="medications" className="mt-4">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-medium">Medications</h3>
                <Button size="sm" variant="outline">
                  <i className="ri-add-line mr-1"></i>
                  Add Medication
                </Button>
              </div>
              
              {member.medications && member.medications.length > 0 ? (
                <div className="space-y-4">
                  {member.medications.map((med, idx) => (
                    <div key={idx} className="p-4 border rounded-md">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold">{med.name}</h4>
                          <p className="text-sm text-gray-500">{med.dosage}</p>
                        </div>
                        <Button size="sm">
                          <i className="ri-check-line mr-1"></i>
                          Mark as Taken
                        </Button>
                      </div>
                      
                      <Separator className="my-2" />
                      
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-gray-500">Next Dose:</p>
                          <p className="font-medium">
                            {med.nextDose}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Last Taken:</p>
                          <p className="font-medium">
                            {med.lastTaken || "Never"}
                          </p>
                        </div>
                      </div>
                      
                      {med.schedule && (
                        <div className="mt-2 text-sm">
                          <p className="text-gray-500">Schedule:</p>
                          <p className="italic text-gray-600">{med.schedule}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                  <i className="ri-medicine-bottle-line text-4xl text-gray-300 mb-2"></i>
                  <p className="text-gray-500">No medications scheduled.</p>
                  <p className="text-sm text-gray-400 mt-1">Click the button above to add medications.</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          {/* Appointments Tab */}
          <TabsContent value="appointments" className="mt-4">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-medium">Appointments</h3>
                <Button size="sm">
                  <i className="ri-calendar-line mr-1"></i>
                  Schedule New
                </Button>
              </div>
              
              {member.upcomingAppointments && member.upcomingAppointments.length > 0 ? (
                <div className="space-y-4">
                  {member.upcomingAppointments.map((appointment, idx) => (
                    <div key={idx} className="p-4 border rounded-md">
                      <div className="flex justify-between mb-2">
                        <h4 className="font-semibold">{appointment.type}</h4>
                        <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded">{appointment.date}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{appointment.time} with Dr. {appointment.provider}</p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">Reschedule</Button>
                        <Button size="sm" variant="outline">Cancel</Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                  <i className="ri-calendar-line text-4xl text-gray-300 mb-2"></i>
                  <p className="text-gray-500">No appointments scheduled.</p>
                  <Button size="sm" className="mt-4">Schedule First Appointment</Button>
                </div>
              )}
              
              <Separator className="my-6" />
              
              <div>
                <h4 className="font-medium mb-4">Past Appointments</h4>
                <div className="text-sm text-gray-500 italic">
                  No past appointments found.
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default FamilyMemberProfile;