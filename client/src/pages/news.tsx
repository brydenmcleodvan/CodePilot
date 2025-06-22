import { useQuery } from "@tanstack/react-query";
import { NewsUpdate } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SharedCard } from "@/components/ui/shared-card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock, TrendingUp } from "lucide-react";

// Dummy articles array for comprehensive news display
const dummyArticles = [
  {
    id: 1,
    title: "Understanding Zinc's Role in Immune Function",
    summary: "New research reveals how zinc deficiency impacts immune response and overall health outcomes.",
    category: "Nutrition",
    publishedAt: "2024-01-15",
    readTime: 5,
    trending: true
  },
  {
    id: 2,
    title: "Sleep Quality and Mental Health Connection",
    summary: "Studies show the profound impact of sleep patterns on cognitive function and emotional well-being.",
    category: "Mental Health",
    publishedAt: "2024-01-14",
    readTime: 7,
    trending: true
  },
  {
    id: 3,
    title: "Breakthrough in Genetic Testing for Alzheimer's",
    summary: "APOE4 genetic markers provide new insights into early detection and prevention strategies.",
    category: "Genetics",
    publishedAt: "2024-01-13",
    readTime: 6,
    trending: false
  },
  {
    id: 4,
    title: "Personalized Nutrition Based on DNA Analysis",
    summary: "How genetic variants influence vitamin D metabolism and dietary recommendations.",
    category: "Personalized Medicine",
    publishedAt: "2024-01-12",
    readTime: 8,
    trending: true
  },
  {
    id: 5,
    title: "Caffeine Metabolism and Your Genes",
    summary: "CYP1A2 gene variants determine how quickly your body processes caffeine and optimal intake levels.",
    category: "Genetics",
    publishedAt: "2024-01-11",
    readTime: 4,
    trending: false
  },
  {
    id: 6,
    title: "AI-Driven Health Monitoring Revolution",
    summary: "Machine learning algorithms are transforming how we track and predict health outcomes.",
    category: "Technology",
    publishedAt: "2024-01-10",
    readTime: 9,
    trending: true
  }
];

export default function News() {
  const { data: newsItems = [], isLoading } = useQuery<NewsUpdate[]>({
    queryKey: ['/api/news']
  });

  // Use only dummy articles for now since API data structure differs
  const allArticles = dummyArticles;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8">
      <div className="text-center space-y-2 sm:space-y-3">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight">Health News & Updates</h1>
        <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto px-2">
          Stay informed with the latest developments in health, wellness, and medical research.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
        {allArticles.map((article) => (
          <Card key={article.id} className="hover:shadow-lg transition-shadow min-h-[320px] sm:min-h-[360px] flex flex-col">
            <CardHeader className="p-3 sm:p-4 md:p-5">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="secondary" className="text-xs sm:text-sm">{article.category}</Badge>
                <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  {article.readTime} min read
                </div>
              </div>
              <CardTitle className="line-clamp-2 text-base sm:text-lg md:text-xl">{article.title}</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 md:p-5 pt-0 flex-1 flex flex-col justify-between">
              <p className="text-muted-foreground mb-4 line-clamp-3">
                {article.summary}
              </p>
              <div className="flex items-center justify-between text-sm text-muted-foreground mt-auto">
                <div className="flex items-center">
                  <CalendarDays className="w-4 h-4 mr-1" />
                  {new Date(article.publishedAt).toLocaleDateString()}
                </div>
                {article.trending && (
                  <div className="flex items-center">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    Trending
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}