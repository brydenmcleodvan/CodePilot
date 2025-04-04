import React from 'react';
import { HeadphonesIcon, Calendar, MessageSquare, VideoIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HealthCoach() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-6">
        <HeadphonesIcon className="w-6 h-6" />
        <h1 className="text-3xl font-bold">Health Coach</h1>
      </div>

      <p className="text-lg mb-8">
        Get personalized guidance from certified health professionals to achieve your wellness goals.
      </p>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Your Assigned Coach</h2>
          <div className="flex items-center gap-6 mb-6">
            <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">AC</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Alex Chen</h3>
              <p className="text-sm text-muted-foreground mb-1">Certified Nutrition & Fitness Coach</p>
              <div className="flex items-center">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className="text-yellow-400">★</span>
                  ))}
                </div>
                <span className="text-sm text-muted-foreground ml-2">4.9 (128 reviews)</span>
              </div>
            </div>
          </div>

          <p className="mb-6">
            "I focus on creating sustainable lifestyle changes tailored to your unique needs. Together, we'll build habits that last a lifetime."
          </p>

          <div className="flex gap-3">
            <Button className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Message
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Schedule
            </Button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Upcoming Sessions</h2>

          <div className="space-y-4">
            <div className="p-4 border rounded-md">
              <div className="flex justify-between mb-2">
                <h3 className="font-semibold">Weekly Check-in</h3>
                <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded">Tomorrow</span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">10:00 AM - 10:30 AM</p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex items-center gap-2">
                  <VideoIcon className="w-3 h-3" />
                  Join
                </Button>
                <Button size="sm" variant="outline">Reschedule</Button>
              </div>
            </div>

            <div className="p-4 border rounded-md">
              <div className="flex justify-between mb-2">
                <h3 className="font-semibold">Nutrition Plan Review</h3>
                <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded">Next Week</span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">Tuesday, 2:00 PM - 3:00 PM</p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" disabled>Join</Button>
                <Button size="sm" variant="outline">Reschedule</Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Your Coaching Plan</h2>
        <div className="mb-6">
          <h3 className="font-semibold mb-3">Current Focus Areas:</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-3 border rounded-md">
              <p className="font-medium">Stress Management</p>
              <div className="h-2 bg-gray-200 rounded-full mt-2">
                <div className="h-full bg-primary rounded-full w-4/5" />
              </div>
            </div>
            <div className="p-3 border rounded-md">
              <p className="font-medium">Nutrition Planning</p>
              <div className="h-2 bg-gray-200 rounded-full mt-2">
                <div className="h-full bg-primary rounded-full w-1/2" />
              </div>
            </div>
            <div className="p-3 border rounded-md">
              <p className="font-medium">Exercise Routine</p>
              <div className="h-2 bg-gray-200 rounded-full mt-2">
                <div className="h-full bg-primary rounded-full w-2/3" />
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-3">Recent Notes:</h3>
          <div className="p-4 bg-gray-50 rounded-md">
            <p className="text-sm mb-2">
              <strong>Last session (May 2):</strong> Discussed improving sleep hygiene. Client is making progress with evening routine. Recommended reducing screen time by 30 minutes before bed.
            </p>
            <p className="text-sm">
              <strong>Action items:</strong> Track sleep quality for the next week, practice 5-minute meditation before bed, limit caffeine after 2pm.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HealthCoach;