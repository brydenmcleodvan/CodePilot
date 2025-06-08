import { 
  MessageSquare, Search, Tag, Users, Filter, Plus, 
  ChevronUp, ChevronDown, MessageCircle, Share2, Award, 
  BarChart4, Clock, Flame, TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

export default function ForumPage() {
  const [activeTab, setActiveTab] = useState("hot");

  const forumTopics = [/* ... existing posts array ... */];
  const trendingCommunities = [/* ... existing communities array ... */];

  const formatCount = (count) => count < 1000 ? count.toString() : (count / 1000).toFixed(1) + 'k';

  return (
    <div className="container mx-auto px-4 py-6 max-w-[1200px]">
      <div className="flex items-center gap-3 mb-4 bg-white dark:bg-gray-800 p-3 rounded-md shadow-sm">
        <MessageSquare className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-xl font-bold dark:text-white">HealthMap Forum</h1>
          <p className="text-sm text-muted-foreground">forum.healthmap.com</p>
        </div>
        <Button variant="outline" size="sm" className="ml-auto">Join</Button>
      </div>

      <div className="flex flex-col md:flex-row gap-5">
        <div className="w-full md:w-2/3">
          <div className="bg-white dark:bg-gray-800 rounded-md shadow-sm p-3 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input 
                type="text" 
                placeholder="Search HealthMap Forum" 
                className="pl-10 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-gray-200"
              />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-md shadow-sm mb-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="p-1">
                <TabsList className="grid grid-cols-5 h-9 dark:bg-gray-700">
                  <TabsTrigger value="hot"><Flame className="h-3.5 w-3.5" />Hot</TabsTrigger>
                  <TabsTrigger value="new"><Clock className="h-3.5 w-3.5" />New</TabsTrigger>
                  <TabsTrigger value="top"><TrendingUp className="h-3.5 w-3.5" />Top</TabsTrigger>
                  <TabsTrigger value="rising"><BarChart4 className="h-3.5 w-3.5" />Rising</TabsTrigger>
                  <TabsTrigger value="create"><Plus className="h-3.5 w-3.5" />Create Post</TabsTrigger>
                </TabsList>
              </div>
            </Tabs>
          </div>

          <div className="space-y-3">
            {/* Render posts here */}
          </div>

          <div className="flex justify-center mt-5">
            <Button variant="outline" className="w-full max-w-[300px]">Load More</Button>
          </div>
        </div>

        <div className="w-full md:w-1/3 space-y-4">
          {/* Sidebar elements (about, rules, trending, mods) */}
        </div>
      </div>
    </div>
  );
}
