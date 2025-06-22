import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Product, User } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import Card from "@/components/ui/Card";
import { Link } from "wouter";
import ConnectHealthDataButton from "@/components/connect-health-data";

interface ProductRecommendationsProps {
  user: User | null;
  products: Product[] | null | undefined;
}

const ProductRecommendations = ({ user, products }: ProductRecommendationsProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showConnectModal, setShowConnectModal] = useState(false);

  // Query for product recommendations
  const { data: recommendedProducts, isLoading } = useQuery({
    queryKey: ['/api/products/recommendations'],
    enabled: !!user,
  });

  // If user isn't logged in, show default products
  const displayProducts: Product[] = user 
    ? (recommendedProducts as Product[] || products || []) 
    : (products || []);

  const connectHealthData = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to connect your health data",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Connecting health data",
      description: "Your health data is being connected for personalized recommendations"
    });

    // Simulating a connection process
    setTimeout(() => {
      toast({
        title: "Health data connected",
        description: "Your recommendations have been updated based on your health profile"
      });
      
      // Refresh recommendations
      queryClient.invalidateQueries({ queryKey: ['/api/products/recommendations'] });
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold mb-2 tracking-tight">
          {user ? "Personalized Recommendations" : "Health Products"}
        </h2>
        <button className="text-primary hover:text-secondary flex items-center space-x-1">
          <span>View All</span>
          <i className="ri-arrow-right-line"></i>
        </button>
      </div>

      <div className="relative bg-white rounded-xl shadow-lg p-8">
        <div className="lg:w-2/3 space-y-6">
          <h3 className="text-xl font-semibold mb-2 tracking-tight">Personalized Health Store</h3>
          <p className="text-gray-600">
            {user 
              ? "Based on your nutrient status, we've curated products that may help address your specific health needs."
              : "Connect your health data to receive personalized product recommendations tailored to your needs."}
          </p>

          {user ? (
            <ConnectHealthDataButton />
          ) : (
            <Link href="/auth/login">
              <Button>
                Log In to Connect Health Data
              </Button>
            </Link>
          )}
        </div>
        <div className="absolute right-0 bottom-0 hidden lg:block">
          <img
            src="https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80"
            alt="Health Products"
            className="h-40 rounded-br-xl"
          />
        </div>
      </div>

      {isLoading && user ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Skeleton className="h-96 w-full rounded-xl" />
          <Skeleton className="h-96 w-full rounded-xl" />
          <Skeleton className="h-96 w-full rounded-xl hidden lg:block" />
          <Skeleton className="h-96 w-full rounded-xl hidden lg:block" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayProducts.map((product) => {
            // Use default image if none provided
            const imageUrl = typeof product.image === 'string' ? product.image : 'https://placehold.co/600x400?text=Product+Image';
            
            // Check if tags exist before trying to use includes()
            const isRecommended = Array.isArray(product.tags) && product.tags.includes("recommended");
            
            return (
              <Card
                key={product.id}
                title={product.name}
                subtitle={product.description}
                image={imageUrl}
                tags={product.tags || []}
              >
                <div className="flex flex-col gap-2">
                  <p className="text-primary font-bold">{product.price}</p>
                  <Button className="w-full">
                    Add to Cart
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProductRecommendations;
