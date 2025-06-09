import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

// Define product category types
type ProductCategory = 
  | "vitamins" 
  | "minerals" 
  | "meal-kits" 
  | "equipment" 
  | "tests" 
  | "all";

// Define product interface
interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  image: string;
  category: ProductCategory;
  tags: string[];
  rating: number;
  reviews: number;
  inStock: boolean;
}

// Sample product data
const products: Product[] = [
  {
    id: "vitd3-5000",
    name: "Vitamin D3 5000 IU",
    description: "High-potency vitamin D3 for immune support and bone health",
    price: "$24.99",
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
    category: "vitamins",
    tags: ["bestseller", "immune-support"],
    rating: 4.8,
    reviews: 245,
    inStock: true
  },
  {
    id: "omega3-1000",
    name: "Omega-3 Fish Oil",
    description: "Pure fish oil with EPA & DHA for heart and brain health",
    price: "$19.99",
    image: "https://images.unsplash.com/photo-1626797889772-458ddd2c821a?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
    category: "vitamins",
    tags: ["heart-health"],
    rating: 4.6,
    reviews: 182,
    inStock: true
  },
  {
    id: "zinc-50mg",
    name: "Zinc Picolinate 50mg",
    description: "Highly absorbable zinc supplement for immune function and nutrient metabolism",
    price: "$15.99",
    image: "https://images.unsplash.com/photo-1584362917165-526a968579e8?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
    category: "minerals",
    tags: ["immune-support", "recommended"],
    rating: 4.7,
    reviews: 158,
    inStock: true
  },
  {
    id: "magnesium-glycinate",
    name: "Magnesium Glycinate",
    description: "Gentle and highly absorbable form of magnesium for sleep and muscle support",
    price: "$21.99",
    image: "https://images.unsplash.com/photo-1580651214613-f4692d6d138f?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
    category: "minerals",
    tags: ["sleep-support", "recommended"],
    rating: 4.9,
    reviews: 213,
    inStock: true
  },
  {
    id: "whoop-strap",
    name: "Whoop Strap 4.0",
    description: "24/7 fitness tracker with advanced recovery metrics and sleep analysis",
    price: "$299.99",
    image: "https://images.unsplash.com/photo-1595078475328-1ab05d0a6a0e?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
    category: "equipment",
    tags: ["wearable", "recommended"],
    rating: 4.5,
    reviews: 324,
    inStock: true
  },
  {
    id: "med-meal-kit",
    name: "Mediterranean Diet Meal Kit",
    description: "Weekly meal kit with heart-healthy Mediterranean recipes and pre-portioned ingredients",
    price: "$89.99/week",
    image: "https://images.unsplash.com/photo-1551807501-9e71b382fb8f?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
    category: "meal-kits",
    tags: ["heart-healthy", "diabetes-friendly"],
    rating: 4.4,
    reviews: 97,
    inStock: true
  },
  {
    id: "blood-glucose",
    name: "Continuous Glucose Monitor",
    description: "Real-time blood glucose tracking to optimize metabolic health",
    price: "$199.99",
    image: "https://images.unsplash.com/photo-1544829832-c8047d6b759c?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
    category: "tests",
    tags: ["metabolic-health", "diabetes-management"],
    rating: 4.7,
    reviews: 142,
    inStock: true
  },
  {
    id: "ancestry-dna",
    name: "Ancestry DNA Test Kit",
    description: "Comprehensive DNA testing for ancestry, family connections, and genetic traits",
    price: "$99.99",
    image: "https://images.unsplash.com/photo-1583811444340-83f0c382e0af?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
    category: "tests",
    tags: ["genetic-testing"],
    rating: 4.6,
    reviews: 278,
    inStock: true
  },
  {
    id: "resistance-bands",
    name: "Resistance Bands Set",
    description: "Complete resistance training kit for home workouts with multiple resistance levels",
    price: "$34.99",
    image: "https://images.unsplash.com/photo-1604999565976-8913ad2ddb7c?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
    category: "equipment",
    tags: ["fitness"],
    rating: 4.8,
    reviews: 312,
    inStock: true
  },
  {
    id: "keto-meal-kit",
    name: "Keto Diet Meal Kit",
    description: "Low-carb, high-fat meal kit with chef-created recipes delivered weekly",
    price: "$94.99/week",
    image: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
    category: "meal-kits",
    tags: ["keto", "weight-management"],
    rating: 4.3,
    reviews: 87,
    inStock: true
  },
  {
    id: "b-complex",
    name: "B-Complex Vitamins",
    description: "Complete B vitamin complex for energy, metabolism, and nervous system support",
    price: "$18.99",
    image: "https://images.unsplash.com/photo-1584308666999-a3e724a38a37?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
    category: "vitamins",
    tags: ["energy"],
    rating: 4.5,
    reviews: 165,
    inStock: true
  },
  {
    id: "iron-supplement",
    name: "Iron Supplement",
    description: "Gentle iron formula for energy, red blood cell production, and oxygen transport",
    price: "$17.99",
    image: "https://images.unsplash.com/photo-1639366340926-68ced1909472?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
    category: "minerals",
    tags: ["women's-health"],
    rating: 4.4,
    reviews: 132,
    inStock: true
  }
];

export default function Shop() {
  const { toast } = useToast();
  const [category, setCategory] = useState<ProductCategory>("all");
  const [sortOption, setSortOption] = useState("featured");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<{id: string, quantity: number}[]>([]);

  // Filter products based on category and search query
  const filteredProducts = products.filter((product) => {
    const matchesCategory = category === "all" || product.category === category;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Sort products based on selected sort option
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch(sortOption) {
      case "price-low":
        return parseFloat(a.price.replace("$", "")) - parseFloat(b.price.replace("$", ""));
      case "price-high":
        return parseFloat(b.price.replace("$", "")) - parseFloat(a.price.replace("$", ""));
      case "rating":
        return b.rating - a.rating;
      case "reviews":
        return b.reviews - a.reviews;
      default:
        // For "featured" sort, prioritize recommended items
        return a.tags.includes("recommended") ? -1 : b.tags.includes("recommended") ? 1 : 0;
    }
  });

  const addToCart = (productId: string) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === productId);
      if (existingItem) {
        return prevCart.map(item => 
          item.id === productId 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      } else {
        return [...prevCart, { id: productId, quantity: 1 }];
      }
    });

    toast({
      title: "Added to Cart",
      description: "The item has been added to your cart",
    });
  };

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold mb-2">Health & Wellness Shop</h1>
          <p className="text-gray-600">Discover products to support your health journey</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center">
          <Button variant="outline" className="flex items-center gap-2 mr-3">
            <i className="ri-shopping-cart-2-line"></i>
            Cart
            {cartItemCount > 0 && (
              <Badge className="ml-1 bg-primary text-white">{cartItemCount}</Badge>
            )}
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Section */}
        <div className="lg:w-1/4">
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-sm font-medium mb-3">Category</h3>
                <Tabs defaultValue="all" value={category} onValueChange={(value) => setCategory(value as ProductCategory)}>
                  <TabsList className="grid grid-cols-2 mb-2">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="vitamins">Vitamins</TabsTrigger>
                  </TabsList>
                  <TabsList className="grid grid-cols-2 mb-2">
                    <TabsTrigger value="minerals">Minerals</TabsTrigger>
                    <TabsTrigger value="meal-kits">Meal Kits</TabsTrigger>
                  </TabsList>
                  <TabsList className="grid grid-cols-2">
                    <TabsTrigger value="equipment">Equipment</TabsTrigger>
                    <TabsTrigger value="tests">Tests</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-3">Sort By</h3>
                <Select value={sortOption} onValueChange={setSortOption}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort Products" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="reviews">Most Reviewed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-3">Search</h3>
                <Input 
                  placeholder="Search products..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Personalized Recommendations</CardTitle>
              <CardDescription>
                Connect your health data to get product recommendations tailored to your needs.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => {
                  toast({
                    title: "Health Data Integration",
                    description: "Connect your devices to get personalized recommendations",
                  });
                }}
              >
                <i className="ri-heart-pulse-line mr-2"></i>
                Connect Health Data
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Products Grid */}
        <div className="lg:w-3/4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden flex flex-col">
                <div className="relative h-48">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  {product.tags.includes("bestseller") && (
                    <Badge className="absolute top-2 right-2 bg-orange-500 hover:bg-orange-600">
                      Bestseller
                    </Badge>
                  )}
                  {product.tags.includes("recommended") && (
                    <Badge className="absolute top-2 right-2 bg-blue-500 hover:bg-blue-600">
                      Recommended
                    </Badge>
                  )}
                </div>
                
                <CardContent className="pt-4 flex-grow">
                  <h3 className="font-medium text-lg">{product.name}</h3>
                  <div className="flex items-center mt-1 mb-2">
                    <div className="flex items-center mr-2">
                      {[...Array(5)].map((_, i) => (
                        <i
                          key={i}
                          className={`ri-star-${i < Math.floor(product.rating) ? 'fill' : i < product.rating ? 'half-fill' : 'line'} text-yellow-400`}
                        ></i>
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">({product.reviews})</span>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{product.description}</p>
                  <p className="font-bold text-lg">{product.price}</p>
                </CardContent>
                
                <CardFooter className="pt-0">
                  <Button 
                    className="w-full"
                    onClick={() => addToCart(product.id)}
                  >
                    Add to Cart
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <h3 className="text-lg font-medium mb-2">No products found</h3>
              <p className="text-gray-600">Try adjusting your filters or search term</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}