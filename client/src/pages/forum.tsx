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
  
  // Define forum topics with more realistic health-related content
  const forumTopics = [
    {
      id: 1,
      title: "Has anyone tried the Mediterranean diet for heart health?",
      description: "My doctor recommended the Mediterranean diet to help with my cholesterol levels. I'm three weeks in and wanted to share some meal ideas and hear others' experiences.",
      author: "HeartHealthy50",
      subreddit: "h/Nutrition",
      upvotes: 247,
      comments: 24,
      timePosted: "5 hours ago",
      awards: 1,
      image: null,
      isUpvoted: true,
      isDownvoted: false
    },
    {
      id: 2,
      title: "Tips for managing chronic back pain without medication?",
      description: "I've been dealing with lower back pain for years and trying to reduce my reliance on pain meds. Looking for alternative approaches that have worked for others.",
      author: "BackPainWarrior",
      subreddit: "h/ChronicPain",
      upvotes: 421,
      comments: 38,
      timePosted: "12 hours ago",
      awards: 2,
      image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1000&auto=format&fit=crop",
      isUpvoted: false,
      isDownvoted: false
    },
    {
      id: 3,
      title: "Mental health strategies during major life transitions",
      description: "Going through a career change and feeling anxious most days. What mental health practices have helped you stay grounded during big life changes?",
      author: "NewBeginnings",
      subreddit: "h/MentalHealth",
      upvotes: 1024,
      comments: 96,
      timePosted: "1 day ago",
      awards: 3,
      image: null,
      isUpvoted: false,
      isDownvoted: false
    },
    {
      id: 4,
      title: "Best fitness trackers for seniors - recommendations?",
      description: "Looking for a simple fitness tracker for my 70-year-old mother who wants to monitor her daily steps and heart rate. Ease of use is the priority.",
      author: "ActiveSenior",
      subreddit: "h/FitnessTech",
      upvotes: 67,
      comments: 19,
      timePosted: "2 days ago",
      awards: 0,
      image: null,
      isUpvoted: false,
      isDownvoted: false
    },
    {
      id: 5,
      title: "Sleep apnea diagnosis journey - what to expect?",
      description: "Recently referred for a sleep study based on my symptoms. Would appreciate hearing from others about their diagnosis process and treatment experiences.",
      author: "SleepSeeker",
      subreddit: "h/SleepApnea",
      upvotes: 312,
      comments: 31,
      timePosted: "3 days ago",
      awards: 1,
      image: null,
      isUpvoted: false,
      isDownvoted: false
    },
    {
      id: 6,
      title: "Managing type 2 diabetes through lifestyle changes - My 6-month progress",
      description: "Recently diagnosed with type 2 diabetes and determined to manage it through diet and exercise. Here's what's worked for me over the past 6 months...",
      author: "DiabetesNewbie",
      subreddit: "h/Diabetes",
      upvotes: 1482,
      comments: 145,
      timePosted: "4 days ago",
      awards: 5,
      image: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?q=80&w=1000&auto=format&fit=crop",
      isUpvoted: false,
      isDownvoted: false
    }
  ];

  // Healthmap trending communities
  const trendingCommunities = [
    { name: "h/Nutrition", members: "2.4m", online: "5.2k", trend: "+15%" },
    { name: "h/MentalHealth", members: "1.8m", online: "3.9k", trend: "+22%" },
    { name: "h/Fitness", members: "3.6m", online: "8.7k", trend: "+8%" },
    { name: "h/ChronicPain", members: "567k", online: "1.2k", trend: "+19%" },
    { name: "h/SleepHealth", members: "782k", online: "2.1k", trend: "+12%" }
  ];

  // Format the upvote count in Reddit style (1.2k instead of 1200)
  const formatCount = (count: number): string => {
    if (count < 1000) return count.toString();
    return (count / 1000).toFixed(1) + 'k';
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-[1200px]">
      {/* Reddit-style header with community name */}
      <div className="flex items-center gap-3 mb-4 bg-white dark:bg-gray-800 p-3 rounded-md shadow-sm">
        <MessageSquare className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-xl font-bold dark:text-white">HealthMap Forum</h1>
          <p className="text-sm text-muted-foreground">forum.healthmap.com</p>
        </div>
        <Button variant="outline" size="sm" className="ml-auto">Join</Button>
      </div>

      {/* Main Reddit-style grid layout */}
      <div className="flex flex-col md:flex-row gap-5">
        {/* Main content area - 2/3 width */}
        <div className="w-full md:w-2/3">
          {/* Search bar */}
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

          {/* Reddit-style sort tabs */}
          <div className="bg-white dark:bg-gray-800 rounded-md shadow-sm mb-4">
            <Tabs defaultValue="hot" className="w-full" onValueChange={setActiveTab}>
              <div className="p-1">
                <TabsList className="grid grid-cols-5 h-9 dark:bg-gray-700">
                  <TabsTrigger value="hot" className="flex items-center gap-1.5 text-xs">
                    <Flame className="h-3.5 w-3.5" />
                    <span>Hot</span>
                  </TabsTrigger>
                  <TabsTrigger value="new" className="flex items-center gap-1.5 text-xs">
                    <Clock className="h-3.5 w-3.5" />
                    <span>New</span>
                  </TabsTrigger>
                  <TabsTrigger value="top" className="flex items-center gap-1.5 text-xs">
                    <TrendingUp className="h-3.5 w-3.5" />
                    <span>Top</span>
                  </TabsTrigger>
                  <TabsTrigger value="rising" className="flex items-center gap-1.5 text-xs">
                    <BarChart4 className="h-3.5 w-3.5" />
                    <span>Rising</span>
                  </TabsTrigger>
                  <TabsTrigger value="create" className="flex items-center gap-1.5 text-xs">
                    <Plus className="h-3.5 w-3.5" />
                    <span>Create Post</span>
                  </TabsTrigger>
                </TabsList>
              </div>
            </Tabs>
          </div>

          {/* Reddit-style posts */}
          <div className="space-y-3">
            {forumTopics.map((post) => (
              <div key={post.id} className="bg-white dark:bg-gray-800 rounded-md shadow-sm hover:border hover:border-gray-300 dark:hover:border-gray-600 transition-all">
                <div className="flex">
                  {/* Voting sidebar */}
                  <div className="bg-gray-50 dark:bg-gray-700 p-2 flex flex-col items-center rounded-l-md min-w-[40px]">
                    <button 
                      className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${post.isUpvoted ? "text-primary" : ""}`}
                    >
                      <ChevronUp className="h-5 w-5" />
                    </button>
                    <span className={`text-xs font-semibold my-1 ${
                      post.isUpvoted ? "text-primary" : 
                      post.isDownvoted ? "text-red-500" : "text-gray-600 dark:text-gray-300"
                    }`}>
                      {formatCount(post.upvotes)}
                    </span>
                    <button 
                      className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${post.isDownvoted ? "text-red-500" : ""}`}
                    >
                      <ChevronDown className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Post content */}
                  <div className="p-3 flex-grow">
                    {/* Post metadata */}
                    <div className="flex items-center text-xs text-muted-foreground mb-2">
                      <span className="font-medium text-primary hover:underline cursor-pointer">
                        {post.subreddit}
                      </span>
                      <span className="mx-1">•</span>
                      <span>Posted by</span>
                      <span className="mx-1 hover:underline cursor-pointer">u/{post.author}</span>
                      <span className="mx-1">•</span>
                      <span>{post.timePosted}</span>
                      {post.awards > 0 && (
                        <>
                          <span className="mx-1">•</span>
                          <div className="flex items-center gap-1">
                            <Award className="h-3.5 w-3.5 text-yellow-500" />
                            <span>{post.awards}</span>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Post title and content */}
                    <h2 className="text-lg font-semibold mb-2 hover:text-primary cursor-pointer dark:text-white">
                      {post.title}
                    </h2>
                    <p className="text-sm text-muted-foreground dark:text-gray-400 mb-3">
                      {post.description.length > 180 
                        ? post.description.substring(0, 180) + '...' 
                        : post.description}
                    </p>

                    {/* Post image if available */}
                    {post.image && (
                      <div className="relative mb-3 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-700">
                        <img 
                          src={post.image} 
                          alt={post.title} 
                          className="max-h-80 object-cover mx-auto"
                        />
                      </div>
                    )}

                    {/* Post actions */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                      <button className="flex items-center gap-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 p-1.5 rounded">
                        <MessageCircle className="h-4 w-4" />
                        <span>{post.comments} Comments</span>
                      </button>
                      <button className="flex items-center gap-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 p-1.5 rounded">
                        <Share2 className="h-4 w-4" />
                        <span>Share</span>
                      </button>
                      <button className="flex items-center gap-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 p-1.5 rounded">
                        <Award className="h-4 w-4" />
                        <span>Award</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Load more button */}
          <div className="flex justify-center mt-5">
            <Button variant="outline" className="w-full max-w-[300px]">
              Load More
            </Button>
          </div>
        </div>

        {/* Sidebar - 1/3 width */}
        <div className="w-full md:w-1/3 space-y-4">
          {/* About Community Box */}
          <div className="bg-white dark:bg-gray-800 rounded-md shadow-sm overflow-hidden">
            <div className="bg-primary p-3">
              <h2 className="text-white font-medium">About Community</h2>
            </div>
            <div className="p-4">
              <p className="text-sm mb-3 dark:text-gray-300">
                A community for discussing health topics, sharing experiences, and getting support from others on similar health journeys.
              </p>
              
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-lg font-bold dark:text-white">8.2m</p>
                  <p className="text-xs text-muted-foreground">Members</p>
                </div>
                <div>
                  <p className="text-lg font-bold dark:text-white">12.4k</p>
                  <p className="text-xs text-muted-foreground">Online</p>
                </div>
                <div>
                  <p className="text-lg font-bold dark:text-white">2015</p>
                  <p className="text-xs text-muted-foreground">Created</p>
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                <Button className="w-full">Create Post</Button>
                <Button variant="outline" className="w-full">Create Community</Button>
              </div>
            </div>
          </div>

          {/* Rules Box */}
          <div className="bg-white dark:bg-gray-800 rounded-md shadow-sm overflow-hidden">
            <div className="p-4">
              <h3 className="font-semibold mb-3 dark:text-white">Community Rules</h3>
              <ul className="space-y-3 text-sm dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="font-semibold min-w-[16px]">1.</span>
                  <span>Be respectful and supportive of others</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold min-w-[16px]">2.</span>
                  <span>No medical advice - share experiences only</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold min-w-[16px]">3.</span>
                  <span>Respect privacy and confidentiality</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold min-w-[16px]">4.</span>
                  <span>No promotion of unapproved treatments</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold min-w-[16px]">5.</span>
                  <span>No misinformation or unverified claims</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Trending Communities */}
          <div className="bg-white dark:bg-gray-800 rounded-md shadow-sm overflow-hidden">
            <div className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-4 w-4 text-primary" />
                <h3 className="font-semibold dark:text-white">Trending Health Communities</h3>
              </div>
              <ul className="space-y-3">
                {trendingCommunities.map((community, idx) => (
                  <li key={idx} className="flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 p-1.5 rounded-md cursor-pointer">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs overflow-hidden">
                        h/
                      </div>
                      <div>
                        <p className="text-sm font-medium dark:text-white">{community.name}</p>
                        <p className="text-xs text-muted-foreground">{community.members} members</p>
                      </div>
                    </div>
                    <div className="text-xs font-medium text-green-600">
                      {community.trend}
                    </div>
                  </li>
                ))}
              </ul>
              <Button variant="link" className="text-xs w-full mt-2">
                View All Health Communities
              </Button>
            </div>
          </div>

          {/* Moderators Box */}
          <div className="bg-white dark:bg-gray-800 rounded-md shadow-sm overflow-hidden">
            <div className="p-4">
              <h3 className="font-semibold mb-2 dark:text-white">Moderators</h3>
              <Button variant="link" className="text-xs p-0 h-auto">
                Message the mods
              </Button>
              <ul className="mt-2 space-y-1">
                <li className="text-xs text-primary hover:underline cursor-pointer">u/HealthMapAdmin</li>
                <li className="text-xs text-primary hover:underline cursor-pointer">u/NutritionMod</li>
                <li className="text-xs text-primary hover:underline cursor-pointer">u/FitnessCoach22</li>
              </ul>
              <Button variant="link" className="text-xs p-0 h-auto mt-2">
                View All Moderators
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}