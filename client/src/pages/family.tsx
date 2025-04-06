import React from 'react';
import { Heart, User, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import FamilyMemberProfile from '@/components/family-member-profile';

// Sample data for family members with extended details for profile
const familyMembers = [
  { 
    id: 1,
    name: "Sarah Doe", 
    relation: "Spouse", 
    lastActive: "Today",
    healthSummary: {
      status: "Good",
      insights: [
        { type: "success" as const, content: 'Blood pressure within normal range' },
        { type: "info" as const, content: 'Recent sleep quality has slightly decreased' },
        { type: "success" as const, content: 'Vitamin D levels have improved with supplementation' }
      ]
    },
    healthStats: [
      { statType: "heart_rate", value: "72", unit: "bpm", colorScheme: "primary" },
      { statType: "blood_pressure", value: "120/80", unit: "mmHg", colorScheme: "blue" },
      { statType: "sleep_quality", value: "86", unit: "%", colorScheme: "green" }
    ],
    medications: [
      { 
        name: "Multivitamin", 
        dosage: "1 tablet", 
        schedule: "Daily with breakfast",
        nextDose: "Tomorrow, 8:00 AM",
        lastTaken: "Today, 8:15 AM"
      }
    ],
    upcomingAppointments: [
      {
        type: "Annual Physical",
        date: "May 15, 2025",
        time: "10:00 AM",
        provider: "Jessica Smith"
      }
    ]
  },
  { 
    id: 2,
    name: "Tommy Doe", 
    relation: "Child", 
    lastActive: "Yesterday",
    healthSummary: {
      status: "Good",
      insights: [
        { type: "success" as const, content: 'Growth and development on track' },
        { type: "success" as const, content: 'Vaccination schedule up to date' },
        { type: "info" as const, content: 'Seasonal allergies may require monitoring' }
      ]
    },
    healthStats: [
      { statType: "height", value: "4'2\"", unit: "", colorScheme: "primary" },
      { statType: "weight", value: "65", unit: "lbs", colorScheme: "blue" },
      { statType: "activity", value: "75", unit: "min/day", colorScheme: "green" }
    ],
    upcomingAppointments: [
      {
        type: "Pediatric Checkup",
        date: "June 3, 2025",
        time: "3:30 PM",
        provider: "Robert Johnson"
      }
    ]
  },
  { 
    id: 3,
    name: "Emma Doe", 
    relation: "Child", 
    lastActive: "2 days ago",
    healthSummary: {
      status: "Fair",
      insights: [
        { type: "info" as const, content: 'Recent mild asthma symptoms noted' },
        { type: "alert" as const, content: 'Missed last dental appointment' },
        { type: "success" as const, content: 'Physical activity exceeds recommended levels' }
      ]
    },
    healthStats: [
      { statType: "height", value: "4'5\"", unit: "", colorScheme: "primary" },
      { statType: "weight", value: "70", unit: "lbs", colorScheme: "blue" },
      { statType: "lung_function", value: "92", unit: "%", colorScheme: "amber" }
    ],
    medications: [
      { 
        name: "Asthma Inhaler", 
        dosage: "2 puffs", 
        schedule: "As needed for symptoms",
        nextDose: "As needed",
        lastTaken: "Yesterday, 4:30 PM"
      }
    ],
    upcomingAppointments: [
      {
        type: "Asthma Follow-up",
        date: "May 20, 2025",
        time: "2:00 PM",
        provider: "Lisa Chen"
      },
      {
        type: "Dental Appointment",
        date: "May 25, 2025",
        time: "10:30 AM",
        provider: "Daniel White"
      }
    ]
  },
  { 
    id: 4,
    name: "Robert Doe", 
    relation: "Parent", 
    lastActive: "1 week ago",
    healthSummary: {
      status: "Fair",
      insights: [
        { type: "alert" as const, content: 'Blood pressure slightly elevated' },
        { type: "info" as const, content: 'Cholesterol levels borderline high' },
        { type: "success" as const, content: 'Exercise routine consistent' }
      ]
    },
    healthStats: [
      { statType: "heart_rate", value: "76", unit: "bpm", colorScheme: "primary" },
      { statType: "blood_pressure", value: "138/85", unit: "mmHg", colorScheme: "amber" },
      { statType: "cholesterol", value: "210", unit: "mg/dL", colorScheme: "amber" }
    ],
    medications: [
      { 
        name: "Blood Pressure Medication", 
        dosage: "10mg", 
        schedule: "Daily in the morning",
        nextDose: "Tomorrow, 9:00 AM",
        lastTaken: "Today, 9:15 AM"
      },
      { 
        name: "Vitamin D3", 
        dosage: "2000 IU", 
        schedule: "Daily with breakfast",
        nextDose: "Tomorrow, 8:00 AM",
        lastTaken: "Today, 8:15 AM"
      }
    ],
    upcomingAppointments: [
      {
        type: "Cardiologist",
        date: "May 12, 2025",
        time: "11:30 AM",
        provider: "Michael Brown"
      }
    ]
  }
];

export function Family() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-6">
        <Heart className="w-6 h-6" />
        <h1 className="text-3xl font-bold">Family Health</h1>
      </div>

      <p className="text-lg mb-8">
        Manage and monitor your family's health in one place. Connect with family members to share health updates and keep track of important information.
      </p>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {familyMembers.map((member) => (
          <div key={member.id} className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
            <FamilyMemberProfile member={member} />
          </div>
        ))}

        <div className="bg-white p-6 rounded-lg shadow border-2 border-dashed border-primary/30 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors">
          <Button variant="ghost" className="w-full h-full flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Plus className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-2">Add Family Member</h2>
              <p className="text-sm text-muted-foreground">Invite a family member to connect and share health information</p>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Family;