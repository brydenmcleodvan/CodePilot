import { VotingBoard } from "@/components/feature-voting/VotingBoard";
import { MetaTags } from "@/components/seo/MetaTags";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function FeatureVotingPage() {
  const [_, setLocation] = useLocation();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <MetaTags
        title="Feature Voting Board | Healthmap"
        description="Vote on features you'd like to see in Healthmap. Share your ideas and help shape the future of the platform."
        ogImage="/og-images/feature-voting.jpg"
      />
      
      <div className="mb-6">
        <button 
          className="flex items-center text-sm text-gray-600 hover:text-gray-900"
          onClick={() => setLocation('/dashboard')}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </button>
      </div>
      
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-3">Feature Voting Board</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Help shape the future of Healthmap by voting on features you'd like to see implemented. 
            Share your ideas and join the conversation!
          </p>
        </div>
        
        <VotingBoard />
        
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-4">How the Voting Process Works</h2>
          <div className="grid md:grid-cols-3 gap-10 max-w-4xl mx-auto text-left">
            <div>
              <div className="bg-blue-100 text-blue-800 rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mb-4">1</div>
              <h3 className="text-xl font-semibold mb-2">Suggest a Feature</h3>
              <p className="text-gray-600">
                Click "Suggest Feature" to submit your idea. Provide a clear title and detailed description of what you'd like to see.
              </p>
            </div>
            
            <div>
              <div className="bg-blue-100 text-blue-800 rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mb-4">2</div>
              <h3 className="text-xl font-semibold mb-2">Vote & Comment</h3>
              <p className="text-gray-600">
                Browse existing suggestions and vote for the ones you like. Add comments to help refine ideas.
              </p>
            </div>
            
            <div>
              <div className="bg-blue-100 text-blue-800 rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mb-4">3</div>
              <h3 className="text-xl font-semibold mb-2">Development</h3>
              <p className="text-gray-600">
                Our team reviews top-voted features and updates their status as they move through development.
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-16 bg-gray-50 p-8 rounded-lg">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Stay Updated</h2>
              <p className="text-gray-600 mb-4 md:mb-0">
                Follow our progress and see what features have been implemented.
              </p>
            </div>
            <Button 
              onClick={() => setLocation('/changelog')}
              className="px-6"
            >
              View Changelog
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}