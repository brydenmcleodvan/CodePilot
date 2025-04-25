import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { ChevronRight, Shield } from "lucide-react";
import { Link } from "wouter";
import { PrivacySettings } from "@/components/privacy/privacy-settings";

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
                <Link href="/settings">Settings</Link>
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
      
      <div className="mb-8">
        <div className="flex items-center mb-4 gap-3">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Privacy Settings</h1>
        </div>
        
        <p className="text-muted-foreground max-w-3xl">
          Control how your data is collected, stored, and used. Healthmap follows a privacy-first
          approach, keeping your sensitive health data on your device by default. You can customize
          these settings at any time.
        </p>
      </div>
      
      <PrivacySettings />
      
      <div className="mt-10 pt-6 border-t border-border flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          For more details on how we handle your data, please see our <Link href="/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
}