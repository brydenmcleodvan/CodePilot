import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import ForumPost from "@/components/forum-post";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Search } from "lucide-react";

// Define subreddit objects with icons and member counts
const subreddits = [
  { id: "fitness", name: "Fitness", icon: "ri-run-line", members: "24.5k" },
  { id: "nutrition", name: "Nutrition", icon: "ri-restaurant-line", members: "18.7k" },
  { id: "mental-health", name: "Mental Health", icon: "ri-mental-health-line", members: "32.1k" },
  { id: "genetics", name: "Genetics", icon: "ri-dna-line", members: "9.4k" },
  { id: "sleep", name: "Sleep", icon: "ri-zzz-line", members: "15.2k" },
];

const Forum = () => {
  const { user } = useAuth();
  const [, params] = useRoute('/forum/:subreddit');
  const subreddit = params?.subreddit;
  const { toast } = useToast();
  const [isNewPostOpen, setIsNewPostOpen] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostTags, setNewPostTags] = useState("");

  // Get current subreddit info
  const currentSubreddit = subreddits.find(s => s.id === subreddit) || {
    id: "",
    name: "All Communities",
    icon: "ri-global-line",
    members: "100k+"
  };

  // Query for forum posts
  const { data: posts, isLoading, refetch } = useQuery({
    queryKey: ['/api/forum/posts', subreddit ? { subreddit } : {}],
  });

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to create a post",
        variant: "destructive",
      });
      return;
    }
    
    if (!newPostTitle || !newPostContent) {
      toast({
        title: "Incomplete post",
        description: "Please provide both a title and content for your post",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const tags = newPostTags.split(',').map(tag => tag.trim()).filter(Boolean);
      
      await apiRequest("POST", "/api/forum/posts", {
        title: newPostTitle,
        content: newPostContent,
        subreddit: subreddit || "general",
        tags,
        timestamp: new Date(),
      });
      
      toast({
        title: "Post created",
        description: "Your post has been published successfully",
      });
      
      setIsNewPostOpen(false);
      setNewPostTitle("");
      setNewPostContent("");
      setNewPostTags("");
      refetch();
    } catch (error) {
      toast({
        title: "Error creating post",
        description: "There was a problem creating your post. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Forum Sidebar */}
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

        {/* Forum Content */}
        <div className="md:w-2/3 lg:w-3/4">
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <div className="flex items-center space-x-2">
                  <i className={`${currentSubreddit.icon} text-primary text-xl`}></i>
                  <h2 className="text-2xl font-heading font-semibold">{currentSubreddit.name}</h2>
                </div>
                <p className="text-gray-600 mt-1">
                  {subreddit === "nutrition" && "Discuss diet, supplements, and nutritional science"}
                  {subreddit === "fitness" && "Share fitness tips, workouts, and progress"}
                  {subreddit === "mental-health" && "Support and resources for mental wellbeing"}
                  {subreddit === "genetics" && "Discuss genetic testing, inheritance, and health implications"}
                  {subreddit === "sleep" && "Tips and discussion for better sleep quality"}
                  {!subreddit && "Browse all health-related discussions"}
                </p>
              </div>
              <Button onClick={() => setIsNewPostOpen(true)}>Create Post</Button>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="flex mb-4">
                <button className="px-4 py-2 bg-primary/10 text-primary font-medium rounded-md mr-2">Hot</button>
                <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md mr-2">New</button>
                <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md mr-2">Top</button>
                <div className="relative ml-auto">
                  <select className="appearance-none bg-white border border-gray-300 px-4 py-2 pr-8 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                    <option>All Time</option>
                    <option>Today</option>
                    <option>This Week</option>
                    <option>This Month</option>
                  </select>
                  <i className="ri-arrow-down-s-line absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                </div>
              </div>
            </div>
          </div>

          {/* Forum Posts */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-10">Loading posts...</div>
            ) : posts && posts.length > 0 ? (
              posts.map((post) => (
                <ForumPost key={post.id} post={post} />
              ))
            ) : (
              <div className="bg-white rounded-xl shadow-md p-6 text-center">
                <p className="text-gray-600 mb-4">No posts found in this community.</p>
                {user ? (
                  <Button onClick={() => setIsNewPostOpen(true)}>Create the First Post</Button>
                ) : (
                  <Link href="/auth/login">
                    <Button variant="outline">Sign in to Post</Button>
                  </Link>
                )}
              </div>
            )}

            {posts && posts.length > 0 && (
              <div className="mt-6 text-center">
                <Button variant="outline">Load More</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Forum;
