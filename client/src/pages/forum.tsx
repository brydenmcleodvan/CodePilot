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
<div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
  {/* Forum Header (from main) */}
  <div className="flex items-center gap-3 mb-4 bg-white dark:bg-gray-800 p-3 rounded-md shadow-sm">
    <MessageSquare className="w-8 h-8 text-primary" />
    <div>
      <h1 className="text-xl font-bold dark:text-white">HealthMap Forum</h1>
      <p className="text-sm text-muted-foreground">forum.healthmap.com</p>
    </div>
  </div>

  <div className="flex flex-col md:flex-row gap-8">
    {/* Forum Sidebar (from backup-fix-metrics) */}
    <div className="md:w-1/3 lg:w-1/4">
      <div className="bg-white rounded-xl shadow-md p-6 mb-6 sticky top-24">
        <h2 className="text-xl font-medium mb-4">Health Communities</h2>
        <div className="mb-4">
          <div className="relative">
            <Input 
              type="text" 
              placeholder="Search communities" 
              className="pl-10 pr-4 py-2"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <h3 className="font-medium text-gray-700 mb-2">Popular Communities</h3>
          <nav className="flex flex-col space-y-1">
            <Link
              href="/forum"
              className={`flex items-center justify-between px-4 py-2 rounded-lg ${
                !subreddit ? "bg-primary/10 text-primary font-medium" : "text-gray-700 hover:bg-gray-100 transition-colors duration-200"
              }`}
            >
              <div className="flex items-center space-x-2">
                <i className="ri-global-line text-primary"></i>
                <span>All Communities</span>
              </div>
              <span className="text-xs bg-gray-200 rounded-full px-2 py-1">100k+</span>
            </Link>

            {subreddits.map(sub => (
              <Link
                key={sub.id}
                href={`/forum/${sub.id}`}
                className={`flex items-center justify-between px-4 py-2 rounded-lg ${
                  subreddit === sub.id ? "bg-primary/10 text-primary font-medium" : "text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <i className={`${sub.icon} ${subreddit === sub.id ? "" : "text-primary"}`}></i>
                  <span>{sub.name}</span>
                </div>
                <span className={`text-xs ${subreddit === sub.id ? "bg-primary/20" : "bg-gray-200"} rounded-full px-2 py-1`}>
                  {sub.members}
                </span>
              </Link>
            ))}
          </nav>
        </div>

        {user && (
          <div className="border-t border-gray-200 pt-4 mt-4">
            <h3 className="font-medium text-gray-700 mb-2">My Communities</h3>
            <nav className="flex flex-col space-y-1">
              <a href="#zinc-deficiency" className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200">
                <i className="ri-capsule-line text-blue-500"></i>
                <span>Zinc Deficiency</span>
              </a>
              <a href="#family-health" className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200">
                <i className="ri-group-line text-primary"></i>
                <span>Family Health</span>
              </a>
            </nav>
          </div>
        )}

        <div className="mt-6">
          <Dialog open={isNewPostOpen} onOpenChange={setIsNewPostOpen}>
            <DialogTrigger asChild>
              <Button className="w-full bg-primary hover:bg-secondary flex items-center justify-center space-x-2">
                <i className="ri-add-line"></i>
                <span>Create Post</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create New Post</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmitPost} className="space-y-4">
                <div>
                  <label htmlFor="post-title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <Input 
                    id="post-title" 
                    value={newPostTitle}
                    onChange={(e) => setNewPostTitle(e.target.value)}
                    placeholder="Enter post title" 
                    required 
                  />
                </div>
                <div>
                  <label htmlFor="post-content" className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                  <Textarea 
                    id="post-content" 
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    placeholder="Write your post content here..." 
                    rows={5} 
                    required 
                  />
                </div>
                <div>
                  <label htmlFor="post-tags" className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
                  <Input 
                    id="post-tags" 
                    value={newPostTags}
                    onChange={(e) => setNewPostTags(e.target.value)}
                    placeholder="e.g. Nutrition, Zinc, Questions" 
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" type="button" onClick={() => setIsNewPostOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    Post
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>

    {/* Add main forum content area next to sidebar */}
    <div className="flex-1">
      {/* Placeholder or main discussion feed goes here */}
    </div>
  </div>
</div>

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
