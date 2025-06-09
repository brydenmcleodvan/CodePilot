/**
 * Rate Limiting Service
 * Prevents spam and abuse with intelligent throttling
 */

class RateLimitingService {
  constructor() {
    this.rateLimits = new Map();
    this.ipLimits = new Map();
    this.globalLimits = new Map();
    
    // Rate limit configurations
    this.limits = {
      supportTicket: {
        windowMs: 5 * 60 * 1000, // 5 minutes
        maxRequests: 1,
        message: 'Too many support tickets. Please wait 5 minutes before submitting another.'
      },
      apiCall: {
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 100,
        message: 'Too many API requests. Please wait a moment.'
      },
      login: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 5,
        message: 'Too many login attempts. Please wait 15 minutes.'
      },
      registration: {
        windowMs: 60 * 60 * 1000, // 1 hour
        maxRequests: 3,
        message: 'Too many registration attempts. Please wait 1 hour.'
      },
      featureUsage: {
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 50,
        message: 'Feature usage limit exceeded. Please slow down.'
      }
    };
    
    // Cleanup old entries every 10 minutes
    setInterval(() => this.cleanup(), 10 * 60 * 1000);
  }

  /**
   * Check if request is within rate limits
   */
  checkRateLimit(identifier, limitType, ipAddress = null) {
    const config = this.limits[limitType];
    if (!config) {
      return { allowed: true };
    }

    const now = Date.now();
    const windowStart = now - config.windowMs;

    // Check user-specific limits
    const userKey = `${limitType}:${identifier}`;
    if (!this.rateLimits.has(userKey)) {
      this.rateLimits.set(userKey, []);
    }

    const userRequests = this.rateLimits.get(userKey);
    
    // Remove old requests outside the window
    const validRequests = userRequests.filter(timestamp => timestamp > windowStart);
    this.rateLimits.set(userKey, validRequests);

    // Check if user exceeded limit
    if (validRequests.length >= config.maxRequests) {
      const oldestRequest = validRequests[0];
      const resetTime = oldestRequest + config.windowMs;
      
      return {
        allowed: false,
        message: config.message,
        resetTime: new Date(resetTime),
        remainingMs: resetTime - now
      };
    }

    // Check IP-based limits if provided
    if (ipAddress) {
      const ipResult = this.checkIpRateLimit(ipAddress, limitType, windowStart, config);
      if (!ipResult.allowed) {
        return ipResult;
      }
    }

    // Add current request timestamp
    validRequests.push(now);
    
    return {
      allowed: true,
      remaining: config.maxRequests - validRequests.length,
      resetTime: new Date(now + config.windowMs)
    };
  }

  /**
   * Check IP-based rate limits
   */
  checkIpRateLimit(ipAddress, limitType, windowStart, config) {
    const ipKey = `${limitType}:ip:${ipAddress}`;
    if (!this.ipLimits.has(ipKey)) {
      this.ipLimits.set(ipKey, []);
    }

    const ipRequests = this.ipLimits.get(ipKey);
    const validIpRequests = ipRequests.filter(timestamp => timestamp > windowStart);
    this.ipLimits.set(ipKey, validIpRequests);

    // More lenient IP limits (3x user limits)
    const ipMaxRequests = config.maxRequests * 3;
    
    if (validIpRequests.length >= ipMaxRequests) {
      const oldestRequest = validIpRequests[0];
      const resetTime = oldestRequest + config.windowMs;
      
      return {
        allowed: false,
        message: 'Too many requests from this location. Please try again later.',
        resetTime: new Date(resetTime),
        remainingMs: resetTime - Date.now()
      };
    }

    validIpRequests.push(Date.now());
    return { allowed: true };
  }

  /**
   * Middleware for Express.js rate limiting
   */
  createMiddleware(limitType) {
    return (req, res, next) => {
      const identifier = req.user?.id || req.ip || 'anonymous';
      const ipAddress = req.ip || req.connection.remoteAddress;
      
      const result = this.checkRateLimit(identifier, limitType, ipAddress);
      
      if (!result.allowed) {
        return res.status(429).json({
          error: 'Rate limit exceeded',
          message: result.message,
          resetTime: result.resetTime,
          remainingMs: result.remainingMs
        });
      }

      // Add rate limit headers
      res.set({
        'X-RateLimit-Limit': this.limits[limitType].maxRequests,
        'X-RateLimit-Remaining': result.remaining || 0,
        'X-RateLimit-Reset': result.resetTime ? Math.floor(result.resetTime.getTime() / 1000) : 0
      });

      next();
    };
  }

  /**
   * Support ticket specific rate limiting with enhanced protection
   */
  checkSupportTicketLimit(userId, ipAddress, ticketData) {
    // Basic rate limit check
    const basicCheck = this.checkRateLimit(userId, 'supportTicket', ipAddress);
    if (!basicCheck.allowed) {
      return basicCheck;
    }

    // Additional spam detection
    const spamCheck = this.detectSpamPatterns(userId, ticketData);
    if (!spamCheck.allowed) {
      return spamCheck;
    }

    // Content-based filtering
    const contentCheck = this.checkTicketContent(ticketData);
    if (!contentCheck.allowed) {
      return contentCheck;
    }

    return { allowed: true };
  }

  /**
   * Detect spam patterns in support tickets
   */
  detectSpamPatterns(userId, ticketData) {
    const userKey = `spam_detection:${userId}`;
    if (!this.rateLimits.has(userKey)) {
      this.rateLimits.set(userKey, []);
    }

    const userTickets = this.rateLimits.get(userKey);
    const now = Date.now();
    const last24Hours = now - (24 * 60 * 60 * 1000);

    // Remove old tickets
    const recentTickets = userTickets.filter(ticket => ticket.timestamp > last24Hours);
    
    // Check for duplicate content
    const isDuplicate = recentTickets.some(ticket => 
      this.calculateSimilarity(ticket.subject, ticketData.subject) > 0.8 ||
      this.calculateSimilarity(ticket.message, ticketData.message) > 0.8
    );

    if (isDuplicate) {
      return {
        allowed: false,
        message: 'Duplicate ticket detected. Please wait before submitting similar requests.',
        type: 'duplicate_content'
      };
    }

    // Check for excessive tickets in 24 hours
    if (recentTickets.length >= 5) {
      return {
        allowed: false,
        message: 'Too many support tickets in the last 24 hours. Please wait before submitting more.',
        type: 'excessive_tickets'
      };
    }

    // Store current ticket for future comparison
    recentTickets.push({
      subject: ticketData.subject,
      message: ticketData.message,
      timestamp: now
    });
    
    this.rateLimits.set(userKey, recentTickets);
    
    return { allowed: true };
  }

  /**
   * Check ticket content for spam indicators
   */
  checkTicketContent(ticketData) {
    const spamIndicators = [
      /\b(viagra|cialis|pharmacy)\b/i,
      /\b(casino|gambling|poker)\b/i,
      /\b(loan|credit|debt)\b/i,
      /\b(win|winner|prize|lottery)\b/i,
      /\b(urgent|emergency|asap)\b/i, // Overuse of urgency
    ];

    const suspiciousPatterns = [
      /(.)\1{10,}/, // Repeated characters
      /[A-Z]{5,}/, // Excessive caps
      /\b\d{4,}\b.*\b\d{4,}\b/, // Multiple long numbers
    ];

    const content = `${ticketData.subject} ${ticketData.message}`.toLowerCase();
    
    // Check for spam keywords
    const spamScore = spamIndicators.reduce((score, pattern) => {
      return score + (pattern.test(content) ? 1 : 0);
    }, 0);

    // Check for suspicious patterns
    const suspiciousScore = suspiciousPatterns.reduce((score, pattern) => {
      return score + (pattern.test(content) ? 1 : 0);
    }, 0);

    if (spamScore >= 2 || suspiciousScore >= 2) {
      return {
        allowed: false,
        message: 'Message content flagged for review. Please contact support directly.',
        type: 'content_flagged'
      };
    }

    return { allowed: true };
  }

  /**
   * Calculate similarity between two strings
   */
  calculateSimilarity(str1, str2) {
    if (!str1 || !str2) return 0;
    
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  /**
   * Calculate Levenshtein distance
   */
  levenshteinDistance(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  /**
   * Get rate limit status for user
   */
  getRateLimitStatus(identifier, limitType) {
    const config = this.limits[limitType];
    if (!config) return null;

    const userKey = `${limitType}:${identifier}`;
    const userRequests = this.rateLimits.get(userKey) || [];
    const now = Date.now();
    const windowStart = now - config.windowMs;
    const validRequests = userRequests.filter(timestamp => timestamp > windowStart);

    return {
      limit: config.maxRequests,
      remaining: Math.max(0, config.maxRequests - validRequests.length),
      resetTime: validRequests.length > 0 ? 
        new Date(validRequests[0] + config.windowMs) : new Date(now + config.windowMs),
      isLimited: validRequests.length >= config.maxRequests
    };
  }

  /**
   * Cleanup old rate limit entries
   */
  cleanup() {
    const now = Date.now();
    
    // Clean user rate limits
    for (const [key, requests] of this.rateLimits.entries()) {
      const limitType = key.split(':')[0];
      const config = this.limits[limitType];
      
      if (config) {
        const windowStart = now - config.windowMs;
        const validRequests = requests.filter(item => {
          return typeof item === 'number' ? item > windowStart : item.timestamp > windowStart;
        });
        
        if (validRequests.length === 0) {
          this.rateLimits.delete(key);
        } else {
          this.rateLimits.set(key, validRequests);
        }
      }
    }

    // Clean IP rate limits
    for (const [key, requests] of this.ipLimits.entries()) {
      const limitType = key.split(':')[1];
      const config = this.limits[limitType];
      
      if (config) {
        const windowStart = now - config.windowMs;
        const validRequests = requests.filter(timestamp => timestamp > windowStart);
        
        if (validRequests.length === 0) {
          this.ipLimits.delete(key);
        } else {
          this.ipLimits.set(key, validRequests);
        }
      }
    }

    console.log(`Rate limit cleanup completed. Active limits: ${this.rateLimits.size}`);
  }

  /**
   * Reset rate limits for user (admin function)
   */
  resetUserLimits(identifier) {
    const keysToDelete = [];
    
    for (const key of this.rateLimits.keys()) {
      if (key.includes(identifier)) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.rateLimits.delete(key));
    
    return keysToDelete.length;
  }

  /**
   * Get rate limiting statistics
   */
  getStatistics() {
    const stats = {
      totalActiveKeys: this.rateLimits.size,
      totalIpKeys: this.ipLimits.size,
      limitBreakdown: {}
    };

    for (const [key, requests] of this.rateLimits.entries()) {
      const limitType = key.split(':')[0];
      if (!stats.limitBreakdown[limitType]) {
        stats.limitBreakdown[limitType] = 0;
      }
      stats.limitBreakdown[limitType]++;
    }

    return stats;
  }
}

// Export singleton instance
const rateLimitingService = new RateLimitingService();

module.exports = {
  RateLimitingService,
  rateLimitingService
};