import { MessageSquare, Search, Tag, Users, Filter, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function ForumPage() {
  // Define forum topics with more realistic health-related content
  const forumTopics = [
    {
      id: 1,
      title: "Has anyone tried the Mediterranean diet for heart health?",
      description: "My doctor recommended the Mediterranean diet to help with my cholesterol levels. I'm three weeks in and wanted to share some meal ideas and hear others' experiences.",
      author: "HeartHealthy50",
      category: "Nutrition",
      comments: 24,
      lastActive: "2 hours ago",
      tags: ["diet", "heart-health", "nutrition"]
    },
    {
      id: 2,
      title: "Tips for managing chronic back pain without medication?",
      description: "I've been dealing with lower back pain for years and trying to reduce my reliance on pain meds. Looking for alternative approaches that have worked for others.",
      author: "BackPainWarrior",
      category: "Pain Management",
      comments: 38,
      lastActive: "5 hours ago",
      tags: ["chronic-pain", "back-pain", "natural-remedies"]
    },
    {
      id: 3,
      title: "Mental health strategies during major life transitions",
      description: "Going through a career change and feeling anxious most days. What mental health practices have helped you stay grounded during big life changes?",
      author: "NewBeginnings",
      category: "Mental Health",
      comments: 16,
      lastActive: "Yesterday",
      tags: ["anxiety", "stress", "meditation"]
    },
    {
      id: 4,
      title: "Best fitness trackers for seniors - recommendations?",
      description: "Looking for a simple fitness tracker for my 70-year-old mother who wants to monitor her daily steps and heart rate. Ease of use is the priority.",
      author: "ActiveSenior",
      category: "Fitness Technology",
      comments: 19,
      lastActive: "2 days ago",
      tags: ["seniors", "fitness-tech", "heart-monitoring"]
    },
    {
      id: 5,
      title: "Sleep apnea diagnosis journey - what to expect?",
      description: "Recently referred for a sleep study based on my symptoms. Would appreciate hearing from others about their diagnosis process and treatment experiences.",
      author: "SleepSeeker",
      category: "Sleep Health",
      comments: 31,
      lastActive: "3 days ago",
      tags: ["sleep-apnea", "sleep-study", "CPAP"]
    },
    {
      id: 6,
      title: "Managing type 2 diabetes through lifestyle changes",
      description: "Recently diagnosed with type 2 diabetes and determined to manage it through diet and exercise. Looking for success stories and practical advice.",
      author: "DiabetesNewbie",
      category: "Chronic Conditions",
      comments: 45,
      lastActive: "3 days ago",
      tags: ["diabetes", "nutrition", "exercise"]
    }
  ];

  // Popular categories for the filter section
  const popularCategories = [
    "Mental Health", "Nutrition", "Fitness", "Sleep Health", 
    "Chronic Conditions", "Pain Management", "Preventive Care"
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="w-6 h-6 text-primary" />
        <h1 className="text-3xl font-bold">Health Forum</h1>
      </div>

      <p className="text-lg mb-8">
        Join discussions about health trends, fitness tips, and preventive care with our community of health enthusiasts and professionals.
      </p>

      {/* Search and Filter Bar */}
      <div className="bg-white p-4 rounded-lg shadow mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              type="text" 
              placeholder="Search discussions..." 
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Filter</span>
            </Button>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span>New Topic</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Forum Topics List */}
        <div className="w-full md:w-3/4">
          <h2 className="text-xl font-semibold mb-4">Recent Discussions</h2>
          
          <div className="space-y-6">
            {forumTopics.map((topic) => (
              <div key={topic.id} className="p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                <div className="flex justify-between mb-3">
                  <h2 className="text-xl font-semibold mb-2 text-primary hover:underline cursor-pointer">{topic.title}</h2>
                  <Badge variant="outline" className="h-fit">
                    {topic.category}
                  </Badge>
                </div>
                
                <p className="text-muted-foreground mb-4">
                  {topic.description}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {topic.tags.map((tag, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {topic.author}
                    </span>
                    <span>•</span>
                    <span>{topic.comments} comments</span>
                    <span>•</span>
                    <span>Last active: {topic.lastActive}</span>
                  </div>
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-center mt-8">
            <Button variant="outline">Load More Discussions</Button>
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="w-full md:w-1/4">
          {/* Popular Categories */}
          <div className="bg-white p-5 rounded-lg shadow mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Tag className="h-4 w-4 text-primary" />
              <h3 className="font-semibold">Popular Categories</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {popularCategories.map((category, idx) => (
                <Badge 
                  key={idx} 
                  variant="outline" 
                  className="cursor-pointer hover:bg-primary/10"
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>
          
          {/* Community Guidelines */}
          <div className="bg-white p-5 rounded-lg shadow">
            <h3 className="font-semibold mb-3">Community Guidelines</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <div className="min-w-[6px] h-[6px] rounded-full bg-primary mt-1.5"></div>
                <span>Be respectful and supportive of others</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="min-w-[6px] h-[6px] rounded-full bg-primary mt-1.5"></div>
                <span>No medical advice - share experiences only</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="min-w-[6px] h-[6px] rounded-full bg-primary mt-1.5"></div>
                <span>Respect privacy and confidentiality</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="min-w-[6px] h-[6px] rounded-full bg-primary mt-1.5"></div>
                <span>Report inappropriate content to moderators</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}