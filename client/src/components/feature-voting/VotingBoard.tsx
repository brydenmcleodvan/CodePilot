import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  ChevronUp, 
  MessageSquare, 
  PlusCircle, 
  Calendar, 
  CheckCircle2, 
  ClockIcon,
  Users
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';

interface FeatureRequest {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'requested' | 'planned' | 'in-progress' | 'completed';
  votes: number;
  createdAt: string;
  submittedBy: {
    id: number;
    name: string;
  };
  comments: Array<{
    id: string;
    text: string;
    createdAt: string;
    user: {
      id: number;
      name: string;
    };
  }>;
  plannedFor?: string;
}

interface User {
  id: number;
  name: string;
}

export function VotingBoard() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('all');
  const [newFeatureOpen, setNewFeatureOpen] = useState(false);
  const [newFeature, setNewFeature] = useState({
    title: '',
    description: '',
    category: 'general'
  });
  const [newComment, setNewComment] = useState<Record<string, string>>({});
  
  // Mock user for demo
  const user: User = {
    id: 1,
    name: "Demo User"
  };
  
  const { data: features, isLoading } = useQuery<FeatureRequest[]>({
    queryKey: ['/api/feature-requests'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/feature-requests');
        if (!res.ok) {
          throw new Error('Failed to fetch feature requests');
        }
        return res.json();
      } catch (error) {
        // Return empty array if endpoint doesn't exist yet
        console.log('Feature requests endpoint not available, using empty array');
        return [];
      }
    }
  });
  
  const submitFeatureMutation = useMutation({
    mutationFn: async (data: typeof newFeature) => {
      const res = await apiRequest('POST', '/api/feature-requests', data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Feature requested',
        description: 'Thank you for your suggestion!',
      });
      setNewFeatureOpen(false);
      setNewFeature({ title: '', description: '', category: 'general' });
      queryClient.invalidateQueries({ queryKey: ['/api/feature-requests'] });
    },
    onError: (error) => {
      toast({
        title: 'Failed to submit feature request',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
  
  const voteFeatureMutation = useMutation({
    mutationFn: async (featureId: string) => {
      const res = await apiRequest('POST', `/api/feature-requests/${featureId}/vote`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/feature-requests'] });
    },
    onError: (error) => {
      toast({
        title: 'Failed to vote',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
  
  const commentFeatureMutation = useMutation({
    mutationFn: async ({ featureId, text }: { featureId: string; text: string }) => {
      const res = await apiRequest('POST', `/api/feature-requests/${featureId}/comment`, { text });
      return res.json();
    },
    onSuccess: (_, variables) => {
      setNewComment({ ...newComment, [variables.featureId]: '' });
      queryClient.invalidateQueries({ queryKey: ['/api/feature-requests'] });
    },
    onError: (error) => {
      toast({
        title: 'Failed to add comment',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
  
  const handleSubmitFeature = () => {
    if (!newFeature.title.trim() || !newFeature.description.trim()) {
      toast({
        title: 'Missing information',
        description: 'Please provide both a title and description for your feature request.',
        variant: 'destructive',
      });
      return;
    }
    
    submitFeatureMutation.mutate(newFeature);
  };
  
  const handleVote = (featureId: string) => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'You need to be signed in to vote on features.',
        variant: 'destructive',
      });
      return;
    }
    
    voteFeatureMutation.mutate(featureId);
  };
  
  const handleComment = (featureId: string) => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'You need to be signed in to comment.',
        variant: 'destructive',
      });
      return;
    }
    
    const text = newComment[featureId];
    if (!text?.trim()) return;
    
    commentFeatureMutation.mutate({ featureId, text });
  };
  
  // Sample feature requests for demo purposes
  const sampleFeatures: FeatureRequest[] = [
    {
      id: '1',
      title: 'Apple Watch Integration',
      description: 'Add support for syncing health data from Apple Watch directly.',
      category: 'integrations',
      status: 'planned',
      votes: 32,
      createdAt: '2025-03-15T12:00:00Z',
      submittedBy: { id: 2, name: 'Sarah Johnson' },
      comments: [
        {
          id: '101',
          text: 'This would be amazing for tracking workouts!',
          createdAt: '2025-03-16T14:22:00Z',
          user: { id: 3, name: 'Michael Chen' }
        }
      ],
      plannedFor: '2025-Q2'
    },
    {
      id: '2',
      title: 'Dark Mode Support',
      description: 'Add dark mode option to reduce eye strain during nighttime use.',
      category: 'interface',
      status: 'in-progress',
      votes: 28,
      createdAt: '2025-03-10T09:15:00Z',
      submittedBy: { id: 4, name: 'Emma Wilson' },
      comments: []
    },
    {
      id: '3',
      title: 'Meal Planning AI Assistant',
      description: 'Create an AI assistant that suggests meal plans based on health goals and dietary restrictions.',
      category: 'ai-features',
      status: 'requested',
      votes: 15,
      createdAt: '2025-04-01T16:30:00Z',
      submittedBy: { id: 5, name: 'David Rodriguez' },
      comments: [
        {
          id: '102',
          text: 'I would love this! Especially if it can account for allergies.',
          createdAt: '2025-04-02T12:45:00Z',
          user: { id: 6, name: 'Olivia Kim' }
        },
        {
          id: '103',
          text: 'Could it also include grocery lists?',
          createdAt: '2025-04-03T08:20:00Z',
          user: { id: 7, name: 'James Thompson' }
        }
      ]
    },
    {
      id: '4',
      title: 'Export Data to CSV',
      description: 'Allow users to export their health data in CSV format for external analysis.',
      category: 'general',
      status: 'completed',
      votes: 19,
      createdAt: '2025-02-20T11:45:00Z',
      submittedBy: { id: 8, name: 'Sophia Martinez' },
      comments: []
    }
  ];
  
  // If we don't have real features yet, use the sample ones
  const displayFeatures = features && features.length > 0 ? features : sampleFeatures;
  
  // Filter features based on active tab
  const filteredFeatures = displayFeatures.filter(feature => {
    if (activeTab === 'all') return true;
    if (activeTab === 'top') return feature.votes >= 5;
    return feature.status === activeTab;
  });
  
  // Sort features by votes (descending)
  const sortedFeatures = [...filteredFeatures].sort((a, b) => b.votes - a.votes);
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'requested':
        return <Badge variant="outline" className="bg-gray-100">Requested</Badge>;
      case 'planned':
        return <Badge className="bg-blue-500">Planned</Badge>;
      case 'in-progress':
        return <Badge className="bg-amber-500">In Progress</Badge>;
      case 'completed':
        return <Badge className="bg-green-500">Completed</Badge>;
      default:
        return null;
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Feature Requests</h2>
          <p className="text-gray-600">Vote on features you'd like to see in Healthmap</p>
        </div>
        
        <Dialog open={newFeatureOpen} onOpenChange={setNewFeatureOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Suggest Feature
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Suggest a New Feature</DialogTitle>
              <DialogDescription>
                What would make Healthmap better for you? Share your ideas.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="title" className="text-sm font-medium">
                  Feature Title
                </label>
                <Input
                  id="title"
                  placeholder="Briefly describe your feature idea"
                  value={newFeature.title}
                  onChange={(e) => setNewFeature({ ...newFeature, title: e.target.value })}
                />
              </div>
              
              <div className="grid gap-2">
                <label htmlFor="category" className="text-sm font-medium">
                  Category
                </label>
                <select 
                  id="category"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={newFeature.category}
                  onChange={(e) => setNewFeature({ ...newFeature, category: e.target.value })}
                >
                  <option value="general">General</option>
                  <option value="health-tracking">Health Tracking</option>
                  <option value="ai-features">AI Features</option>
                  <option value="interface">User Interface</option>
                  <option value="integrations">Integrations</option>
                  <option value="mobile">Mobile Apps</option>
                </select>
              </div>
              
              <div className="grid gap-2">
                <label htmlFor="description" className="text-sm font-medium">
                  Description
                </label>
                <Textarea
                  id="description"
                  placeholder="Provide details about how this feature would work and why it would be valuable"
                  className="min-h-[120px]"
                  value={newFeature.description}
                  onChange={(e) => setNewFeature({ ...newFeature, description: e.target.value })}
                />
              </div>
            </div>
            
            <DialogFooter className="flex space-x-2 sm:justify-end">
              <Button 
                variant="outline" 
                onClick={() => setNewFeatureOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                onClick={handleSubmitFeature}
                disabled={submitFeatureMutation.isPending}
              >
                {submitFeatureMutation.isPending ? 'Submitting...' : 'Submit Request'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <Tabs 
        defaultValue="all" 
        value={activeTab} 
        onValueChange={setActiveTab} 
        className="mb-8"
      >
        <TabsList className="grid grid-cols-6 mb-8 max-w-2xl">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="top">Top Voted</TabsTrigger>
          <TabsTrigger value="requested">Requested</TabsTrigger>
          <TabsTrigger value="planned">Planned</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <div className="grid gap-6">
        {isLoading ? (
          // Loading skeletons
          [...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-gray-200 rounded w-full mb-2" />
                <div className="h-4 bg-gray-200 rounded w-full mb-2" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
              </CardContent>
            </Card>
          ))
        ) : sortedFeatures.length > 0 ? (
          sortedFeatures.map(feature => (
            <Card key={feature.id} className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                    <CardDescription className="mt-1">
                      <span className="inline-block mr-4">
                        <span className="text-xs text-gray-500">Submitted by </span>
                        <span className="text-sm">{feature.submittedBy.name}</span>
                      </span>
                      <span className="inline-block mr-4">
                        <span className="text-xs text-gray-500">Category: </span>
                        <span className="text-sm capitalize">{feature.category}</span>
                      </span>
                    </CardDescription>
                  </div>
                  <div className="flex items-center">
                    {getStatusBadge(feature.status)}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pb-3">
                <p className="text-gray-700 mb-6">{feature.description}</p>
                
                <div className="flex flex-wrap gap-4 items-center text-sm text-gray-600">
                  {feature.plannedFor && (
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>Planned for {feature.plannedFor}</span>
                    </div>
                  )}
                  
                  {feature.status === 'completed' && (
                    <div className="flex items-center text-green-600">
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      <span>Completed</span>
                    </div>
                  )}
                  
                  {feature.status === 'in-progress' && (
                    <div className="flex items-center text-amber-600">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      <span>In Development</span>
                    </div>
                  )}
                  
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    <span>{feature.votes} {feature.votes === 1 ? 'vote' : 'votes'}</span>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="flex flex-col sm:flex-row items-start justify-between pt-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  className="mb-3 sm:mb-0"
                  onClick={() => handleVote(feature.id)}
                >
                  <ChevronUp className="h-4 w-4 mr-1" />
                  Upvote
                </Button>
                
                <div className="w-full sm:w-auto">
                  {feature.comments.length > 0 ? (
                    <div className="mb-3">
                      <h4 className="text-sm font-medium mb-2 flex items-center">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        <span>Comments ({feature.comments.length})</span>
                      </h4>
                      <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
                        {feature.comments.map(comment => (
                          <div key={comment.id} className="bg-gray-50 dark:bg-gray-800 p-2 rounded text-sm">
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                              <span>{comment.user.name}</span>
                              <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p>{comment.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  
                  <div className="flex gap-2 w-full">
                    <Input
                      placeholder="Add a comment..."
                      value={newComment[feature.id] || ''}
                      onChange={(e) => setNewComment({ ...newComment, [feature.id]: e.target.value })}
                      className="flex-grow text-sm"
                    />
                    <Button 
                      size="sm" 
                      onClick={() => handleComment(feature.id)}
                      disabled={!newComment[feature.id]?.trim()}
                    >
                      Post
                    </Button>
                  </div>
                </div>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl font-medium mb-2">No feature requests yet</h3>
            <p className="text-gray-600 mb-6">
              Be the first to suggest a new feature for Healthmap!
            </p>
            <Button onClick={() => setNewFeatureOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Suggest Feature
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}