import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Available donation amounts
const DONATION_AMOUNTS = [5, 10, 20, 50];

// Payment methods
type PaymentMethod = "stripe" | "buymeacoffee";

interface TipJarProps {
  minimal?: boolean; // If true, display a more compact version
  className?: string;
}

export function TipJar({ minimal = false, className = "" }: TipJarProps) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("stripe");
  const { toast } = useToast();

  // Handle donation button click
  const handleDonate = () => {
    const amount = selectedAmount || (customAmount ? parseFloat(customAmount) : 0);
    
    if (!amount || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please select or enter a valid donation amount.",
        variant: "destructive",
      });
      return;
    }

    // This would integrate with Stripe or Buy Me A Coffee in production
    toast({
      title: "Thank You!",
      description: `Your $${amount.toFixed(2)} donation would be processed via ${paymentMethod === "stripe" ? "Stripe" : "Buy Me A Coffee"} in production.`,
    });
  };

  // Minimal version (for footer, sidebar, etc.)
  if (minimal) {
    return (
      <div className={`rounded-lg p-4 ${className}`}>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="bg-white dark:bg-gray-800"
            onClick={() => {
              toast({
                title: "Support Us",
                description: "This would open the donation modal in production.",
              });
            }}
          >
            <i className="ri-heart-line mr-2 text-red-500"></i>
            Support Us
          </Button>
          
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Help us improve Healthfolio
          </span>
        </div>
      </div>
    );
  }

  // Full version with donation options
  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardContent className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 mb-4">
            <i className="ri-heart-fill text-2xl" aria-hidden="true"></i>
          </div>
          <h3 className="text-xl font-semibold mb-2">Support Healthfolio</h3>
          <p className="text-gray-600 dark:text-gray-300 max-w-sm mx-auto">
            Your contribution helps us develop new features and maintain the platform.
          </p>
        </div>

        <Tabs defaultValue="amount" className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="amount">Amount</TabsTrigger>
            <TabsTrigger value="payment">Payment Method</TabsTrigger>
          </TabsList>
          
          <TabsContent value="amount" className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Select an amount:
              </Label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {DONATION_AMOUNTS.map((amount) => (
                  <Button
                    key={amount}
                    variant={selectedAmount === amount ? "default" : "outline"}
                    className={selectedAmount === amount ? "" : "bg-white dark:bg-gray-800"}
                    onClick={() => {
                      setSelectedAmount(amount);
                      setCustomAmount("");
                    }}
                  >
                    ${amount}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="custom-amount" className="text-sm font-medium mb-2 block">
                Or enter a custom amount:
              </Label>
              <div className="flex items-center">
                <span className="bg-gray-100 dark:bg-gray-700 px-3 py-2 border border-r-0 border-gray-300 dark:border-gray-600 rounded-l-md">
                  $
                </span>
                <Input
                  id="custom-amount"
                  type="number"
                  min="1"
                  step="0.01"
                  placeholder="Enter amount"
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                    setSelectedAmount(null);
                  }}
                  className="rounded-l-none"
                />
              </div>
            </div>

            <Button 
              className="w-full"
              onClick={() => {
                const el = document.querySelector('[data-value="payment"]') as HTMLElement;
                if (el) el.click();
              }}
            >
              Continue to Payment
            </Button>
          </TabsContent>
          
          <TabsContent value="payment" className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Choose a payment method:
              </Label>
              <div className="space-y-2">
                <div 
                  className={`flex items-center p-3 border rounded-md cursor-pointer ${
                    paymentMethod === "stripe" 
                      ? "border-primary bg-primary/5" 
                      : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                  }`}
                  onClick={() => setPaymentMethod("stripe")}
                >
                  <input 
                    type="radio" 
                    name="payment-method" 
                    checked={paymentMethod === "stripe"} 
                    onChange={() => setPaymentMethod("stripe")}
                    className="mr-3"
                  />
                  <div className="flex items-center">
                    <i className="ri-bank-card-line text-xl mr-2 text-primary"></i>
                    <div>
                      <p className="font-medium">Credit Card</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Secure payment via Stripe
                      </p>
                    </div>
                  </div>
                </div>

                <div 
                  className={`flex items-center p-3 border rounded-md cursor-pointer ${
                    paymentMethod === "buymeacoffee" 
                      ? "border-primary bg-primary/5" 
                      : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                  }`}
                  onClick={() => setPaymentMethod("buymeacoffee")}
                >
                  <input 
                    type="radio" 
                    name="payment-method" 
                    checked={paymentMethod === "buymeacoffee"} 
                    onChange={() => setPaymentMethod("buymeacoffee")}
                    className="mr-3"
                  />
                  <div className="flex items-center">
                    <i className="ri-cup-line text-xl mr-2 text-yellow-500"></i>
                    <div>
                      <p className="font-medium">Buy Me A Coffee</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Simple and fun way to support us
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
              <div className="flex justify-between mb-1">
                <span className="text-gray-600 dark:text-gray-300">Donation amount:</span>
                <span className="font-medium">
                  ${selectedAmount || (customAmount ? parseFloat(customAmount).toFixed(2) : "0.00")}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => {
                  const el = document.querySelector('[data-value="amount"]') as HTMLElement;
                  if (el) el.click();
                }}
              >
                Back
              </Button>
              <Button 
                className="flex-1"
                onClick={handleDonate}
              >
                Donate Now
              </Button>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="text-center mt-4 text-xs text-gray-500 dark:text-gray-400">
          All transactions are secure and encrypted.
          <br />Your generous support is greatly appreciated!
        </div>
      </CardContent>
    </Card>
  );
}