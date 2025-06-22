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
    <div className="container mx-auto px-4">
      <section id="home" className="space-y-8">
        {/* Hero Section */}
        <Hero />

        {/* News & Updates */}
        <NewsUpdates newsItems={newsItems || []} isLoading={newsLoading} />

        {/* Personalized Health Store */}
        <ProductRecommendations user={user} products={recommendedProducts || []} />
      </section>
    </div>
  );
};

export default Home;
