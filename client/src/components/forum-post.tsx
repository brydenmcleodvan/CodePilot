import { useState } from "react";
import { ForumPost as ForumPostType } from "@shared/schema";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowBigUp, ArrowBigDown, MessageCircle, Share2, Bookmark } from "lucide-react";

interface ForumPostProps {
  post: ForumPostType;
}

const ForumPost = ({ post }: ForumPostProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isVoting, setIsVoting] = useState(false);

  // Query for user data of the post creator
  const { data: postUser } = useQuery({
    queryKey: ['/api/user', post.userId],
    // Using a custom queryFn since the default doesn't take additional path params
    queryFn: async () => {
      try {
        const res = await fetch(`/api/user/profile/${post.userId}`);
        if (!res.ok) return { username: "healthuser", profilePicture: null };
        return await res.json();
      } catch (error) {
        return { username: "healthuser", profilePicture: null };
      }
    }
  });

  // Vote mutation
  const voteMutation = useMutation({
    mutationFn: async ({ postId, isUpvote }: { postId: number, isUpvote: boolean }) => {
      return apiRequest("POST", `/api/forum/posts/${postId}/vote`, { upvote: isUpvote });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/forum/posts'] });
    }
  });

  const handleVote = async (isUpvote: boolean) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to vote on posts",
        variant: "destructive"
      });
      return;
    }

    setIsVoting(true);
    try {
      await voteMutation.mutateAsync({ postId: post.id, isUpvote });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to register your vote",
        variant: "destructive"
      });
    } finally {
      setIsVoting(false);
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const postDate = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return "just now";
    } else if (diffInHours < 24) {
      return `${diffInHours} ${diffInHours === 1 ? "hour" : "hours"} ago`;
    } else {
      return postDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <Card className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start space-x-3">
          <div className="flex flex-col items-center space-y-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-gray-400 hover:text-primary dark:text-gray-500 dark:hover:text-primary"
              disabled={isVoting}
              onClick={() => handleVote(true)}
            >
              <ArrowBigUp className="h-6 w-6" />
            </Button>
            <span className="font-medium dark:text-white">{post.upvotes - post.downvotes}</span>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-500"
              disabled={isVoting}
              onClick={() => handleVote(false)}
            >
              <ArrowBigDown className="h-6 w-6" />
            </Button>
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <img
                src={postUser?.profilePicture || "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"}
                alt="User"
                className="w-6 h-6 rounded-full"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Posted by{" "}
                <a href="#" className="text-primary hover:underline">
                  {postUser?.username || "healthuser"}
                </a>{" "}
                · {formatTimestamp(post.timestamp)}
              </span>
            </div>
            <h3 className="text-xl font-medium mb-2 dark:text-white">{post.title}</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">{post.content}</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag, index) => (
                <span key={index} className="text-xs bg-primary/10 text-primary dark:bg-primary/20 rounded-full px-3 py-1">
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex items-center space-x-4 text-gray-500 dark:text-gray-400">
              <button className="flex items-center space-x-1 hover:text-primary">
                <MessageCircle className="h-4 w-4" />
                <span>Comments</span>
              </button>
              <button className="flex items-center space-x-1 hover:text-primary">
                <Share2 className="h-4 w-4" />
                <span>Share</span>
              </button>
              <button className="flex items-center space-x-1 hover:text-primary">
                <Bookmark className="h-4 w-4" />
                <span>Save</span>
              </button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ForumPost;
