import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft } from 'lucide-react';
import { useLocation } from 'wouter';
import { MetaTags } from '@/components/seo/MetaTags';

interface ChangelogEntry {
  id: string;
  version: string;
  date: string;
  title: string;
  description: string;
  changes: Array<{
    type: 'added' | 'improved' | 'fixed' | 'removed';
    description: string;
  }>;
  releaseNotes?: string;
}

export default function ChangelogPage() {
  const [_, setLocation] = useLocation();
  const [filter, setFilter] = useState<string>('all');
  
  const { data: changelog, isLoading } = useQuery<ChangelogEntry[]>({
    queryKey: ['/api/changelog'],
    queryFn: async () => {
      const res = await fetch('/api/changelog');
      if (!res.ok) {
        throw new Error('Failed to fetch changelog');
      }
      return res.json();
    }
  });
  
  // Group entries by month/year for better organization
  const groupedChangelog = changelog?.reduce<Record<string, ChangelogEntry[]>>((groups, entry) => {
    const date = parseISO(entry.date);
    const monthYear = format(date, 'MMMM yyyy');
    
    if (!groups[monthYear]) {
      groups[monthYear] = [];
    }
    
    groups[monthYear].push(entry);
    return groups;
  }, {}) || {};
  
  // Get unique change types for filtering
  const changeTypes = ['all', 'added', 'improved', 'fixed', 'removed'];
  
  return (
    <div className="container mx-auto px-4 py-12">
      <MetaTags
        title="Changelog | Healthmap"
        description="Stay up to date with all the latest features, improvements, and fixes in Healthmap."
        ogImage="/og-images/changelog.jpg"
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
      
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-3">What's New in Healthmap</h1>
          <p className="text-xl text-gray-600">
            Stay up to date with the latest features, improvements, and fixes
          </p>
        </div>
        
        <Tabs 
          defaultValue="all" 
          value={filter} 
          onValueChange={setFilter} 
          className="mb-8"
        >
          <TabsList className="grid grid-cols-5 mb-8">
            {changeTypes.map(type => (
              <TabsTrigger 
                key={type} 
                value={type} 
                className="capitalize"
              >
                {type}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        
        {isLoading ? (
          <div className="space-y-8">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-5 w-32 mb-2" />
                  <Skeleton className="h-7 w-3/4" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : Object.keys(groupedChangelog).length > 0 ? (
          <div className="space-y-10">
            {Object.entries(groupedChangelog).map(([monthYear, entries]) => (
              <div key={monthYear}>
                <h2 className="text-2xl font-bold mb-4">{monthYear}</h2>
                
                <div className="space-y-6">
                  {entries.map(entry => (
                    <Card key={entry.id} className="overflow-hidden">
                      <CardHeader className="border-b bg-gray-50 dark:bg-gray-800">
                        <div className="flex justify-between items-center mb-1">
                          <Badge variant="outline" className="font-mono text-xs">
                            v{entry.version}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {format(parseISO(entry.date), 'MMMM d, yyyy')}
                          </span>
                        </div>
                        <CardTitle>{entry.title}</CardTitle>
                        <CardDescription>{entry.description}</CardDescription>
                      </CardHeader>
                      
                      <CardContent className="pt-6">
                        <ul className="space-y-4">
                          {entry.changes
                            .filter(change => filter === 'all' || change.type === filter)
                            .map((change, i) => (
                              <li key={i} className="flex">
                                <Badge 
                                  className={`mr-3 capitalize ${
                                    change.type === 'added' ? 'bg-green-500' : 
                                    change.type === 'improved' ? 'bg-blue-500' : 
                                    change.type === 'fixed' ? 'bg-amber-500' : 'bg-red-500'
                                  }`}
                                >
                                  {change.type}
                                </Badge>
                                <span>{change.description}</span>
                              </li>
                            ))}
                        </ul>
                        
                        {entry.releaseNotes && filter === 'all' && (
                          <div className="mt-6 pt-4 border-t">
                            <h3 className="font-medium mb-2">Release Notes</h3>
                            <p className="text-gray-600 text-sm">{entry.releaseNotes}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl font-medium mb-2">No updates yet</h3>
            <p className="text-gray-600">
              Check back soon for the latest improvements and new features!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}