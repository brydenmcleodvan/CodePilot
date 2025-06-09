import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { 
  Building2, 
  Users, 
  Palette, 
  Globe, 
  Code, 
  Shield,
  Zap,
  TrendingUp,
  CheckCircle,
  Star,
  Mail,
  Phone,
  Calendar,
  Download,
  Settings,
  Database,
  Award,
  Heart,
  Dumbbell,
  Stethoscope
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface LicensingPlan {
  id: string;
  name: string;
  description: string;
  targetAudience: string[];
  monthlyPrice: number;
  setupFee: number;
  features: string[];
  customization: {
    branding: boolean;
    domain: boolean;
    apiAccess: boolean;
    dataExport: boolean;
    whiteLabel: boolean;
  };
  support: string;
  userLimits: {
    min: number;
    max: number;
  };
  popular?: boolean;
}

interface B2BInquiry {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  companyType: string;
  userCount: number;
  specificNeeds: string;
  timeline: string;
}

export default function B2BLicensingPage() {
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [inquiryForm, setInquiryForm] = useState<B2BInquiry>({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    companyType: "",
    userCount: 0,
    specificNeeds: "",
    timeline: ""
  });

  // Fetch licensing plans
  const { data: licensingPlans = [], isLoading } = useQuery<LicensingPlan[]>({
    queryKey: ['/api/b2b/licensing-plans'],
    queryFn: async () => {
      // This would connect to your pricing/licensing API
      return [
        {
          id: 'clinic-starter',
          name: 'Clinic Starter',
          description: 'Perfect for small medical practices and wellness clinics',
          targetAudience: ['Medical Clinics', 'Wellness Centers', 'Therapy Practices'],
          monthlyPrice: 299,
          setupFee: 499,
          features: [
            'Patient health tracking',
            'Appointment integration',
            'Clinical reporting',
            'HIPAA compliance',
            'Basic branding',
            'Email support'
          ],
          customization: {
            branding: true,
            domain: false,
            apiAccess: false,
            dataExport: true,
            whiteLabel: false
          },
          support: 'Email & Phone',
          userLimits: { min: 10, max: 100 }
        },
        {
          id: 'enterprise-health',
          name: 'Enterprise Health',
          description: 'Comprehensive solution for hospitals and large healthcare systems',
          targetAudience: ['Hospitals', 'Health Systems', 'Large Clinics'],
          monthlyPrice: 999,
          setupFee: 2499,
          features: [
            'Full platform access',
            'Custom integrations',
            'Advanced analytics',
            'Multi-location support',
            'Complete white-labeling',
            'Dedicated support team',
            'API access',
            'Custom reporting'
          ],
          customization: {
            branding: true,
            domain: true,
            apiAccess: true,
            dataExport: true,
            whiteLabel: true
          },
          support: 'Dedicated Account Manager',
          userLimits: { min: 100, max: 10000 },
          popular: true
        },
        {
          id: 'fitness-pro',
          name: 'Fitness Pro',
          description: 'Tailored for gyms, fitness chains, and personal trainers',
          targetAudience: ['Gyms', 'Fitness Centers', 'Personal Trainers'],
          monthlyPrice: 199,
          setupFee: 299,
          features: [
            'Member health tracking',
            'Workout integration',
            'Progress monitoring',
            'Community features',
            'Branded mobile app',
            'Coach dashboard'
          ],
          customization: {
            branding: true,
            domain: true,
            apiAccess: false,
            dataExport: true,
            whiteLabel: true
          },
          support: 'Email & Chat',
          userLimits: { min: 25, max: 1000 }
        },
        {
          id: 'insurance-wellness',
          name: 'Insurance Wellness',
          description: 'Population health management for insurance providers',
          targetAudience: ['Insurance Companies', 'Employers', 'Benefits Providers'],
          monthlyPrice: 1499,
          setupFee: 4999,
          features: [
            'Population analytics',
            'Risk assessment',
            'Wellness program management',
            'Claims integration',
            'Incentive tracking',
            'Regulatory reporting',
            'Advanced AI insights'
          ],
          customization: {
            branding: true,
            domain: true,
            apiAccess: true,
            dataExport: true,
            whiteLabel: true
          },
          support: 'White-glove Service',
          userLimits: { min: 1000, max: 100000 }
        }
      ];
    }
  });

  // Submit inquiry mutation
  const submitInquiryMutation = useMutation({
    mutationFn: async (inquiry: B2BInquiry & { planId: string }) => {
      const res = await apiRequest('POST', '/api/b2b/inquiry', inquiry);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Inquiry Submitted!",
        description: "Our B2B team will contact you within 24 hours to discuss your needs.",
      });
      setInquiryForm({
        companyName: "",
        contactName: "",
        email: "",
        phone: "",
        companyType: "",
        userCount: 0,
        specificNeeds: "",
        timeline: ""
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit inquiry. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) {
      toast({
        title: "Please select a plan",
        description: "Choose a licensing plan that fits your needs.",
        variant: "destructive",
      });
      return;
    }
    
    submitInquiryMutation.mutate({
      ...inquiryForm,
      planId: selectedPlan
    });
  };

  const getCompanyTypeIcon = (type: string) => {
    const icons = {
      'Medical Clinics': Stethoscope,
      'Hospitals': Building2,
      'Gyms': Dumbbell,
      'Fitness Centers': Dumbbell,
      'Insurance Companies': Shield,
      'Wellness Centers': Heart
    };
    return icons[type] || Building2;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-3">Loading licensing options...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            White-Label Health Platform
          </h1>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto">
            License Healthmap's comprehensive health platform for your organization. 
            Complete branding, custom deployment, and API access to serve your clients 
            with cutting-edge health technology.
          </p>
        </motion.div>

        <Tabs defaultValue="plans" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="plans">Licensing Plans</TabsTrigger>
            <TabsTrigger value="features">Platform Features</TabsTrigger>
            <TabsTrigger value="inquiry">Get Started</TabsTrigger>
          </TabsList>

          {/* Licensing Plans */}
          <TabsContent value="plans" className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {licensingPlans.map((plan, index) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <Card 
                    className={`h-full cursor-pointer transition-all ${
                      selectedPlan === plan.id 
                        ? 'ring-2 ring-blue-500 bg-blue-50' 
                        : 'hover:shadow-lg'
                    } ${plan.popular ? 'ring-2 ring-purple-500' : ''}`}
                    onClick={() => setSelectedPlan(plan.id)}
                  >
                    <CardHeader className="relative">
                      {plan.popular && (
                        <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-purple-600">
                          Most Popular
                        </Badge>
                      )}
                      <CardTitle className="text-xl">{plan.name}</CardTitle>
                      <CardDescription>{plan.description}</CardDescription>
                      <div className="mt-4">
                        <div className="text-3xl font-bold text-blue-600">
                          ${plan.monthlyPrice}
                          <span className="text-sm font-normal text-gray-600">/month</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          Setup fee: ${plan.setupFee}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Target Audience */}
                      <div>
                        <h4 className="font-medium text-sm mb-2">Perfect For:</h4>
                        <div className="space-y-1">
                          {plan.targetAudience.map((audience) => {
                            const Icon = getCompanyTypeIcon(audience);
                            return (
                              <div key={audience} className="flex items-center space-x-2 text-sm">
                                <Icon className="h-3 w-3 text-blue-600" />
                                <span>{audience}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Features */}
                      <div>
                        <h4 className="font-medium text-sm mb-2">Features:</h4>
                        <div className="space-y-1">
                          {plan.features.slice(0, 4).map((feature) => (
                            <div key={feature} className="flex items-center space-x-2 text-sm">
                              <CheckCircle className="h-3 w-3 text-green-600" />
                              <span>{feature}</span>
                            </div>
                          ))}
                          {plan.features.length > 4 && (
                            <div className="text-xs text-gray-500">
                              +{plan.features.length - 4} more features
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Customization Options */}
                      <div>
                        <h4 className="font-medium text-sm mb-2">Customization:</h4>
                        <div className="grid grid-cols-2 gap-1 text-xs">
                          <div className={`flex items-center space-x-1 ${plan.customization.branding ? 'text-green-600' : 'text-gray-400'}`}>
                            {plan.customization.branding ? <CheckCircle className="h-3 w-3" /> : <div className="h-3 w-3" />}
                            <span>Branding</span>
                          </div>
                          <div className={`flex items-center space-x-1 ${plan.customization.whiteLabel ? 'text-green-600' : 'text-gray-400'}`}>
                            {plan.customization.whiteLabel ? <CheckCircle className="h-3 w-3" /> : <div className="h-3 w-3" />}
                            <span>White Label</span>
                          </div>
                          <div className={`flex items-center space-x-1 ${plan.customization.domain ? 'text-green-600' : 'text-gray-400'}`}>
                            {plan.customization.domain ? <CheckCircle className="h-3 w-3" /> : <div className="h-3 w-3" />}
                            <span>Custom Domain</span>
                          </div>
                          <div className={`flex items-center space-x-1 ${plan.customization.apiAccess ? 'text-green-600' : 'text-gray-400'}`}>
                            {plan.customization.apiAccess ? <CheckCircle className="h-3 w-3" /> : <div className="h-3 w-3" />}
                            <span>API Access</span>
                          </div>
                        </div>
                      </div>

                      {/* User Limits */}
                      <div className="pt-2 border-t">
                        <div className="text-xs text-gray-600">
                          <div>Users: {plan.userLimits.min} - {plan.userLimits.max.toLocaleString()}</div>
                          <div>Support: {plan.support}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            {/* Enterprise Custom */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                <CardContent className="p-8 text-center">
                  <h3 className="text-2xl font-bold mb-4">Enterprise Custom Solutions</h3>
                  <p className="text-lg mb-6 opacity-90">
                    Need something unique? We create fully custom health platforms tailored to your 
                    specific requirements, compliance needs, and integration preferences.
                  </p>
                  <Button variant="secondary" size="lg">
                    <Mail className="h-4 w-4 mr-2" />
                    Contact Enterprise Sales
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Platform Features */}
          <TabsContent value="features" className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {[
                {
                  icon: Palette,
                  title: "Complete Branding",
                  description: "Your logo, colors, fonts, and messaging throughout the entire platform"
                },
                {
                  icon: Globe,
                  title: "Custom Domains",
                  description: "Host on your domain with SSL certificates and professional appearance"
                },
                {
                  icon: Code,
                  title: "API Integration",
                  description: "Connect with existing systems, EMRs, and third-party health devices"
                },
                {
                  icon: Shield,
                  title: "Compliance Ready",
                  description: "HIPAA, GDPR, SOC 2 compliant with audit trails and security controls"
                },
                {
                  icon: Database,
                  title: "Data Ownership",
                  description: "Your client data stays yours with export capabilities and data portability"
                },
                {
                  icon: Settings,
                  title: "Admin Controls",
                  description: "Full administrative access to configure features and manage users"
                },
                {
                  icon: TrendingUp,
                  title: "Analytics Dashboard",
                  description: "Advanced reporting and analytics tailored to your business metrics"
                },
                {
                  icon: Users,
                  title: "Multi-User Support",
                  description: "Role-based access for staff, providers, and administrators"
                },
                {
                  icon: Zap,
                  title: "Quick Deployment",
                  description: "Get up and running in weeks, not months, with our proven implementation process"
                }
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="h-full">
                    <CardContent className="p-6">
                      <feature.icon className="h-8 w-8 text-blue-600 mb-4" />
                      <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                      <p className="text-gray-600">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </TabsContent>

          {/* Get Started */}
          <TabsContent value="inquiry">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Start Your White-Label Journey</CardTitle>
                  <CardDescription>
                    Tell us about your organization and we'll create a custom proposal
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleInquirySubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Company Name</label>
                        <Input
                          value={inquiryForm.companyName}
                          onChange={(e) => setInquiryForm(prev => ({ ...prev, companyName: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Contact Name</label>
                        <Input
                          value={inquiryForm.contactName}
                          onChange={(e) => setInquiryForm(prev => ({ ...prev, contactName: e.target.value }))}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Email</label>
                        <Input
                          type="email"
                          value={inquiryForm.email}
                          onChange={(e) => setInquiryForm(prev => ({ ...prev, email: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Phone</label>
                        <Input
                          value={inquiryForm.phone}
                          onChange={(e) => setInquiryForm(prev => ({ ...prev, phone: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Organization Type</label>
                        <Select 
                          value={inquiryForm.companyType} 
                          onValueChange={(value) => setInquiryForm(prev => ({ ...prev, companyType: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="clinic">Medical Clinic</SelectItem>
                            <SelectItem value="hospital">Hospital/Health System</SelectItem>
                            <SelectItem value="gym">Gym/Fitness Center</SelectItem>
                            <SelectItem value="insurance">Insurance Provider</SelectItem>
                            <SelectItem value="wellness">Wellness Center</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Expected Users</label>
                        <Input
                          type="number"
                          value={inquiryForm.userCount || ""}
                          onChange={(e) => setInquiryForm(prev => ({ ...prev, userCount: parseInt(e.target.value) || 0 }))}
                          placeholder="Number of users"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Timeline</label>
                      <Select 
                        value={inquiryForm.timeline} 
                        onValueChange={(value) => setInquiryForm(prev => ({ ...prev, timeline: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Implementation timeline" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="asap">ASAP</SelectItem>
                          <SelectItem value="1-3months">1-3 months</SelectItem>
                          <SelectItem value="3-6months">3-6 months</SelectItem>
                          <SelectItem value="6-12months">6-12 months</SelectItem>
                          <SelectItem value="exploring">Just exploring</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Specific Needs & Requirements</label>
                      <Textarea
                        value={inquiryForm.specificNeeds}
                        onChange={(e) => setInquiryForm(prev => ({ ...prev, specificNeeds: e.target.value }))}
                        placeholder="Tell us about any specific features, integrations, or compliance requirements..."
                        rows={4}
                      />
                    </div>

                    {selectedPlan && (
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <CheckCircle className="h-4 w-4 text-blue-600" />
                          <span className="font-medium">Selected Plan: {licensingPlans.find(p => p.id === selectedPlan)?.name}</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          We'll create a custom proposal based on this plan and your specific needs.
                        </p>
                      </div>
                    )}

                    <Button 
                      type="submit" 
                      size="lg" 
                      className="w-full"
                      disabled={submitInquiryMutation.isPending}
                    >
                      {submitInquiryMutation.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Mail className="h-4 w-4 mr-2" />
                          Get Custom Proposal
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 text-center text-sm text-gray-600"
        >
          <p>
            Join leading healthcare organizations, fitness chains, and insurance providers 
            who trust Healthmap to power their digital health initiatives.
          </p>
        </motion.div>
      </div>
    </div>
  );
}