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
                <h2 className="text-lg font-semibold">{member.name}</h2>
                <p className="text-sm text-muted-foreground">{member.relation}</p>
              </div>
            </div>
            <div className="border-t pt-4">
              <p className="text-sm mb-2"><strong>Last Active:</strong> {member.lastActive}</p>
              <p className="text-sm mb-2">
                <strong>Health Status:</strong>{' '}
                <span className={`${
                  member.healthSummary?.status === 'Good' ? 'text-green-600' : 
                  member.healthSummary?.status === 'Fair' ? 'text-amber-600' : 
                  member.healthSummary?.status === 'Poor' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {member.healthSummary?.status || 'Unknown'}
                </span>
              </p>
              <p className="text-sm"><strong>Upcoming:</strong> Annual checkup in 2 weeks</p>
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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="health-data">Health Data</TabsTrigger>
            <TabsTrigger value="medications">Medications</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-4">
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex flex-col items-center text-center mb-6 md:mb-0 md:w-1/3">
                  <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                    {member.profilePicture ? (
                      <img
                        src={member.profilePicture}
                        alt={`${member.name}'s profile`}
                        className="w-24 h-24 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl text-primary font-bold">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-medium">{member.name}</h2>
                  <p className="text-gray-500">{member.relation}</p>
                  <p className="text-sm text-gray-500 mt-2">Last active: {member.lastActive}</p>
                  <Button className="mt-4 w-full" variant="outline">Send Message</Button>
                </div>
                
                <div className="md:w-2/3">
                  <h3 className="text-xl font-medium mb-4">Health Summary</h3>
                  {member.healthSummary?.insights ? (
                    <ul className="space-y-2">
                      {member.healthSummary.insights.map((insight, idx) => (
                        <li key={idx} className="flex items-start space-x-2">
                          <i className={`mt-1 ${
                            insight.type === 'alert' ? 'ri-alert-line text-red-500' : 
                            insight.type === 'info' ? 'ri-information-line text-blue-500' : 
                            'ri-checkbox-circle-line text-green-500'
                          }`}></i>
                          <span>{insight.content}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500">
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
                    className={`bg-white rounded-xl shadow-sm p-6 flex items-center space-x-4 transition-transform hover:scale-105 duration-200`}
                  >
                    <div className={`bg-${stat.colorScheme}/10 rounded-full p-4`}>
                      <i className="ri-heart-pulse-line text-2xl" style={{color: `var(--${stat.colorScheme})`}}></i>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">
                        {stat.statType.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                      </h3>
                      <p className="text-2xl font-bold" style={{color: `var(--${stat.colorScheme})`}}>
                        {stat.value}
                        {stat.unit && <span className="text-sm text-gray-500"> {stat.unit}</span>}
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
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-xl font-medium mb-4">Upcoming Appointments</h3>
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
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>No Upcoming Appointments</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">No appointments scheduled at this time.</p>
                  <div className="mt-4">
                    <Button>Schedule Appointment</Button>
                  </div>
                </CardContent>
              </Card>
            )}
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