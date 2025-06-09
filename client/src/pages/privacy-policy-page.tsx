import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { ChevronRight, Lock } from "lucide-react";
import { Link } from "wouter";

export default function PrivacyPolicyPage() {
  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRight className="h-4 w-4" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbLink>Privacy Policy</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      
      <div className="flex items-center mb-6 gap-3">
        <Lock className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Privacy Policy</h1>
      </div>
      
      <p className="text-muted-foreground mb-8">
        Last updated: April 25, 2025
      </p>
      
      <div className="prose prose-blue dark:prose-invert max-w-none">
        <h2>Introduction</h2>
        <p>
          At Healthmap, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, 
          and safeguard your information when you use our health platform. We follow a privacy-first approach, 
          prioritizing your control over your personal health data.
        </p>
        
        <h2>Information We Collect</h2>
        <p>
          We collect information that you voluntarily provide to us when you:
        </p>
        <ul>
          <li>Register for an account</li>
          <li>Enter health metrics and medical information</li>
          <li>Create health journeys and wellness goals</li>
          <li>Connect with health coaches or family members</li>
          <li>Use features like medication tracking and symptom checking</li>
        </ul>
        
        <p>
          By default, sensitive health information is stored locally on your device unless you explicitly 
          choose to share it with our servers through the Privacy Settings.
        </p>
        
        <h2>Local-First Storage</h2>
        <p>
          Healthmap uses a local-first approach to data storage, meaning:
        </p>
        <ul>
          <li>Your sensitive health data remains on your device by default</li>
          <li>You maintain ownership and control of your health information</li>
          <li>Your data is available even when offline</li>
          <li>You can choose which data to sync with our servers for backup or sharing</li>
        </ul>
        
        <h2>How We Use Your Information</h2>
        <p>
          We use the information we collect to:
        </p>
        <ul>
          <li>Provide, maintain, and improve the Healthmap platform</li>
          <li>Generate personalized health insights and recommendations</li>
          <li>Facilitate connections with healthcare providers and family members (with your consent)</li>
          <li>Analyze usage patterns to improve our services</li>
          <li>Send you important notifications about your health goals and medications</li>
        </ul>
        
        <p>
          We do not use your health data for advertising purposes or sell it to third parties.
        </p>
        
        <h2>Data Sharing</h2>
        <p>
          Healthmap gives you control over how your data is shared:
        </p>
        <ul>
          <li>Health data is only shared with healthcare providers you explicitly authorize</li>
          <li>Family connections only share the information you specifically approve</li>
          <li>You can revoke sharing permissions at any time</li>
          <li>We may share anonymized, aggregated data for research purposes if you opt-in</li>
        </ul>
        
        <h2>Security Measures</h2>
        <p>
          We implement a variety of security measures to maintain the safety of your personal information:
        </p>
        <ul>
          <li>End-to-end encryption for sensitive health data</li>
          <li>HTTPS for all data transmissions</li>
          <li>Regular security audits and vulnerability testing</li>
          <li>Employee training on privacy and security best practices</li>
        </ul>
        
        <h2>Your Privacy Rights</h2>
        <p>
          You have several rights regarding your personal information:
        </p>
        <ul>
          <li>Access and download your data</li>
          <li>Update or correct inaccurate information</li>
          <li>Delete your account and associated data</li>
          <li>Opt-out of certain data collection and processing</li>
          <li>Control your privacy settings through our dedicated Privacy Settings page</li>
        </ul>
        
        <h2>Changes to This Policy</h2>
        <p>
          We may update our Privacy Policy from time to time. We will notify you of any changes by posting 
          the new Privacy Policy on this page and updating the "Last updated" date.
        </p>
        
        <h2>Contact Us</h2>
        <p>
          If you have questions about this Privacy Policy, please contact us at:
        </p>
        <p>
          <strong>Email:</strong> privacy@healthmap.com<br />
          <strong>Address:</strong> 123 Health Street, Wellness City, WC 10101
        </p>
        
        <div className="mt-8 pt-6 border-t border-border">
          <Link 
            href="/settings/privacy" 
            className="inline-flex items-center gap-2 text-primary hover:underline"
          >
            <span>Manage your privacy settings</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}