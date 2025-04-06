import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function ConnectHealthDataButton() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const handleClick = () => {
    // Show toast notification
    toast({
      title: "Redirecting to Health Shop",
      description: "Discover products tailored to your health needs",
    });
    
    // Navigate to the shop page
    navigate("/shop");
  };

  return (
    <Button 
      onClick={handleClick}
      className="bg-primary hover:bg-primary/90 text-white"
    >
      <i className="ri-heart-pulse-line mr-2"></i>
      Connect Health Data
    </Button>
  );
}