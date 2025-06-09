/**
 * Cross-Device Voice & Gesture Interface
 * Enables natural language and gesture-based health data interaction
 */

class VoiceGestureInterface {
  constructor() {
    this.voiceCommands = new Map();
    this.gesturePatterns = new Map();
    this.userPreferences = new Map();
    this.conversationContext = new Map();
    
    // Natural language processing patterns
    this.intentPatterns = {
      query_sleep: {
        patterns: [
          /how (did|was) (i|my) sleep (last night|yesterday)?/i,
          /sleep (quality|duration|score) (last night|yesterday)?/i,
          /tell me about (my|last night's) sleep/i
        ],
        response_type: 'sleep_summary',
        data_required: ['sleep_duration', 'sleep_quality', 'sleep_efficiency']
      },
      
      log_mood: {
        patterns: [
          /log (my )?mood (as|is) (\w+)/i,
          /(i feel|feeling|mood) (\w+)/i,
          /record mood (\w+)/i
        ],
        response_type: 'mood_logged',
        data_capture: 'mood_state'
      },
      
      log_symptoms: {
        patterns: [
          /(i have|experiencing|feeling) (a )?(\w+) (headache|pain|ache)/i,
          /log (symptom|pain) (\w+)/i,
          /(my \w+ hurts?|pain in my \w+)/i
        ],
        response_type: 'symptom_logged',
        data_capture: 'symptom_data'
      },
      
      query_vitals: {
        patterns: [
          /what (is|was) my (heart rate|blood pressure|temperature)/i,
          /(check|show) (my )?vitals?/i,
          /how (is|are) my (vital signs|stats)/i
        ],
        response_type: 'vitals_summary',
        data_required: ['heart_rate', 'blood_pressure', 'temperature']
      },
      
      log_medication: {
        patterns: [
          /(took|taking|log) (my )?(\w+) (medication|pill|dose)/i,
          /record medication (\w+)/i,
          /(took|taking) (\w+) (mg|ml)/i
        ],
        response_type: 'medication_logged',
        data_capture: 'medication_data'
      },
      
      query_activity: {
        patterns: [
          /how (active|much exercise) (was i|did i get) today/i,
          /(show|check) (my )?activity (today|this week)/i,
          /exercise (summary|stats)/i
        ],
        response_type: 'activity_summary',
        data_required: ['steps', 'exercise_minutes', 'calories_burned']
      }
    };

    // Gesture patterns for mobile devices
    this.gesturePatterns = {
      quick_mood_log: {
        gesture: 'triple_tap',
        action: 'open_mood_input',
        description: 'Triple tap to quickly log mood'
      },
      
      emergency_alert: {
        gesture: 'shake_vigorous',
        action: 'trigger_emergency_protocol',
        description: 'Vigorous shake to trigger emergency alert'
      },
      
      voice_activation: {
        gesture: 'long_press_anywhere',
        action: 'activate_voice_input',
        description: 'Long press anywhere to start voice input'
      },
      
      quick_vitals: {
        gesture: 'swipe_up_three_fingers',
        action: 'capture_quick_vitals',
        description: 'Three-finger swipe up for quick vital signs'
      }
    };

    this.initializeVoiceProcessor();
  }

  /**
   * Process natural language voice input
   */
  async processVoiceInput(userId, audioInput, inputType = 'speech') {
    try {
      // Convert speech to text if needed
      let textInput;
      if (inputType === 'speech') {
        textInput = await this.speechToText(audioInput);
      } else {
        textInput = audioInput; // Already text
      }

      // Get user context for personalized responses
      const userContext = await this.getUserContext(userId);
      
      // Process natural language understanding
      const intent = await this.processNaturalLanguage(textInput, userContext);
      
      // Execute the intended action
      const response = await this.executeVoiceIntent(userId, intent, userContext);
      
      // Generate natural language response
      const naturalResponse = await this.generateNaturalResponse(response, intent, userContext);
      
      return {
        success: true,
        original_input: textInput,
        intent: intent.type,
        confidence: intent.confidence,
        response: naturalResponse,
        data_updated: response.data_updated || false
      };

    } catch (error) {
      console.error('Voice input processing error:', error);
      return {
        success: false,
        error: 'Sorry, I had trouble understanding that. Could you try again?',
        fallback_suggestions: this.getFallbackSuggestions(userId)
      };
    }
  }

  /**
   * Process gesture input from mobile devices
   */
  async processGestureInput(userId, gestureData) {
    try {
      const { gesture_type, intensity, duration, device_info } = gestureData;
      
      // Match gesture to known patterns
      const gesturePattern = this.matchGesturePattern(gesture_type, intensity, duration);
      
      if (!gesturePattern) {
        return {
          success: false,
          message: 'Gesture not recognized',
          available_gestures: Object.keys(this.gesturePatterns)
        };
      }

      // Execute gesture action
      const actionResult = await this.executeGestureAction(
        userId, 
        gesturePattern.action, 
        device_info
      );

      return {
        success: true,
        gesture_recognized: gesturePattern.gesture,
        action_executed: gesturePattern.action,
        result: actionResult,
        user_feedback: this.generateGestureFeedback(gesturePattern)
      };

    } catch (error) {
      console.error('Gesture processing error:', error);
      return {
        success: false,
        error: 'Unable to process gesture input',
        message: error.message
      };
    }
  }

  /**
   * Process natural language to understand user intent
   */
  async processNaturalLanguage(text, userContext) {
    const text_lower = text.toLowerCase();
    let bestMatch = null;
    let highestConfidence = 0;

    // Check against all intent patterns
    for (const [intentType, intentData] of Object.entries(this.intentPatterns)) {
      for (const pattern of intentData.patterns) {
        const match = pattern.exec(text_lower);
        
        if (match) {
          const confidence = this.calculatePatternConfidence(match, text_lower);
          
          if (confidence > highestConfidence) {
            highestConfidence = confidence;
            bestMatch = {
              type: intentType,
              confidence,
              match: match,
              extracted_data: this.extractDataFromMatch(match, intentData),
              intent_data: intentData
            };
          }
        }
      }
    }

    // If no pattern matches, use fallback analysis
    if (!bestMatch || highestConfidence < 0.6) {
      bestMatch = await this.fallbackIntentAnalysis(text, userContext);
    }

    return bestMatch || {
      type: 'unknown',
      confidence: 0,
      fallback: true
    };
  }

  /**
   * Execute voice intent actions
   */
  async executeVoiceIntent(userId, intent, userContext) {
    switch (intent.type) {
      case 'query_sleep':
        return await this.handleSleepQuery(userId, intent);
      
      case 'log_mood':
        return await this.handleMoodLogging(userId, intent);
      
      case 'log_symptoms':
        return await this.handleSymptomLogging(userId, intent);
      
      case 'query_vitals':
        return await this.handleVitalsQuery(userId, intent);
      
      case 'log_medication':
        return await this.handleMedicationLogging(userId, intent);
      
      case 'query_activity':
        return await this.handleActivityQuery(userId, intent);
      
      default:
        return await this.handleUnknownIntent(userId, intent);
    }
  }

  /**
   * Handle sleep-related queries
   */
  async handleSleepQuery(userId, intent) {
    // Get recent sleep data
    const sleepData = await this.getRecentSleepData(userId);
    
    if (!sleepData) {
      return {
        type: 'no_data',
        message: 'I don\'t have any recent sleep data to share with you.',
        suggestion: 'Make sure your sleep tracking device is connected.'
      };
    }

    return {
      type: 'sleep_summary',
      data: sleepData,
      insights: this.generateSleepInsights(sleepData),
      comparison: await this.getSleepComparison(userId, sleepData)
    };
  }

  /**
   * Handle mood logging
   */
  async handleMoodLogging(userId, intent) {
    const moodValue = intent.extracted_data?.mood_state;
    
    if (!moodValue) {
      return {
        type: 'clarification_needed',
        message: 'I heard you want to log your mood, but I didn\'t catch the mood state. How are you feeling?',
        suggestions: ['happy', 'sad', 'anxious', 'excited', 'tired', 'stressed']
      };
    }

    // Map natural language mood to numeric scale
    const moodScore = this.mapMoodToScore(moodValue);
    
    // Log the mood
    const logResult = await this.logUserMood(userId, moodScore, moodValue);
    
    return {
      type: 'mood_logged',
      mood_value: moodValue,
      mood_score: moodScore,
      logged_at: new Date().toISOString(),
      encouragement: this.generateMoodEncouragement(moodValue),
      data_updated: true
    };
  }

  /**
   * Handle symptom logging
   */
  async handleSymptomLogging(userId, intent) {
    const symptomData = intent.extracted_data?.symptom_data;
    
    if (!symptomData) {
      return {
        type: 'clarification_needed',
        message: 'I heard you want to log a symptom. Can you tell me more specifically what you\'re experiencing?'
      };
    }

    const logResult = await this.logUserSymptom(userId, symptomData);
    
    return {
      type: 'symptom_logged',
      symptom: symptomData,
      logged_at: new Date().toISOString(),
      follow_up: this.generateSymptomFollowUp(symptomData),
      data_updated: true
    };
  }

  /**
   * Handle vitals queries
   */
  async handleVitalsQuery(userId, intent) {
    const vitalsData = await this.getRecentVitals(userId);
    
    if (!vitalsData) {
      return {
        type: 'no_data',
        message: 'I don\'t have recent vital signs data. Make sure your health devices are synced.',
        suggestion: 'You can manually enter vitals or connect a compatible device.'
      };
    }

    return {
      type: 'vitals_summary',
      data: vitalsData,
      assessment: this.assessVitals(vitalsData),
      trends: await this.getVitalsTrends(userId)
    };
  }

  /**
   * Generate natural language responses
   */
  async generateNaturalResponse(response, intent, userContext) {
    const userName = userContext.preferences?.preferred_name || 'there';
    
    switch (response.type) {
      case 'sleep_summary':
        return this.generateSleepResponse(response, userName);
      
      case 'mood_logged':
        return `Got it! I've logged that you're feeling ${response.mood_value}. ${response.encouragement}`;
      
      case 'symptom_logged':
        return `I've recorded your ${response.symptom.type} symptom. ${response.follow_up}`;
      
      case 'vitals_summary':
        return this.generateVitalsResponse(response, userName);
      
      case 'no_data':
        return `Hi ${userName}! ${response.message} ${response.suggestion || ''}`;
      
      case 'clarification_needed':
        return response.message;
      
      default:
        return `Hi ${userName}! I processed your request, but I'm not sure how to respond to that yet. I'm learning!`;
    }
  }

  // Helper methods

  async speechToText(audioInput) {
    // In production, integrate with speech recognition service
    // For now, return mock text
    return "How did I sleep last night?";
  }

  async getUserContext(userId) {
    return {
      preferences: {
        preferred_name: 'Friend',
        voice_personality: 'friendly',
        response_length: 'concise'
      },
      recent_interactions: [],
      health_goals: []
    };
  }

  calculatePatternConfidence(match, text) {
    // Simple confidence calculation based on match quality
    const matchLength = match[0].length;
    const textLength = text.length;
    return Math.min(matchLength / textLength * 2, 1.0);
  }

  extractDataFromMatch(match, intentData) {
    if (intentData.data_capture === 'mood_state') {
      // Extract mood from match groups
      for (let i = 1; i < match.length; i++) {
        if (match[i] && this.isMoodWord(match[i])) {
          return { mood_state: match[i] };
        }
      }
    }
    
    if (intentData.data_capture === 'symptom_data') {
      // Extract symptom information
      const symptomType = this.extractSymptomType(match);
      const severity = this.extractSeverity(match);
      
      return {
        symptom_data: {
          type: symptomType,
          severity: severity,
          location: this.extractLocation(match)
        }
      };
    }
    
    return {};
  }

  isMoodWord(word) {
    const moodWords = [
      'happy', 'sad', 'anxious', 'excited', 'tired', 'stressed', 
      'calm', 'angry', 'frustrated', 'content', 'worried', 'peaceful'
    ];
    return moodWords.includes(word.toLowerCase());
  }

  mapMoodToScore(moodValue) {
    const moodScale = {
      'terrible': 1, 'awful': 1, 'depressed': 2,
      'sad': 3, 'down': 3, 'worried': 3,
      'anxious': 4, 'stressed': 4, 'tired': 4,
      'okay': 5, 'neutral': 5, 'fine': 5,
      'good': 6, 'content': 6, 'calm': 6,
      'happy': 7, 'great': 8, 'excellent': 8,
      'amazing': 9, 'fantastic': 9, 'wonderful': 9,
      'perfect': 10, 'ecstatic': 10
    };
    
    return moodScale[moodValue.toLowerCase()] || 5;
  }

  generateMoodEncouragement(moodValue) {
    const positiveResponses = [
      "That's wonderful to hear!",
      "I'm glad you're feeling that way!",
      "Keep up the positive energy!"
    ];
    
    const neutralResponses = [
      "Thanks for sharing how you're feeling.",
      "Every day has its ups and downs.",
      "I appreciate you keeping track of your mood."
    ];
    
    const supportiveResponses = [
      "I hear you. Remember that feelings are temporary.",
      "It's okay to have difficult days. You're being strong by tracking this.",
      "Thank you for sharing. Is there anything that might help you feel better?"
    ];
    
    const score = this.mapMoodToScore(moodValue);
    
    if (score >= 7) {
      return positiveResponses[Math.floor(Math.random() * positiveResponses.length)];
    } else if (score >= 5) {
      return neutralResponses[Math.floor(Math.random() * neutralResponses.length)];
    } else {
      return supportiveResponses[Math.floor(Math.random() * supportiveResponses.length)];
    }
  }

  generateSleepResponse(response, userName) {
    const { duration, quality, efficiency } = response.data;
    
    let qualityText = '';
    if (quality >= 80) qualityText = 'excellent';
    else if (quality >= 70) qualityText = 'good';
    else if (quality >= 60) qualityText = 'fair';
    else qualityText = 'could be better';
    
    return `Hi ${userName}! Last night you slept for ${duration} hours with ${qualityText} quality (${quality}% sleep efficiency). ${response.insights}`;
  }

  generateVitalsResponse(response, userName) {
    const { heart_rate, blood_pressure, temperature } = response.data;
    
    return `Hi ${userName}! Your latest vitals: Heart rate is ${heart_rate} BPM, blood pressure is ${blood_pressure}, and temperature is ${temperature}°F. ${response.assessment}`;
  }

  async getRecentSleepData(userId) {
    // Mock sleep data - in production, fetch from actual health database
    return {
      duration: 7.5,
      quality: 78,
      efficiency: 85,
      deep_sleep: 1.8,
      rem_sleep: 1.3,
      light_sleep: 4.4
    };
  }

  generateSleepInsights(sleepData) {
    if (sleepData.duration >= 7 && sleepData.quality >= 75) {
      return "That's a solid night of rest!";
    } else if (sleepData.duration < 7) {
      return "You might benefit from getting to bed a bit earlier tonight.";
    } else if (sleepData.quality < 75) {
      return "Your sleep duration was good, but the quality could improve. Consider your sleep environment.";
    }
    return "Every night is different - keep tracking for better insights!";
  }

  async logUserMood(userId, moodScore, moodValue) {
    // Mock mood logging - in production, save to database
    console.log(`Logging mood for user ${userId}: ${moodValue} (${moodScore}/10)`);
    return { success: true };
  }

  matchGesturePattern(gestureType, intensity, duration) {
    // Match gesture to patterns
    for (const [patternName, pattern] of Object.entries(this.gesturePatterns)) {
      if (pattern.gesture === gestureType) {
        return pattern;
      }
    }
    return null;
  }

  async executeGestureAction(userId, action, deviceInfo) {
    switch (action) {
      case 'open_mood_input':
        return { action: 'modal_opened', type: 'mood_input' };
      
      case 'activate_voice_input':
        return { action: 'voice_activated', listening: true };
      
      case 'trigger_emergency_protocol':
        return await this.handleEmergencyGesture(userId);
      
      default:
        return { action: 'unknown', success: false };
    }
  }

  generateGestureFeedback(gesturePattern) {
    return {
      haptic_feedback: 'short_vibration',
      visual_feedback: 'success_animation',
      audio_feedback: 'gentle_chime'
    };
  }

  async handleEmergencyGesture(userId) {
    // In production, trigger actual emergency protocol
    return {
      action: 'emergency_initiated',
      contacts_notified: true,
      emergency_services: 'standby'
    };
  }

  getFallbackSuggestions(userId) {
    return [
      "Try asking 'How did I sleep last night?'",
      "Say 'Log my mood as happy'",
      "Ask 'What are my vitals?'",
      "Try 'I have a headache'"
    ];
  }

  async fallbackIntentAnalysis(text, userContext) {
    // Simple keyword-based fallback
    const text_lower = text.toLowerCase();
    
    if (text_lower.includes('sleep')) {
      return { type: 'query_sleep', confidence: 0.5, fallback: true };
    } else if (text_lower.includes('mood') || text_lower.includes('feel')) {
      return { type: 'log_mood', confidence: 0.5, fallback: true };
    } else if (text_lower.includes('pain') || text_lower.includes('hurt')) {
      return { type: 'log_symptoms', confidence: 0.5, fallback: true };
    }
    
    return { type: 'unknown', confidence: 0, fallback: true };
  }

  initializeVoiceProcessor() {
    console.log('Voice and gesture interface initialized');
    // In production, initialize speech recognition and gesture detection
  }
}

// Export singleton instance
const voiceGestureInterface = new VoiceGestureInterface();

module.exports = {
  VoiceGestureInterface,
  voiceGestureInterface
};