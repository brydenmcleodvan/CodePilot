import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  FileText,
  DollarSign,
  Shield,
  Download,
  Send,
  Calendar,
  CheckCircle,
  AlertCircle,
  Building2,
  Stethoscope,
  Clock,
  Banknote,
  FileCheck
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

/**
 * Medical Claim Integration Component
 * Exports health data in insurance-compatible formats
 */
export function MedicalClaimIntegration() {
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [selectedExport, setSelectedExport] = useState(null);
  const { toast } = useToast();

  // Fetch export history
  const { data: exportsData, isLoading } = useQuery({
    queryKey: ['/api/medical-claims/exports'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/medical-claims/exports');
      return res.json();
    }
  });

  // Generate claim export mutation
  const generateExportMutation = useMutation({
    mutationFn: async (exportRequest) => {
      const res = await apiRequest('POST', '/api/medical-claims/generate', exportRequest);
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Claim Export Generated!",
        description: `Your ${data.summary.format} export is ready for download. Estimated reimbursement: $${data.estimatedReimbursement.total}`
      });
      setShowExportDialog(false);
      queryClient.invalidateQueries(['/api/medical-claims/exports']);
    },
    onError: (error) => {
      toast({
        title: "Export Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const exports = exportsData?.exports || [];
  const totalPotentialReimbursement = exports.reduce((sum, exp) => sum + (exp.estimatedReimbursement?.total || 0), 0);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center space-x-2">
            <FileText className="h-6 w-6 text-green-600" />
            <span>Medical Claim Integration</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Export your health data in insurance-compatible formats for reimbursement claims
          </p>
        </div>
        
        <Button onClick={() => setShowExportDialog(true)}>
          <FileCheck className="h-4 w-4 mr-2" />
          Generate New Export
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Potential Reimbursement</p>
                <p className="text-2xl font-bold">${totalPotentialReimbursement.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Generated Exports</p>
                <p className="text-2xl font-bold">{exports.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Submitted Claims</p>
                <p className="text-2xl font-bold">
                  {exports.filter(e => e.status === 'submitted').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Compliance Rating</p>
                <p className="text-2xl font-bold">98%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="exports" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="exports">My Exports</TabsTrigger>
          <TabsTrigger value="formats">Supported Formats</TabsTrigger>
          <TabsTrigger value="providers">Insurance Providers</TabsTrigger>
        </TabsList>

        {/* Exports Tab */}
        <TabsContent value="exports">
          <div className="space-y-4">
            {exports.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Exports Yet</h3>
                  <p className="text-gray-600 mb-4">
                    Start by generating your first medical claim export to get reimbursed for your health expenses.
                  </p>
                  <Button onClick={() => setShowExportDialog(true)}>
                    <FileCheck className="h-4 w-4 mr-2" />
                    Create First Export
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {exports.map((exportItem) => (
                  <ExportCard
                    key={exportItem.id}
                    exportItem={exportItem}
                    onDownload={(item) => {
                      // Handle download
                      console.log('Download export:', item);
                    }}
                    onSubmit={(item) => {
                      // Handle insurance submission
                      console.log('Submit to insurance:', item);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Formats Tab */}
        <TabsContent value="formats">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormatCard
              title="FHIR R4"
              description="Fast Healthcare Interoperability Resources - Global standard for health data exchange"
              features={["Real-time data exchange", "JSON/XML formats", "Comprehensive clinical data"]}
              regions={["United States", "Canada", "Europe", "Australia"]}
              compatibility="99%"
            />
            
            <FormatCard
              title="HL7 v2.5"
              description="Health Level Seven - Widely used for clinical data messaging"
              features={["Legacy system support", "Messaging protocols", "Lab and clinical data"]}
              regions={["United States", "Canada"]}
              compatibility="95%"
            />
            
            <FormatCard
              title="X12 EDI"
              description="Electronic Data Interchange for healthcare transactions"
              features={["Claims processing", "Payment transactions", "Healthcare billing"]}
              regions={["United States"]}
              compatibility="98%"
            />
            
            <FormatCard
              title="Canada PHR"
              description="Personal Health Record format compatible with Canadian systems"
              features={["Provincial health systems", "CDA R2 format", "Privacy compliant"]}
              regions={["Canada"]}
              compatibility="97%"
            />
          </div>
        </TabsContent>

        {/* Providers Tab */}
        <TabsContent value="providers">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: "Aetna", formats: ["FHIR R4", "X12 EDI"], processing: "10-14 days", coverage: "High" },
              { name: "Blue Cross Blue Shield", formats: ["FHIR R4", "HL7 v2.5"], processing: "7-10 days", coverage: "High" },
              { name: "UnitedHealth", formats: ["FHIR R4", "X12 EDI"], processing: "5-7 days", coverage: "High" },
              { name: "Cigna", formats: ["FHIR R4", "HL7 v2.5"], processing: "7-14 days", coverage: "Medium" },
              { name: "Humana", formats: ["FHIR R4", "X12 EDI"], processing: "10-14 days", coverage: "Medium" },
              { name: "Ontario Health", formats: ["FHIR R4", "Canada PHR"], processing: "5-7 days", coverage: "High" }
            ].map((provider, index) => (
              <ProviderCard key={index} provider={provider} />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Generate Medical Claim Export</DialogTitle>
          </DialogHeader>
          
          <ExportForm 
            onSubmit={(data) => generateExportMutation.mutate(data)}
            isLoading={generateExportMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

/**
 * Export Card Component
 */
function ExportCard({ exportItem, onDownload, onSubmit }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'generated': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'submitted': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'processing': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'approved': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <Card className="transition-all hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="font-semibold capitalize">{exportItem.claimType?.replace('_', ' ')} Claim</h3>
              <Badge className={getStatusColor(exportItem.status)}>
                {exportItem.status}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
              <div>
                <span className="font-medium">Format:</span>
                <p>{exportItem.format}</p>
              </div>
              <div>
                <span className="font-medium">Data Points:</span>
                <p>{exportItem.dataPoints}</p>
              </div>
              <div>
                <span className="font-medium">Estimated Value:</span>
                <p className="font-semibold text-green-600">
                  ${exportItem.estimatedReimbursement?.total?.toFixed(2) || '0.00'}
                </p>
              </div>
              <div>
                <span className="font-medium">Generated:</span>
                <p>{new Date(exportItem.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            
            {exportItem.insuranceProvider && (
              <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                <Building2 className="h-4 w-4" />
                <span>For: {exportItem.insuranceProvider}</span>
              </div>
            )}
            
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>
                Expires: {new Date(exportItem.expiresAt).toLocaleDateString()}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDownload(exportItem)}
            >
              <Download className="h-4 w-4" />
            </Button>
            {exportItem.status === 'generated' && (
              <Button
                size="sm"
                onClick={() => onSubmit(exportItem)}
              >
                <Send className="h-4 w-4 mr-2" />
                Submit
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Format Card Component
 */
function FormatCard({ title, description, features, regions, compatibility }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{title}</span>
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
            {compatibility} Compatible
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 mb-4">{description}</p>
        
        <div className="space-y-3">
          <div>
            <h4 className="font-medium mb-2">Key Features</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center space-x-2">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Supported Regions</h4>
            <div className="flex flex-wrap gap-1">
              {regions.map((region, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {region}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Provider Card Component
 */
function ProviderCard({ provider }) {
  const getCoverageColor = (coverage) => {
    switch (coverage) {
      case 'High': return 'text-green-600';
      case 'Medium': return 'text-yellow-600';
      case 'Low': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{provider.name}</h3>
            <span className={`text-sm font-medium ${getCoverageColor(provider.coverage)}`}>
              {provider.coverage} Coverage
            </span>
          </div>
          
          <div>
            <p className="text-xs text-gray-600 mb-1">Supported Formats</p>
            <div className="flex flex-wrap gap-1">
              {provider.formats.map((format, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {format}
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Clock className="h-3 w-3" />
            <span>Processing: {provider.processing}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Export Form Component
 */
function ExportForm({ onSubmit, isLoading }) {
  const [formData, setFormData] = useState({
    claimType: '',
    format: '',
    insuranceProvider: '',
    dateRange: {
      start: '',
      end: ''
    },
    includeCategories: []
  });

  const claimTypes = [
    { id: 'preventive_care', name: 'Preventive Care', description: 'Annual checkups, screenings, wellness visits' },
    { id: 'chronic_disease', name: 'Chronic Disease Management', description: 'Diabetes, hypertension, ongoing care' },
    { id: 'mental_health', name: 'Mental Health Services', description: 'Therapy, counseling, psychiatric care' },
    { id: 'diagnostic_tests', name: 'Diagnostic Testing', description: 'Lab work, imaging, specialized tests' }
  ];

  const formats = [
    { id: 'fhir', name: 'FHIR R4', description: 'Modern healthcare standard' },
    { id: 'hl7', name: 'HL7 v2.5', description: 'Traditional clinical messaging' },
    { id: 'x12_edi', name: 'X12 EDI', description: 'US insurance standard' },
    { id: 'canada_phr', name: 'Canada PHR', description: 'Canadian personal health record' }
  ];

  const categories = [
    { id: 'vital_signs', name: 'Vital Signs', description: 'Blood pressure, heart rate, temperature' },
    { id: 'laboratory_results', name: 'Lab Results', description: 'Blood work, diagnostic tests' },
    { id: 'medications', name: 'Medications', description: 'Prescriptions and dosages' },
    { id: 'procedures', name: 'Medical Procedures', description: 'Treatments and interventions' },
    { id: 'diagnoses', name: 'Diagnoses', description: 'Medical conditions and assessments' },
    { id: 'wellness_monitoring', name: 'Wellness Monitoring', description: 'Digital health tracking data' }
  ];

  const toggleCategory = (categoryId) => {
    setFormData(prev => ({
      ...prev,
      includeCategories: prev.includeCategories.includes(categoryId)
        ? prev.includeCategories.filter(id => id !== categoryId)
        : [...prev.includeCategories, categoryId]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.claimType || !formData.format || formData.includeCategories.length === 0) {
      return;
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Claim Type */}
      <div>
        <label className="block text-sm font-medium mb-2">Claim Type</label>
        <Select value={formData.claimType} onValueChange={(value) => 
          setFormData(prev => ({ ...prev, claimType: value }))
        }>
          <SelectTrigger>
            <SelectValue placeholder="Select claim type" />
          </SelectTrigger>
          <SelectContent>
            {claimTypes.map(type => (
              <SelectItem key={type.id} value={type.id}>
                <div>
                  <div className="font-medium">{type.name}</div>
                  <div className="text-xs text-gray-600">{type.description}</div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Format and Provider */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Export Format</label>
          <Select value={formData.format} onValueChange={(value) => 
            setFormData(prev => ({ ...prev, format: value }))
          }>
            <SelectTrigger>
              <SelectValue placeholder="Select format" />
            </SelectTrigger>
            <SelectContent>
              {formats.map(format => (
                <SelectItem key={format.id} value={format.id}>
                  <div>
                    <div className="font-medium">{format.name}</div>
                    <div className="text-xs text-gray-600">{format.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Insurance Provider (Optional)</label>
          <Input
            value={formData.insuranceProvider}
            onChange={(e) => setFormData(prev => ({ ...prev, insuranceProvider: e.target.value }))}
            placeholder="e.g., Aetna, BCBS"
          />
        </div>
      </div>

      {/* Date Range */}
      <div>
        <label className="block text-sm font-medium mb-2">Date Range</label>
        <div className="grid grid-cols-2 gap-4">
          <Input
            type="date"
            value={formData.dateRange.start}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              dateRange: { ...prev.dateRange, start: e.target.value }
            }))}
          />
          <Input
            type="date"
            value={formData.dateRange.end}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              dateRange: { ...prev.dateRange, end: e.target.value }
            }))}
          />
        </div>
      </div>

      {/* Data Categories */}
      <div>
        <label className="block text-sm font-medium mb-2">Data Categories to Include</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {categories.map(category => (
            <div key={category.id} className="flex items-start space-x-3 p-3 border rounded-lg">
              <Checkbox
                checked={formData.includeCategories.includes(category.id)}
                onCheckedChange={() => toggleCategory(category.id)}
              />
              <div className="flex-1">
                <h4 className="font-medium text-sm">{category.name}</h4>
                <p className="text-xs text-gray-600">{category.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <Button 
        type="submit" 
        className="w-full" 
        disabled={isLoading || formData.includeCategories.length === 0}
      >
        {isLoading ? (
          <>
            <Clock className="h-4 w-4 mr-2 animate-spin" />
            Generating Export...
          </>
        ) : (
          <>
            <FileCheck className="h-4 w-4 mr-2" />
            Generate Claim Export
          </>
        )}
      </Button>
    </form>
  );
}

export default MedicalClaimIntegration;