import { useState, useEffect } from "react";
import { NewsUpdate } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import Card from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface NewsUpdatesProps {
  newsItems: NewsUpdate[];
  isLoading: boolean;
}

const NewsUpdates = ({ newsItems, isLoading }: NewsUpdatesProps) => {
  if (isLoading) {
    return (
      <div className="mb-8 sm:mb-10 md:mb-12">
        <div className="flex justify-between items-center px-2 sm:px-4 mb-4 sm:mb-6">
          <Skeleton className="h-6 sm:h-8 w-48 sm:w-64" />
          <Skeleton className="h-5 sm:h-6 w-20 sm:w-24" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <Skeleton className="h-80 sm:h-96 w-full rounded-xl" />
          <Skeleton className="h-80 sm:h-96 w-full rounded-xl" />
          <Skeleton className="h-80 sm:h-96 w-full rounded-xl hidden lg:block" />
        </div>
      </div>
    );
  }

  if (!newsItems || newsItems.length === 0) {
    return (
      <div className="space-y-6">
        <div className="px-4">
          <h2 className="text-xl font-semibold tracking-tight">Health News & Updates</h2>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No news articles available at this time.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex justify-between items-center px-2 sm:px-4">
        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold tracking-tight">Health News & Updates</h2>
        <Link to="/news" className="text-primary hover:text-secondary flex items-center space-x-1">
          <span>View All</span>
          <i className="ri-arrow-right-line"></i>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {newsItems.map((news, index) => (
          <Card
            key={news.id}
            title={news.title}
            subtitle={news.content}
            image={news.thumbnail || undefined}
            tags={[news.category]}
          >
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">
                {new Date(news.timestamp).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </span>
              <Button variant="link" size="sm">Read More</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Helper function to get category-specific styling
const getCategoryStyles = (category: string): string => {
  switch (category) {
    case 'Nutrition':
      return 'text-primary bg-primary/10 rounded-full px-3 py-1';
    case 'Mental Health':
      return 'text-blue-500 bg-blue-500/10 rounded-full px-3 py-1';
    case 'Fitness':
      return 'text-amber-500 bg-amber-500/10 rounded-full px-3 py-1';
    default:
      return 'text-gray-700 bg-gray-200 rounded-full px-3 py-1';
  }
};

export default NewsUpdates;
