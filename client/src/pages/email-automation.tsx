import { motion } from "framer-motion";
import { Mail, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import EmailAutomationPanel from "@/components/email-automation-panel";

export default function EmailAutomationPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <Link href="/summary">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Summary
              </Button>
            </Link>
            <div className="flex items-center space-x-2 text-blue-600">
              <Mail className="h-6 w-6" />
              <span className="text-sm font-medium">Healthmap Email System</span>
            </div>
          </div>
          
          <div className="text-center space-y-4">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl font-bold text-gray-900"
            >
              Weekly Email Automation
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-gray-600 max-w-2xl mx-auto"
            >
              Automatically deliver comprehensive health intelligence reports to your users every week. 
              Each report includes health scores, risk assessments, clinical insights, and personalized recommendations.
            </motion.p>
          </div>
        </motion.div>

        {/* Email Automation Panel */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <EmailAutomationPanel />
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center text-sm text-gray-500"
        >
          <p>
            Powered by Healthmap's medical-grade health intelligence engines
          </p>
        </motion.div>
      </div>
    </div>
  );
}