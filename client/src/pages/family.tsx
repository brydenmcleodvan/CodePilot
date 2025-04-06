import React from 'react';
import { Heart, User, Plus, GitBranch } from "lucide-react";
import { Button } from "@/components/ui/button";
import FamilyMemberProfile from '@/components/family-member-profile';
import { Link } from "wouter";

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
    geneticHealth: {
      inheritedConditions: [
        {
          name: "Vitamin D Deficiency",
          description: "Genetic predisposition to lower vitamin D absorption and metabolism",
          riskLevel: "moderate" as const,
          recommendedAction: "Regular supplementation and quarterly blood level monitoring"
        },
        {
          name: "Allergy Sensitivity",
          description: "Hereditary hypersensitivity to environmental allergens",
          riskLevel: "moderate" as const,
          recommendedAction: "Annual allergy testing and proactive management"
        }
      ],
      geneticTesting: {
        lastUpdated: "January 15, 2025",
        findings: [
          {
            type: "warning" as const,
            description: "Carries genetic markers for vitamin D metabolism inefficiency"
          },
          {
            type: "warning" as const,
            description: "Moderate predisposition to environmental allergies"
          },
          {
            type: "negative" as const,
            description: "No significant genetic risk factors for major health conditions"
          }
        ]
      }
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
    geneticHealth: {
      inheritedConditions: [
        {
          name: "Environmental Allergies",
          description: "Inherited from both parents, particularly pollen and dust sensitivity",
          riskLevel: "moderate" as const,
          recommendedAction: "Annual allergy panel tests and preventive measures during peak seasons"
        },
        {
          name: "Cardiovascular Risk",
          description: "Inherited risk factor from paternal grandfather's history of early heart disease",
          riskLevel: "low" as const,
          recommendedAction: "Begin regular cardiovascular screenings at age 25"
        },
        {
          name: "Vitamin D Metabolism",
          description: "Inherited trait affecting vitamin D absorption efficiency",
          riskLevel: "moderate" as const,
          recommendedAction: "Regular vitamin D level testing and potential supplementation"
        }
      ],
      geneticTesting: {
        lastUpdated: "December 5, 2024",
        findings: [
          {
            type: "warning" as const,
            description: "Carries gene variants associated with increased environmental allergy risk"
          },
          {
            type: "warning" as const,
            description: "One copy of MTHFR variant affecting B vitamin metabolism"
          },
          {
            type: "negative" as const,
            description: "No high-risk genetic variants for major health conditions detected"
          }
        ]
      }
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
    geneticHealth: {
      inheritedConditions: [
        {
          name: "Asthma & Respiratory Sensitivity",
          description: "Inherited from maternal family history with manifestation in childhood",
          riskLevel: "high" as const,
          recommendedAction: "Regular pulmonary function testing and maintenance of treatment plan"
        },
        {
          name: "Cardiovascular Risk",
          description: "Inherited risk factor from paternal grandfather's history of early heart disease",
          riskLevel: "low" as const,
          recommendedAction: "Begin regular cardiovascular screenings at age 25"
        },
        {
          name: "Vitamin D Metabolism",
          description: "Inherited trait affecting vitamin D absorption efficiency",
          riskLevel: "moderate" as const,
          recommendedAction: "Semi-annual vitamin D level testing and supplementation"
        }
      ],
      geneticTesting: {
        lastUpdated: "January 5, 2025",
        findings: [
          {
            type: "warning" as const,
            description: "Genetic markers associated with increased asthma risk"
          },
          {
            type: "warning" as const,
            description: "One copy of MTHFR variant affecting B vitamin metabolism"
          },
          {
            type: "positive" as const,
            description: "Enhanced genetic markers for athletic performance and endurance"
          }
        ]
      }
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
    geneticHealth: {
      inheritedConditions: [
        {
          name: "Hypertension",
          description: "Family history of hypertension that has manifested in adulthood",
          riskLevel: "high" as const,
          recommendedAction: "Regular blood pressure monitoring and medication adherence"
        },
        {
          name: "Elevated Cholesterol",
          description: "Inherited predisposition to higher LDL cholesterol levels",
          riskLevel: "moderate" as const,
          recommendedAction: "Regular lipid panel screening and dietary management"
        },
        {
          name: "Early Heart Disease",
          description: "Family history of early cardiovascular disease in paternal line",
          riskLevel: "moderate" as const,
          recommendedAction: "Preventive cardiology visits and lifestyle modifications"
        }
      ],
      geneticTesting: {
        lastUpdated: "October 10, 2024",
        findings: [
          {
            type: "warning" as const,
            description: "Genetic markers for salt sensitivity affecting blood pressure regulation"
          },
          {
            type: "warning" as const,
            description: "Variants associated with impaired cholesterol metabolism"
          },
          {
            type: "positive" as const,
            description: "Favorable response to physical exercise for cardiovascular health"
          }
        ]
      }
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
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Heart className="w-6 h-6" />
          <h1 className="text-3xl font-bold">Family Health</h1>
        </div>
        
        <Link href="/family-tree">
          <Button variant="outline" className="flex items-center gap-2">
            <GitBranch className="w-4 h-4" />
            View Family Tree
          </Button>
        </Link>
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