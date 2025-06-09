import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// This would need a real API implementation on the server side
// to handle communication with Stripe's payment API
// using the STRIPE_SECRET_KEY environment variable

interface TipJarProps {
  minimal?: boolean;
  className?: string;
}

const tipOptions = [
  { amount: 5, label: "$5", description: "Buy us a coffee" },
  { amount: 10, label: "$10", description: "Support development" },
  { amount: 25, label: "$25", description: "Contribute significantly" },
  { amount: 50, label: "$50", description: "Become a platform patron" },
];

export function TipJar({ minimal = false, className = "" }: TipJarProps) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!selectedAmount) {
      toast({
        title: "Please select an amount",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // This would need to call your actual API endpoint that handles Stripe payments
      const response = await apiRequest("POST", "/api/tip-jar/create-checkout", {
        amount: selectedAmount,
      });

      if (response.ok) {
        const { url } = await response.json();
        // Redirect to Stripe checkout
        window.location.href = url;
      } else {
        throw new Error("Payment initiation failed");
      }
    } catch (error) {
      toast({
        title: "Payment Error",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (minimal) {
    // Minimal version for the footer
    return (
      <div className={`rounded-lg overflow-hidden ${className}`}>
        <button 
          onClick={() => setIsExpanded(!isExpanded)} 
          className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors p-3"
        >
          <i className="ri-heart-fill text-rose-500"></i>
          <span className="font-medium">Support Us</span>
        </button>
        
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="p-3 pt-0"
          >
            <div className="grid grid-cols-2 gap-2 mb-2">
              {tipOptions.map((option) => (
                <button
                  key={option.amount}
                  onClick={() => setSelectedAmount(option.amount)}
                  className={`px-3 py-2 text-sm rounded-md transition-colors ${
                    selectedAmount === option.amount
                      ? "bg-primary/20 text-primary-50 border border-primary-500/30"
                      : "bg-gray-700/50 text-gray-300 hover:bg-gray-700 border border-gray-700"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <Button 
              onClick={handleSubmit}
              disabled={!selectedAmount || isProcessing}
              className="w-full text-sm h-8"
              variant="secondary"
            >
              {isProcessing ? (
                <>
                  <i className="ri-loader-2-line animate-spin mr-1"></i>
                  Processing...
                </>
              ) : (
                <>Contribute</>
              )}
            </Button>
          </motion.div>
        )}
      </div>
    );
  }

  // Full featured version
  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 pb-4 dark:from-primary/20 dark:to-primary/10">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold text-primary dark:text-primary-400">Support Healthmap</CardTitle>
            <CardDescription>Help us continue building great health tools</CardDescription>
          </div>
          <div className="bg-primary/20 dark:bg-primary/30 rounded-full p-2 text-primary dark:text-primary-400">
            <i className="ri-heart-fill text-2xl"></i>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Your support helps us improve Healthmap and keep it accessible to everyone. Choose an amount:
        </p>
        <div className="grid grid-cols-2 gap-3">
          {tipOptions.map((option) => (
            <button
              key={option.amount}
              onClick={() => setSelectedAmount(option.amount)}
              className={`px-4 py-3 rounded-md text-left transition-all ${
                selectedAmount === option.amount
                  ? "bg-primary/10 border-primary/30 dark:bg-primary/20 border dark:border-primary/40 shadow-sm"
                  : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
              }`}
            >
              <div className="font-medium dark:text-white">{option.label}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{option.description}</div>
            </button>
          ))}
        </div>
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
          Powered by Stripe. All transactions are secure.
        </div>
      </CardContent>
      <CardFooter className="flex justify-end pt-0">
        <Button
          onClick={handleSubmit}
          disabled={!selectedAmount || isProcessing}
          className="w-full"
          variant="default"
        >
          {isProcessing ? (
            <>
              <i className="ri-loader-2-line animate-spin mr-2"></i>
              Processing...
            </>
          ) : (
            <>Support with {selectedAmount ? `$${selectedAmount}` : "a tip"}</>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}