import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { 
  ShoppingCart, 
  Star, 
  TrendingUp, 
  Users, 
  Package, 
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Filter,
  Search,
  Tag,
  Award,
  Heart,
  Brain,
  Zap,
  Shield
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  price: number;
  currency: string;
  rating: number;
  reviewCount: number;
  image: string;
  affiliateUrl: string;
  partner: 'amazon' | 'iherb' | 'vitacost' | 'thorne' | 'custom';
  healthBenefits: string[];
  recommendedFor: string[];
  evidenceLevel: 'high' | 'moderate' | 'limited';
  userMatch: number; // 0-100 percentage match based on user's health data
  effectivenessData?: {
    averageImprovement: number;
    timeToResults: string;
    userReports: number;
  };
}

interface UserRecommendation {
  reason: string;
  confidence: number;
  expectedBenefit: string;
  relatedMetrics: string[];
}

export default function AffiliateMarketplacePage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("match");

  // Fetch personalized product recommendations
  const { data: recommendations = [], isLoading } = useQuery<Product[]>({
    queryKey: ['/api/affiliate/recommendations', selectedCategory, sortBy],
    queryFn: async () => {
      // Mock data - would connect to real affiliate APIs
      return [
        {
          id: 'zinc-1',
          name: 'Zinc Picolinate 25mg',
          brand: 'Thorne Research',
          category: 'immune',
          description: 'Highly bioavailable zinc supplement for immune support and wound healing',
          price: 24.99,
          currency: 'USD',
          rating: 4.7,
          reviewCount: 1247,
          image: '/api/placeholder/zinc-supplement.jpg',
          affiliateUrl: 'https://affiliate.link/zinc-picolinate',
          partner: 'thorne',
          healthBenefits: ['Immune function', 'Wound healing', 'Protein synthesis'],
          recommendedFor: ['Low zinc levels', 'Frequent infections', 'Slow healing'],
          evidenceLevel: 'high',
          userMatch: 95,
          effectivenessData: {
            averageImprovement: 42,
            timeToResults: '3-4 weeks',
            userReports: 89
          }
        },
        {
          id: 'omega3-1',
          name: 'Nordic Naturals Ultimate Omega',
          brand: 'Nordic Naturals',
          category: 'heart',
          description: 'High-potency omega-3 fatty acids for cardiovascular and cognitive health',
          price: 34.95,
          currency: 'USD',
          rating: 4.8,
          reviewCount: 2156,
          image: '/api/placeholder/omega3-supplement.jpg',
          affiliateUrl: 'https://affiliate.link/ultimate-omega',
          partner: 'iherb',
          healthBenefits: ['Heart health', 'Brain function', 'Anti-inflammatory'],
          recommendedFor: ['High triglycerides', 'Cognitive support', 'Joint health'],
          evidenceLevel: 'high',
          userMatch: 88,
          effectivenessData: {
            averageImprovement: 38,
            timeToResults: '6-8 weeks',
            userReports: 156
          }
        },
        {
          id: 'magnesium-1',
          name: 'Magnesium Glycinate 400mg',
          brand: 'Doctor\'s Best',
          category: 'sleep',
          description: 'Chelated magnesium for better absorption and sleep support',
          price: 19.99,
          currency: 'USD',
          rating: 4.6,
          reviewCount: 987,
          image: '/api/placeholder/magnesium-supplement.jpg',
          affiliateUrl: 'https://affiliate.link/magnesium-glycinate',
          partner: 'amazon',
          healthBenefits: ['Sleep quality', 'Muscle relaxation', 'Stress reduction'],
          recommendedFor: ['Poor sleep', 'Muscle tension', 'Stress'],
          evidenceLevel: 'moderate',
          userMatch: 82,
          effectivenessData: {
            averageImprovement: 35,
            timeToResults: '1-2 weeks',
            userReports: 67
          }
        },
        {
          id: 'fitness-tracker-1',
          name: 'Oura Ring Gen 3',
          brand: 'Oura',
          category: 'devices',
          description: 'Advanced sleep and activity tracking ring with health insights',
          price: 299.00,
          currency: 'USD',
          rating: 4.5,
          reviewCount: 3421,
          image: '/api/placeholder/oura-ring.jpg',
          affiliateUrl: 'https://affiliate.link/oura-ring-gen3',
          partner: 'custom',
          healthBenefits: ['Sleep tracking', 'HRV monitoring', 'Activity tracking'],
          recommendedFor: ['Sleep optimization', 'Recovery tracking', 'Health monitoring'],
          evidenceLevel: 'high',
          userMatch: 77,
          effectivenessData: {
            averageImprovement: 52,
            timeToResults: 'Immediate',
            userReports: 234
          }
        }
      ];
    }
  });

  // Track affiliate click mutation
  const trackClickMutation = useMutation({
    mutationFn: async (productId: string) => {
      const res = await apiRequest('POST', '/api/affiliate/track-click', {
        productId,
        timestamp: new Date().toISOString()
      });
      return res.json();
    }
  });

  // Purchase feedback mutation
  const submitFeedbackMutation = useMutation({
    mutationFn: async (feedback: { productId: string; purchased: boolean; helpful: boolean }) => {
      const res = await apiRequest('POST', '/api/affiliate/feedback', feedback);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Thank you!",
        description: "Your feedback helps us improve recommendations for everyone.",
      });
    }
  });

  const categories = [
    { id: 'all', name: 'All Products', icon: Package },
    { id: 'immune', name: 'Immune Support', icon: Shield },
    { id: 'heart', name: 'Heart Health', icon: Heart },
    { id: 'brain', name: 'Brain & Cognitive', icon: Brain },
    { id: 'energy', name: 'Energy & Vitality', icon: Zap },
    { id: 'sleep', name: 'Sleep & Recovery', icon: Heart },
    { id: 'devices', name: 'Health Devices', icon: Package }
  ];

  const getPartnerBadge = (partner: string) => {
    const badges = {
      amazon: { name: 'Amazon', color: 'bg-orange-100 text-orange-800' },
      iherb: { name: 'iHerb', color: 'bg-green-100 text-green-800' },
      thorne: { name: 'Thorne', color: 'bg-blue-100 text-blue-800' },
      custom: { name: 'Partner', color: 'bg-purple-100 text-purple-800' }
    };
    return badges[partner] || badges.custom;
  };

  const getEvidenceColor = (level: string) => {
    const colors = {
      high: 'text-green-600',
      moderate: 'text-yellow-600',
      limited: 'text-gray-600'
    };
    return colors[level] || colors.limited;
  };

  const handleProductClick = (product: Product) => {
    trackClickMutation.mutate(product.id);
    window.open(product.affiliateUrl, '_blank', 'noopener,noreferrer');
  };

  const filteredProducts = recommendations.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'match':
        return b.userMatch - a.userMatch;
      case 'rating':
        return b.rating - a.rating;
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      default:
        return b.userMatch - a.userMatch;
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-3">Loading personalized recommendations...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Smart Health Marketplace
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Personalized product recommendations based on your health data and goals. 
            Track effectiveness and see real results from the Healthmap community.
          </p>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search products, brands, or benefits..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="match">Best Match</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Category Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex flex-wrap gap-2">
            {categories.map((category, index) => (
              <motion.button
                key={category.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * index }}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <category.icon className="h-4 w-4" />
                <span className="text-sm font-medium">{category.name}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Products Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {sortedProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * index }}
              whileHover={{ y: -5 }}
            >
              <Card className="h-full cursor-pointer transition-all hover:shadow-lg">
                <CardContent className="p-6">
                  {/* Product Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge 
                          className={`text-xs ${getPartnerBadge(product.partner).color}`}
                        >
                          {getPartnerBadge(product.partner).name}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {product.userMatch}% match
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{product.brand}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-blue-600">
                        ${product.price}
                      </div>
                      <div className="flex items-center space-x-1 text-sm">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span>{product.rating}</span>
                        <span className="text-gray-500">({product.reviewCount})</span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-4">{product.description}</p>

                  {/* Health Benefits */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium mb-2">Health Benefits:</h4>
                    <div className="flex flex-wrap gap-1">
                      {product.healthBenefits.slice(0, 3).map((benefit) => (
                        <Badge key={benefit} variant="secondary" className="text-xs">
                          {benefit}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Effectiveness Data */}
                  {product.effectivenessData && (
                    <div className="mb-4 p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800">
                          Community Results
                        </span>
                      </div>
                      <div className="text-xs text-green-700 space-y-1">
                        <div>Average improvement: {product.effectivenessData.averageImprovement}%</div>
                        <div>Time to results: {product.effectivenessData.timeToResults}</div>
                        <div>Based on {product.effectivenessData.userReports} user reports</div>
                      </div>
                    </div>
                  )}

                  {/* Evidence Level */}
                  <div className="mb-4">
                    <div className="flex items-center space-x-2">
                      <Award className="h-4 w-4" />
                      <span className="text-sm">Evidence Level:</span>
                      <span className={`text-sm font-medium ${getEvidenceColor(product.evidenceLevel)}`}>
                        {product.evidenceLevel.charAt(0).toUpperCase() + product.evidenceLevel.slice(1)}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <Button 
                      className="w-full"
                      onClick={() => handleProductClick(product)}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Shop Now
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </Button>
                    
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => submitFeedbackMutation.mutate({
                          productId: product.id,
                          purchased: true,
                          helpful: true
                        })}
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Purchased
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => submitFeedbackMutation.mutate({
                          productId: product.id,
                          purchased: false,
                          helpful: true
                        })}
                      >
                        <Heart className="h-3 w-3 mr-1" />
                        Helpful
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center text-sm text-gray-600"
        >
          <p>
            Recommendations are based on your health data and community feedback. 
            Healthmap may earn a commission from purchases, which helps support our platform.
            Always consult with your healthcare provider before starting new supplements.
          </p>
        </motion.div>
      </div>
    </div>
  );
}