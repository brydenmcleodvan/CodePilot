import { useState, useEffect } from "react";
import { NewsUpdate } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Link } from "wouter";

interface NewsUpdatesProps {
  newsItems: NewsUpdate[];
  isLoading: boolean;
}

const NewsUpdates = ({ newsItems, isLoading }: NewsUpdatesProps) => {
  if (isLoading) {
    return (
      <div className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-6 w-24" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-96 w-full rounded-xl" />
          <Skeleton className="h-96 w-full rounded-xl" />
          <Skeleton className="h-96 w-full rounded-xl hidden lg:block" />
        </div>
      </div>
    );
  }

  if (!newsItems || newsItems.length === 0) {
    return (
      <div className="mb-12">
        <h2 className="text-2xl font-heading font-semibold mb-6">Health News & Updates</h2>
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
    <div className="mb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-heading font-semibold">Health News & Updates</h2>
        <Link to="/news" className="text-primary hover:text-secondary flex items-center space-x-1">
          <span>View All</span>
          <i className="ri-arrow-right-line"></i>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {newsItems.map((news, index) => (
          <article 
            key={news.id} 
            className="bg-white rounded-xl shadow-md overflow-hidden transition-transform hover:scale-105 duration-200"
          >
            <img
              src={news.thumbnail}
              alt={news.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <span className={`text-xs font-medium ${getCategoryStyles(news.category)}`}>
                {news.category}
              </span>
              <h3 className="mt-3 text-lg font-medium">{news.title}</h3>
              <p className="mt-2 text-gray-600 line-clamp-2">{news.content}</p>
              <div className="mt-4 flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  {new Date(news.timestamp).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </span>
                <button className="text-primary hover:text-secondary">Read More</button>
              </div>
            </div>
          </article>
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
