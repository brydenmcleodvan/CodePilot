import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Star, Truck, Shield, CheckCircle, Package, CreditCard, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { trackEvent, ANALYTICS_EVENTS } from "@/lib/analytics";
import { useAuth } from "@/lib/auth";
import { useEffect } from "react";
import { motion } from "framer-motion";

interface Product {
  id: number;
  name: string;
  price: string;
  discount: string;
}

const Marketplace = () => {
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: marketData, isLoading } = useQuery({
    queryKey: ["/api/market"],
  });

  // Track marketplace visit
  useEffect(() => {
    if (user) {
      trackEvent(ANALYTICS_EVENTS.MARKETPLACE_VISITED, { userId: user.id });
    }
  }, [user]);

  const handlePurchase = (productName: string) => {
    // Track product added to cart
    trackEvent(ANALYTICS_EVENTS.PRODUCT_ADDED_TO_CART, { 
      productName, 
      userId: user?.id 
    });
    
    toast({
      title: "Added to Cart",
      description: `${productName} has been added to your shopping cart.`,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2 text-gray-600">Loading marketplace...</span>
          </div>
        </div>
      </div>
    );
  }

  const products = marketData?.products || [];

  return (
    <div className="bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-xl font-semibold tracking-tight text-gray-900 mb-2">Health Marketplace</h1>
              <p className="text-gray-600 text-sm sm:text-base">Discover products tailored to your health needs</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <ShoppingCart className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Cart </span>(0)
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Trust indicators */}
      <div className="bg-primary/5 py-4">
        <div className="container mx-auto p-4 md:p-6">
          <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-8 text-xs sm:text-sm text-gray-600">
            <div className="flex items-center">
              <Truck className="w-4 h-4 mr-2 text-primary" />
              Free shipping on orders over $50
            </div>
            <div className="flex items-center">
              <Shield className="w-4 h-4 mr-2 text-primary" />
              Verified health products
            </div>
            <div className="flex items-center">
              <Star className="w-4 h-4 mr-2 text-primary" />
              Expert-recommended
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="container mx-auto p-4 md:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product: Product, index: number) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="transform transition-all duration-300"
            >
              <Card className="rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
                <div className="p-4 md:p-6">
                  {/* Header with title and discount */}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">{product.name}</h3>
                    {product.discount && (
                      <Badge variant="destructive" className="text-xs">
                        -{product.discount}
                      </Badge>
                    )}
                  </div>

                  {/* Product Image */}
                  <div className="w-full h-48 bg-gradient-to-br from-primary/10 to-primary/20 rounded-lg mb-4 flex items-center justify-center">
                    <div className="text-primary/60 text-center">
                      <ShoppingCart className="w-12 h-12 mx-auto mb-2" />
                      <p className="text-sm">Product Image</p>
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-gray-900">{product.price}</span>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <Star className="w-4 h-4 text-gray-300" />
                        <span className="text-sm text-gray-500 ml-1">(4.0)</span>
                      </div>
                    </div>

                    {/* Product Benefits */}
                    <div className="text-sm text-gray-600">
                      {product.name.includes("Zinc") && (
                        <ul className="space-y-1">
                          <li>• Supports immune function</li>
                          <li>• High bioavailability</li>
                          <li>• Third-party tested</li>
                        </ul>
                      )}
                      {product.name.includes("Sleep") && (
                        <ul className="space-y-1">
                          <li>• Advanced sleep tracking</li>
                          <li>• 7-day battery life</li>
                          <li>• Smart alarm features</li>
                        </ul>
                      )}
                    </div>

                    {/* Purchase Button */}
                    <button 
                      className="w-full mt-4 rounded-md px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white transition flex items-center justify-center"
                      onClick={() => handlePurchase(product.name)}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add to Cart
                    </button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {products.length === 0 && (
          <div className="text-center py-16">
            <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products available</h3>
            <p className="text-gray-500">Check back soon for health products tailored to your needs.</p>
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div className="bg-white border-t mt-12">
        <div className="container mx-auto p-4 md:p-6 py-8">
          <div className="flex items-center justify-center text-center">
            <div className="max-w-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Personalized Recommendations
              </h3>
              <p className="text-gray-600 mb-4">
                Connect your health data to receive product recommendations based on your specific needs.
              </p>
              <Button variant="outline">
                Connect Health Data
              </Button>
            </div>
          </div>
        </div>

        {/* Insurance Information Section */}
        <div className="mt-12">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-blue-600" />
                Your Insurance Info
              </CardTitle>
              <CardDescription>
                Review your coverage details and see which products may be covered
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Shield className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                <p className="text-blue-700 mb-4">Connect your insurance to see coverage details</p>
                <Button variant="outline">
                  Add Insurance Info
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Marketplace;