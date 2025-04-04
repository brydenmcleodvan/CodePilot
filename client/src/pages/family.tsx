import React from 'react';
import { Heart, User } from "lucide-react";

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
        {[
          { name: "Sarah Doe", relation: "Spouse", lastActive: "Today" },
          { name: "Tommy Doe", relation: "Child", lastActive: "Yesterday" },
          { name: "Emma Doe", relation: "Child", lastActive: "2 days ago" },
          { name: "Robert Doe", relation: "Parent", lastActive: "1 week ago" }
        ].map((member, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">{member.name}</h2>
                <p className="text-sm text-muted-foreground">{member.relation}</p>
              </div>
            </div>
            <div className="border-t pt-4">
              <p className="text-sm mb-2"><strong>Last Active:</strong> {member.lastActive}</p>
              <p className="text-sm mb-2"><strong>Health Status:</strong> <span className="text-green-600">Good</span></p>
              <p className="text-sm"><strong>Upcoming:</strong> Annual checkup in 2 weeks</p>
            </div>
          </div>
        ))}

        <div className="bg-white p-6 rounded-lg shadow border-2 border-dashed border-primary/30 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl text-primary font-bold">+</span>
          </div>
          <h2 className="text-lg font-semibold mb-2">Add Family Member</h2>
          <p className="text-sm text-muted-foreground">Invite a family member to connect and share health information</p>
        </div>
      </div>
    </div>
  );
}

export default Family;