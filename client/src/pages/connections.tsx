import React from 'react';
import { Users, User, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Connections() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-6">
        <Users className="w-6 h-6" />
        <h1 className="text-3xl font-bold">Connections</h1>
      </div>

      <p className="text-lg mb-8">
        Connect with family, friends, and health professionals to share your health journey.
      </p>

      <div className="bg-white p-4 rounded-lg shadow mb-8">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="text"
              placeholder="Search for connections..."
              className="w-full pl-10 py-2 border rounded-md"
            />
          </div>
          <Button>Find Connections</Button>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Your Connections</h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { name: "Dr. Jane Smith", type: "Health Professional", specialty: "Nutritionist" },
            { name: "Mike Johnson", type: "Friend", joinedDate: "2 months ago" },
            { name: "Health Club SF", type: "Organization", members: "243 members" },
            { name: "Fitness with Tom", type: "Health Coach", specialty: "Cardio Training" }
          ].map((connection, index) => (
            <div key={connection.name} className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{connection.name}</h3>
                  <p className="text-sm text-muted-foreground">{connection.type}</p>
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
                <div className="flex justify-end mt-4">
                  <Button variant="outline" size="sm">Message</Button>
                </div>
              </div>
            </div>
          ))}

          <div className="bg-white p-6 rounded-lg shadow border-2 border-dashed border-primary/30 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl text-primary font-bold">+</span>
            </div>
            <h2 className="text-lg font-semibold mb-2">Add Connection</h2>
            <p className="text-sm text-muted-foreground">Connect with health professionals and like-minded individuals</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Connections;