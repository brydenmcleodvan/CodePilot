import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Users,
  Shield,
  Plus,
  Mail,
  Eye,
  Edit3,
  Trash2,
  Heart,
  AlertTriangle,
  Clock,
  Settings,
  UserPlus,
  CheckCircle,
  XCircle,
  Bell,
  Lock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

/**
 * Family & Caregiver Sharing Component
 * Manages secure health data sharing with granular permissions
 */
export function FamilyCaregiverSharing() {
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState(null);
  const [showPermissionsDialog, setShowPermissionsDialog] = useState(false);
  const { toast } = useToast();

  // Fetch sharing connections
  const { data: connectionsData, isLoading } = useQuery({
    queryKey: ['/api/family-sharing/connections'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/family-sharing/connections');
      return res.json();
    }
  });

  // Send invitation mutation
  const sendInviteMutation = useMutation({
    mutationFn: async (inviteData) => {
      const res = await apiRequest('POST', '/api/family-sharing/invite', inviteData);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Invitation Sent!",
        description: "Your family member will receive an email invitation to access your health data."
      });
      setShowInviteDialog(false);
      queryClient.invalidateQueries(['/api/family-sharing/connections']);
    },
    onError: (error) => {
      toast({
        title: "Failed to Send Invitation",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Update permissions mutation
  const updatePermissionsMutation = useMutation({
    mutationFn: async ({ connectionId, updates }) => {
      const res = await apiRequest('PUT', `/api/family-sharing/permissions/${connectionId}`, updates);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Permissions Updated",
        description: "Sharing permissions have been successfully updated."
      });
      setShowPermissionsDialog(false);
      queryClient.invalidateQueries(['/api/family-sharing/connections']);
    }
  });

  // Revoke access mutation
  const revokeAccessMutation = useMutation({
    mutationFn: async ({ connectionId, reason }) => {
      const res = await apiRequest('DELETE', `/api/family-sharing/connections/${connectionId}`, { reason });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Access Revoked",
        description: "Sharing access has been successfully revoked."
      });
      queryClient.invalidateQueries(['/api/family-sharing/connections']);
    }
  });

  const connections = connectionsData?.connections || [];
  const ownedConnections = connections.filter(c => c.role === 'owner');
  const sharedConnections = connections.filter(c => c.role === 'shared_with');

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
            <Users className="h-6 w-6 text-blue-600" />
            <span>Family & Caregiver Sharing</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Securely share your health data with family members and caregivers
          </p>
        </div>
        
        <Button onClick={() => setShowInviteDialog(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Invite Family Member
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Active Connections</p>
                <p className="text-2xl font-bold">
                  {connections.filter(c => c.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Emergency Contacts</p>
                <p className="text-2xl font-bold">
                  {connections.filter(c => c.emergencyContact).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Eye className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Data Categories Shared</p>
                <p className="text-2xl font-bold">
                  {Array.from(new Set(ownedConnections.flatMap(c => c.sharedCategories))).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="sharing" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sharing">My Sharing</TabsTrigger>
          <TabsTrigger value="access">My Access</TabsTrigger>
        </TabsList>

        {/* My Sharing Tab */}
        <TabsContent value="sharing">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">People I'm Sharing With</h3>
            
            {ownedConnections.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Family Connections Yet</h3>
                  <p className="text-gray-600 mb-4">
                    Start by inviting family members or caregivers to access your health data.
                  </p>
                  <Button onClick={() => setShowInviteDialog(true)}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Send First Invitation
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {ownedConnections.map((connection) => (
                  <ConnectionCard
                    key={connection.id}
                    connection={connection}
                    isOwner={true}
                    onEditPermissions={(conn) => {
                      setSelectedConnection(conn);
                      setShowPermissionsDialog(true);
                    }}
                    onRevokeAccess={(conn) => {
                      revokeAccessMutation.mutate({
                        connectionId: conn.id,
                        reason: 'Access revoked by data owner'
                      });
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* My Access Tab */}
        <TabsContent value="access">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Health Data I Can Access</h3>
            
            {sharedConnections.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Shared Access</h3>
                  <p className="text-gray-600">
                    You haven't been granted access to anyone's health data yet.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {sharedConnections.map((connection) => (
                  <ConnectionCard
                    key={connection.id}
                    connection={connection}
                    isOwner={false}
                    onViewData={(conn) => {
                      // Navigate to shared data view
                      console.log('View shared data for:', conn);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Invite Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Invite Family Member or Caregiver</DialogTitle>
          </DialogHeader>
          
          <InviteForm 
            onSubmit={(data) => sendInviteMutation.mutate(data)}
            isLoading={sendInviteMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Permissions Dialog */}
      <Dialog open={showPermissionsDialog} onOpenChange={setShowPermissionsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Sharing Permissions</DialogTitle>
          </DialogHeader>
          
          {selectedConnection && (
            <PermissionsForm 
              connection={selectedConnection}
              onSubmit={(updates) => {
                updatePermissionsMutation.mutate({
                  connectionId: selectedConnection.id,
                  updates
                });
              }}
              isLoading={updatePermissionsMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/**
 * Connection Card Component
 */
function ConnectionCard({ connection, isOwner, onEditPermissions, onRevokeAccess, onViewData }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'revoked': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getPermissionColor = (level) => {
    switch (level) {
      case 'view_only': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'limited_interaction': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'caregiver': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'healthcare_provider': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <Card className="transition-all hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
              {isOwner ? 
                (connection.inviteeName || 'Family').charAt(0).toUpperCase() :
                'F'
              }
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="font-semibold">
                  {isOwner ? connection.inviteeName || 'Family Member' : 'Family Member'}
                </h3>
                {connection.emergencyContact && (
                  <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                    <Heart className="h-3 w-3 mr-1" />
                    Emergency Contact
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                <span className="capitalize">{connection.relationship}</span>
                <span>•</span>
                <Badge className={getStatusColor(connection.status)}>
                  {connection.status}
                </Badge>
                <span>•</span>
                <Badge className={getPermissionColor(connection.permissionLevel)}>
                  {connection.permissionLevel.replace('_', ' ')}
                </Badge>
              </div>
              
              <div className="flex flex-wrap gap-1 mb-3">
                {connection.sharedCategories?.slice(0, 3).map((category, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {category.replace('_', ' ')}
                  </Badge>
                ))}
                {connection.sharedCategories?.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{connection.sharedCategories.length - 3} more
                  </Badge>
                )}
              </div>
              
              <div className="text-xs text-gray-500">
                Connected {new Date(connection.createdAt).toLocaleDateString()}
                {connection.lastAccessedAt && (
                  <span> • Last accessed {new Date(connection.lastAccessedAt).toLocaleDateString()}</span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {isOwner ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEditPermissions(connection)}
                  disabled={connection.status !== 'active'}
                >
                  <Settings className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onRevokeAccess(connection)}
                  disabled={connection.status !== 'active'}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewData(connection)}
                disabled={connection.status !== 'active'}
              >
                <Eye className="h-4 w-4 mr-2" />
                View Data
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Invite Form Component
 */
function InviteForm({ onSubmit, isLoading }) {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    relationship: '',
    permissionLevel: 'view_only',
    sharedCategories: [],
    message: '',
    emergencyContact: false
  });

  const dataCategories = [
    { id: 'vitals', name: 'Vital Signs', description: 'Heart rate, blood pressure, temperature' },
    { id: 'medications', name: 'Medications', description: 'Current medications and schedules' },
    { id: 'appointments', name: 'Appointments', description: 'Medical appointments and visits' },
    { id: 'fitness', name: 'Fitness & Activity', description: 'Exercise and activity tracking' },
    { id: 'nutrition', name: 'Nutrition', description: 'Diet and meal information' },
    { id: 'sleep', name: 'Sleep Patterns', description: 'Sleep duration and quality' },
    { id: 'mood', name: 'Mental Health', description: 'Mood tracking and assessments' },
    { id: 'symptoms', name: 'Symptoms', description: 'Health symptoms and concerns' },
    { id: 'lab_results', name: 'Lab Results', description: 'Blood work and test results' }
  ];

  const permissionLevels = [
    { id: 'view_only', name: 'View Only', description: 'Can view shared data but cannot make changes' },
    { id: 'limited_interaction', name: 'Limited Interaction', description: 'Can view data and add notes/reminders' },
    { id: 'caregiver', name: 'Caregiver Access', description: 'Can view, add notes, and help manage appointments' },
    { id: 'healthcare_provider', name: 'Healthcare Provider', description: 'Professional access for medical providers' }
  ];

  const relationships = [
    'spouse', 'parent', 'child', 'sibling', 'grandparent', 'grandchild',
    'caregiver', 'doctor', 'nurse', 'therapist', 'guardian', 'friend', 'other'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.name || !formData.relationship) {
      return;
    }

    if (formData.sharedCategories.length === 0) {
      return;
    }

    onSubmit(formData);
  };

  const toggleCategory = (categoryId) => {
    setFormData(prev => ({
      ...prev,
      sharedCategories: prev.sharedCategories.includes(categoryId)
        ? prev.sharedCategories.filter(id => id !== categoryId)
        : [...prev.sharedCategories, categoryId]
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Email Address</label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            placeholder="family@example.com"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Full Name</label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="John Doe"
            required
          />
        </div>
      </div>

      {/* Relationship and Permission Level */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Relationship</label>
          <Select value={formData.relationship} onValueChange={(value) => 
            setFormData(prev => ({ ...prev, relationship: value }))
          }>
            <SelectTrigger>
              <SelectValue placeholder="Select relationship" />
            </SelectTrigger>
            <SelectContent>
              {relationships.map(rel => (
                <SelectItem key={rel} value={rel}>
                  {rel.charAt(0).toUpperCase() + rel.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Permission Level</label>
          <Select value={formData.permissionLevel} onValueChange={(value) => 
            setFormData(prev => ({ ...prev, permissionLevel: value }))
          }>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {permissionLevels.map(level => (
                <SelectItem key={level.id} value={level.id}>
                  {level.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Data Categories */}
      <div>
        <label className="block text-sm font-medium mb-2">Data to Share</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {dataCategories.map(category => (
            <div key={category.id} className="flex items-start space-x-3 p-3 border rounded-lg">
              <Checkbox
                checked={formData.sharedCategories.includes(category.id)}
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

      {/* Emergency Contact */}
      <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
        <div>
          <h4 className="font-medium">Emergency Contact</h4>
          <p className="text-sm text-gray-600">
            Allow this person to be contacted in case of health emergencies
          </p>
        </div>
        <Switch
          checked={formData.emergencyContact}
          onCheckedChange={(checked) => 
            setFormData(prev => ({ ...prev, emergencyContact: checked }))
          }
        />
      </div>

      {/* Message */}
      <div>
        <label className="block text-sm font-medium mb-2">Personal Message (Optional)</label>
        <Textarea
          value={formData.message}
          onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
          placeholder="Add a personal message to your invitation..."
          rows={3}
        />
      </div>

      {/* Submit Button */}
      <Button 
        type="submit" 
        className="w-full" 
        disabled={isLoading || formData.sharedCategories.length === 0}
      >
        {isLoading ? (
          <>
            <Clock className="h-4 w-4 mr-2 animate-spin" />
            Sending Invitation...
          </>
        ) : (
          <>
            <Mail className="h-4 w-4 mr-2" />
            Send Invitation
          </>
        )}
      </Button>
    </form>
  );
}

/**
 * Permissions Form Component
 */
function PermissionsForm({ connection, onSubmit, isLoading }) {
  const [permissionLevel, setPermissionLevel] = useState(connection.permissionLevel);
  const [sharedCategories, setSharedCategories] = useState(connection.sharedCategories || []);
  const [emergencyContact, setEmergencyContact] = useState(connection.emergencyContact);

  const dataCategories = [
    { id: 'vitals', name: 'Vital Signs' },
    { id: 'medications', name: 'Medications' },
    { id: 'appointments', name: 'Appointments' },
    { id: 'fitness', name: 'Fitness & Activity' },
    { id: 'nutrition', name: 'Nutrition' },
    { id: 'sleep', name: 'Sleep Patterns' },
    { id: 'mood', name: 'Mental Health' },
    { id: 'symptoms', name: 'Symptoms' },
    { id: 'lab_results', name: 'Lab Results' }
  ];

  const toggleCategory = (categoryId) => {
    setSharedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    onSubmit({
      permissionLevel,
      sharedCategories,
      emergencyContact
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Permission Level */}
      <div>
        <label className="block text-sm font-medium mb-2">Permission Level</label>
        <Select value={permissionLevel} onValueChange={setPermissionLevel}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="view_only">View Only</SelectItem>
            <SelectItem value="limited_interaction">Limited Interaction</SelectItem>
            <SelectItem value="caregiver">Caregiver Access</SelectItem>
            <SelectItem value="healthcare_provider">Healthcare Provider</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Shared Categories */}
      <div>
        <label className="block text-sm font-medium mb-2">Shared Data Categories</label>
        <div className="grid grid-cols-2 gap-3">
          {dataCategories.map(category => (
            <div key={category.id} className="flex items-center space-x-2">
              <Checkbox
                checked={sharedCategories.includes(category.id)}
                onCheckedChange={() => toggleCategory(category.id)}
              />
              <span className="text-sm">{category.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium">Emergency Contact</h4>
          <p className="text-sm text-gray-600">
            Allow this person to be contacted in emergencies
          </p>
        </div>
        <Switch
          checked={emergencyContact}
          onCheckedChange={setEmergencyContact}
        />
      </div>

      {/* Submit Button */}
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Clock className="h-4 w-4 mr-2 animate-spin" />
            Updating Permissions...
          </>
        ) : (
          <>
            <CheckCircle className="h-4 w-4 mr-2" />
            Update Permissions
          </>
        )}
      </Button>
    </form>
  );
}

export default FamilyCaregiverSharing;