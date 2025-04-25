import { PrivacySettings } from "@/components/privacy/privacy-settings";
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { ChevronRight, Shield } from "lucide-react";
import { Link } from "wouter";

export default function PrivacySettingsPage() {
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
              <BreadcrumbLink asChild>
                <Link href="/profile">Profile</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRight className="h-4 w-4" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbLink>Privacy Settings</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      
      <div className="flex items-center mb-6 gap-3">
        <Shield className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Privacy Settings</h1>
      </div>
      
      <p className="text-muted-foreground mb-8">
        Healthmap is built with privacy at its core. These settings let you control how your data is collected, stored, and shared.
        By default, we take a privacy-first approach, keeping your sensitive health data on your device unless you choose to share it.
      </p>
      
      <div className="mb-8">
        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-start gap-3">
          <div className="text-blue-600 dark:text-blue-400 mt-1">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-medium text-blue-800 dark:text-blue-300">Privacy First Approach</h3>
            <p className="text-blue-700 dark:text-blue-400 text-sm mt-1">
              Your health data is valuable and sensitive. We prioritize your privacy by keeping data on your device by default.
              You can change these settings at any time, but we recommend the privacy-focused defaults for most users.
            </p>
          </div>
        </div>
      </div>
      
      <PrivacySettings />
      
      <div className="mt-10 text-sm text-center text-muted-foreground">
        <p className="mb-2">
          Want to learn more about how we handle your data?
        </p>
        <Link href="/privacy-policy" className="text-primary hover:underline">
          Read our Privacy Policy
        </Link>
      </div>
    </div>
  );
}