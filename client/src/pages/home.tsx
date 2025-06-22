import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import Hero from "@/components/ui/Hero";
import HealthStats from "@/components/health-stats";
import MedicationTracker from "@/components/medication-tracker";
import NewsUpdates from "@/components/news-updates";
import ProductRecommendations from "@/components/product-recommendations";

const Home = () => {
  const { user } = useAuth();

  // Query for recommended products based on health data
  const { data: recommendedProducts } = useQuery({
    queryKey: ['/api/products/recommendations'],
    enabled: !!user,
  });

  // Query for news updates
  const { data: newsItems, isLoading: newsLoading } = useQuery({
    queryKey: ['/api/news', { limit: 3 }],
  });

  return (
    <section id="home" className="space-y-6 sm:space-y-8 md:space-y-10 lg:space-y-12">
      {/* Hero Section */}
      <div className="px-4 sm:px-6 md:px-8 lg:px-12">
        <Hero />
      </div>

      {/* News & Updates */}
      <div className="px-4 sm:px-6 md:px-8 lg:px-12">
        <NewsUpdates newsItems={newsItems || []} isLoading={newsLoading} />
      </div>

      {/* Personalized Health Store */}
      <div className="px-4 sm:px-6 md:px-8 lg:px-12">
        <ProductRecommendations user={user} products={recommendedProducts || []} />
      </div>
    </section>
  );
};

export default Home;
