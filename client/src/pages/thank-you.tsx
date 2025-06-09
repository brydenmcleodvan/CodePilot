import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";

export default function ThankYouPage() {
  const [location, setLocation] = useLocation();
  const [sessionData, setSessionData] = useState<{
    status: string;
    customer_email?: string;
    amount_total?: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Extract session_id from the URL
    const searchParams = new URLSearchParams(window.location.search);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      setLoading(false);
      setError("No session ID found. Please try again.");
      return;
    }

    const fetchSessionData = async () => {
      try {
        const response = await apiRequest(
          "GET", 
          `/api/tip-jar/session-status?session_id=${sessionId}`
        );
        
        if (response.ok) {
          const data = await response.json();
          setSessionData(data);
        } else {
          throw new Error("Failed to fetch session data");
        }
      } catch (error) {
        console.error("Error fetching session data:", error);
        setError("Unable to verify your payment. Please contact support if the amount was charged.");
      } finally {
        setLoading(false);
      }
    };

    fetchSessionData();
  }, []);

  // Format currency amount
  const formatAmount = (amount?: number) => {
    if (!amount) return "$0.00";
    return `$${(amount / 100).toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="container max-w-xl mx-auto px-4 py-24 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 dark:text-gray-400">Verifying your payment...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-xl mx-auto px-4 py-16">
        <Card className="bg-white dark:bg-gray-800 shadow-lg">
          <CardHeader className="bg-red-50 dark:bg-red-900/20 border-b border-red-100 dark:border-red-900/30">
            <CardTitle className="text-red-600 dark:text-red-400 flex items-center gap-2">
              <i className="ri-error-warning-line"></i>
              Payment Verification Failed
            </CardTitle>
            <CardDescription className="text-red-600/70 dark:text-red-400/70">
              We couldn't verify your payment details
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {error}
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              If you believe this is an error and your payment was processed, please contact our support team.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-gray-100 dark:border-gray-700 pt-4">
            <Button onClick={() => setLocation("/")} className="mr-2">
              Return Home
            </Button>
            <Button variant="outline">
              Contact Support
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-xl mx-auto px-4 py-16">
      <Card className="bg-white dark:bg-gray-800 shadow-lg">
        <CardHeader className="bg-green-50 dark:bg-green-900/20 border-b border-green-100 dark:border-green-900/30">
          <CardTitle className="text-green-600 dark:text-green-400 flex items-center gap-2">
            <i className="ri-checkbox-circle-line"></i>
            Thank You for Your Support!
          </CardTitle>
          <CardDescription className="text-green-600/70 dark:text-green-400/70">
            Your payment was successful
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
              <i className="ri-heart-fill text-green-500 dark:text-green-400 text-3xl"></i>
            </div>
            <h3 className="text-xl font-semibold mb-1 dark:text-white">Payment Confirmed</h3>
            {sessionData?.amount_total && (
              <p className="text-2xl font-bold text-primary dark:text-primary-400 mb-2">
                {formatAmount(sessionData.amount_total)}
              </p>
            )}
            <p className="text-gray-600 dark:text-gray-400 text-center">
              Your generous contribution helps us continue to improve Healthmap and provide better health tools for everyone.
            </p>
          </div>

          {sessionData?.customer_email && (
            <div className="bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                A receipt has been sent to <span className="font-medium">{sessionData.customer_email}</span>
              </p>
            </div>
          )}

          <div className="text-center">
            <p className="text-gray-700 dark:text-gray-300 font-medium mb-1">What happens next?</p>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              Your contribution will go directly toward developing new features and improving existing ones.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-gray-100 dark:border-gray-700 pt-4">
          <Button onClick={() => setLocation("/")} className="mr-2">
            Return to Home
          </Button>
          <Button variant="outline" onClick={() => setLocation("/profile")}>
            View Profile
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}