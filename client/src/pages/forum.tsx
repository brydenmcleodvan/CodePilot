import React from 'react';
import { MessageSquare, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Forum() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="w-6 h-6" />
        <h1 className="text-3xl font-bold">Public Forum</h1>
      </div>

      <p className="text-lg mb-8">
        Connect with the community to discuss health topics, share experiences, and get advice from others on similar health journeys.
      </p>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-3/4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recent Discussions</h2>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" /> New Topic
            </Button>
          </div>

          <div className="space-y-4">
            {[
              {
                title: "Tips for managing stress during busy work periods",
                author: "StressLess42",
                category: "Mental Health",
                replies: 24,
                lastActive: "2 hours ago"
              },
              {
                title: "Has anyone tried intermittent fasting?",
                author: "FitnessJourney",
                category: "Nutrition",
                replies: 18,
                lastActive: "5 hours ago"
              },
              {
                title: "Recommendations for sleep tracking apps?",
                author: "InsomniaNoMore",
                category: "Sleep",
                replies: 15,
                lastActive: "Yesterday"
              },
              {
                title: "Family-friendly exercise routines to do together",
                author: "FitFamily5",
                category: "Fitness",
                replies: 9,
                lastActive: "2 days ago"
              },
              {
                title: "Dealing with seasonal allergies - what works for you?",
                author: "SpringSneezer",
                category: "Allergies",
                replies: 32,
                lastActive: "3 days ago"
              }
            ].map((topic, index) => (
              <div key={index} className="p-6 bg-white rounded-lg shadow">
                <div className="flex justify-between mb-3">
                  <h3 className="font-semibold text-lg">{topic.title}</h3>
                  <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded">{topic.category}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Posted by {topic.author}</span>
                  <span>{topic.replies} replies</span>
                </div>
                <div className="mt-4 pt-4 border-t flex justify-between items-center">
                  <span className="text-sm">Last activity: {topic.lastActive}</span>
                  <Button variant="outline" size="sm">View Discussion</Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-6">
            <Button variant="outline">Load More</Button>
          </div>
        </div>

        <div className="w-full md:w-1/4">
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <h3 className="font-semibold mb-3">Popular Topics</h3>
            <ul className="space-y-2">
              <li className="text-sm"># Mental Health</li>
              <li className="text-sm"># Nutrition</li>
              <li className="text-sm"># Fitness</li>
              <li className="text-sm"># Sleep</li>
              <li className="text-sm"># Chronic Conditions</li>
            </ul>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold mb-3">Community Guidelines</h3>
            <ul className="text-sm space-y-2">
              <li>Be respectful and supportive</li>
              <li>No medical advice - share experiences only</li>
              <li>Respect privacy and confidentiality</li>
              <li>Report inappropriate content</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Forum;