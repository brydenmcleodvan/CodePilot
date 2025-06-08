import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Users,
  Star,
  Clock,
  MessageCircle,
  Calendar,
  Filter,
  Search,
  Heart,
  Award,
  DollarSign,
  Video,
  Phone,
  Mail,
  CheckCircle,
  UserCheck
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

/**
 * Smart Coaching Marketplace Component
 * Connects users with certified health coaches
 */
export function SmartCoachingMarketplace() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const { toast } = useToast();

  // Fetch matching coaches
  const { data: coachesData, isLoading } = useQuery({
    queryKey: ['/api/coaching/matches', selectedSpecialty, priceRange],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedSpecialty !== 'all') params.append('specialty', selectedSpecialty);
      if (priceRange !== 'all') params.append('priceRange', priceRange);
      
      const res = await apiRequest('GET', `/api/coaching/matches?${params}`);
      return res.json();
    }
  });

  // Book coaching session mutation
  const bookSessionMutation = useMutation({
    mutationFn: async (bookingData) => {
      const res = await apiRequest('POST', '/api/coaching/book-session', bookingData);
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Session Booked Successfully!",
        description: `Your coaching session is scheduled. Session ID: ${data.sessionId}`
      });
      setShowBookingDialog(false);
      queryClient.invalidateQueries(['/api/coaching/my-sessions']);
    },
    onError: (error) => {
      toast({
        title: "Booking Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const specialties = [
    { value: 'all', label: 'All Specialties' },
    { value: 'weight_loss', label: 'Weight Loss' },
    { value: 'muscle_building', label: 'Muscle Building' },
    { value: 'nutrition', label: 'Nutrition' },
    { value: 'mental_health', label: 'Mental Health' },
    { value: 'sleep_optimization', label: 'Sleep Optimization' },
    { value: 'stress_management', label: 'Stress Management' },
    { value: 'chronic_disease', label: 'Chronic Disease Management' },
    { value: 'sports_performance', label: 'Sports Performance' },
    { value: 'women_health', label: "Women's Health" },
    { value: 'seniors_wellness', label: 'Seniors Wellness' }
  ];

  const filteredCoaches = coachesData?.matches?.filter(coach => 
    coach.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    coach.bio.toLowerCase().includes(searchQuery.toLowerCase()) ||
    coach.specialties.some(specialty => 
      specialty.toLowerCase().includes(searchQuery.toLowerCase())
    )
  ) || [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold flex items-center justify-center space-x-2">
          <Users className="h-8 w-8 text-blue-600" />
          <span>Smart Coaching Marketplace</span>
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Connect with certified health coaches who understand your unique wellness journey. 
          Get personalized guidance, accountability, and expert support to achieve your health goals.
        </p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search coaches..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
              <SelectTrigger>
                <SelectValue placeholder="Specialty" />
              </SelectTrigger>
              <SelectContent>
                {specialties.map(specialty => (
                  <SelectItem key={specialty.value} value={specialty.value}>
                    {specialty.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger>
                <SelectValue placeholder="Price Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="budget">$50 - $75/hour</SelectItem>
                <SelectItem value="standard">$75 - $100/hour</SelectItem>
                <SelectItem value="premium">$100+/hour</SelectItem>
              </SelectContent>
            </Select>
            
            <Button className="flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <span>More Filters</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Coaches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredCoaches.map((coach, index) => (
            <motion.div
              key={coach.coachId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <CoachCard 
                coach={coach} 
                onSelect={(coach) => {
                  setSelectedCoach(coach);
                  setShowBookingDialog(true);
                }}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredCoaches.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Coaches Found</h3>
            <p className="text-gray-600">
              Try adjusting your search criteria or browse all available coaches.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Booking Dialog */}
      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Book a Session with {selectedCoach?.name}</DialogTitle>
          </DialogHeader>
          
          {selectedCoach && (
            <BookingForm 
              coach={selectedCoach}
              onBook={(bookingData) => bookSessionMutation.mutate(bookingData)}
              isLoading={bookSessionMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/**
 * Individual Coach Card Component
 */
function CoachCard({ coach, onSelect }) {
  return (
    <Card className="transition-all hover:shadow-lg cursor-pointer group">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Coach Header */}
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
              {coach.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{coach.name}</h3>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>{coach.rating}</span>
                </div>
                <span>•</span>
                <span>{coach.experience} experience</span>
              </div>
            </div>
          </div>

          {/* Specialties */}
          <div className="flex flex-wrap gap-2">
            {coach.specialties.slice(0, 3).map((specialty, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {specialty.replace('_', ' ')}
              </Badge>
            ))}
            {coach.specialties.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{coach.specialties.length - 3} more
              </Badge>
            )}
          </div>

          {/* Bio */}
          <p className="text-sm text-gray-600 line-clamp-2">
            {coach.bio}
          </p>

          {/* Pricing and Availability */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="font-semibold">${coach.hourlyRate}/hour</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>Next: {coach.nextAvailable ? 'Today' : 'Tomorrow'}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2 pt-2">
            <Button 
              onClick={() => onSelect(coach)}
              className="flex-1"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Book Session
            </Button>
            <Button variant="outline" size="sm">
              <MessageCircle className="h-4 w-4" />
            </Button>
          </div>

          {/* Compatibility Score */}
          <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
            <span>Compatibility Score</span>
            <div className="flex items-center space-x-1">
              <div className="w-16 h-1 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 rounded-full transition-all"
                  style={{ width: `${coach.compatibilityScore * 100}%` }}
                />
              </div>
              <span className="font-medium">{Math.round(coach.compatibilityScore * 100)}%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Booking Form Component
 */
function BookingForm({ coach, onBook, isLoading }) {
  const [sessionType, setSessionType] = useState('consultation');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [duration, setDuration] = useState('60');
  const [platform, setPlatform] = useState('video_call');
  const [goals, setGoals] = useState('');
  const [shareHealthData, setShareHealthData] = useState(false);
  const [notes, setNotes] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!scheduledDate || !scheduledTime) {
      return;
    }

    const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
    
    const bookingData = {
      coachId: coach.coachId,
      type: sessionType,
      scheduledTime: scheduledDateTime.toISOString(),
      duration: parseInt(duration),
      platform,
      goals: goals.split(',').map(g => g.trim()).filter(g => g),
      shareHealthData,
      notes
    };

    onBook(bookingData);
  };

  const sessionPrice = (coach.hourlyRate * parseInt(duration)) / 60;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Session Type */}
      <div>
        <label className="block text-sm font-medium mb-2">Session Type</label>
        <Select value={sessionType} onValueChange={setSessionType}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="consultation">Initial Consultation</SelectItem>
            <SelectItem value="follow_up">Follow-up Session</SelectItem>
            <SelectItem value="package">Package Session</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Date and Time */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Date</label>
          <Input
            type="date"
            value={scheduledDate}
            onChange={(e) => setScheduledDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Time</label>
          <Input
            type="time"
            value={scheduledTime}
            onChange={(e) => setScheduledTime(e.target.value)}
            required
          />
        </div>
      </div>

      {/* Duration */}
      <div>
        <label className="block text-sm font-medium mb-2">Duration</label>
        <Select value={duration} onValueChange={setDuration}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="30">30 minutes</SelectItem>
            <SelectItem value="60">60 minutes</SelectItem>
            <SelectItem value="90">90 minutes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Platform */}
      <div>
        <label className="block text-sm font-medium mb-2">Session Platform</label>
        <Select value={platform} onValueChange={setPlatform}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="video_call">Video Call</SelectItem>
            <SelectItem value="phone_call">Phone Call</SelectItem>
            <SelectItem value="in_person">In Person</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Goals */}
      <div>
        <label className="block text-sm font-medium mb-2">Session Goals</label>
        <Input
          placeholder="e.g., weight loss, nutrition planning, stress management"
          value={goals}
          onChange={(e) => setGoals(e.target.value)}
        />
        <p className="text-xs text-gray-500 mt-1">Separate multiple goals with commas</p>
      </div>

      {/* Health Data Sharing */}
      <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div>
          <h4 className="font-medium">Share Health Data</h4>
          <p className="text-sm text-gray-600">
            Allow your coach to view anonymized health metrics for better guidance
          </p>
        </div>
        <Switch
          checked={shareHealthData}
          onCheckedChange={setShareHealthData}
        />
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium mb-2">Additional Notes</label>
        <Textarea
          placeholder="Any specific concerns or questions for your coach..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />
      </div>

      {/* Pricing Summary */}
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="font-medium">Session Total</span>
          <span className="text-xl font-bold">${sessionPrice.toFixed(2)}</span>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          ${coach.hourlyRate}/hour × {duration} minutes
        </p>
      </div>

      {/* Submit Button */}
      <Button 
        type="submit" 
        className="w-full" 
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Clock className="h-4 w-4 mr-2 animate-spin" />
            Booking Session...
          </>
        ) : (
          <>
            <CheckCircle className="h-4 w-4 mr-2" />
            Book Session for ${sessionPrice.toFixed(2)}
          </>
        )}
      </Button>
    </form>
  );
}

export default SmartCoachingMarketplace;