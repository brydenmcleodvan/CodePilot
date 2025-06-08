/**
 * Subscription Manager with Stripe Integration
 * Handles premium subscriptions, billing, and feature access control
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

class SubscriptionManager {
  constructor() {
    this.subscriptionPlans = {
      'basic': {
        id: 'basic',
        name: 'Basic Health Tracking',
        price: 0,
        currency: 'usd',
        interval: 'month',
        features: [
          'Basic health metrics tracking',
          'Manual data entry',
          'Basic insights',
          'Limited historical data (30 days)'
        ],
        limits: {
          healthMetrics: 5,
          goalTracking: 3,
          aiInsights: 0,
          telehealthConsults: 0,
          dataRetentionDays: 30
        }
      },
      'premium': {
        id: 'premium',
        name: 'Premium Health Intelligence',
        price: 1499, // $14.99 in cents
        currency: 'usd',
        interval: 'month',
        stripePriceId: process.env.STRIPE_PREMIUM_PRICE_ID,
        features: [
          'Unlimited health metrics',
          'AI-powered insights and recommendations',
          'Device integrations (Apple Watch, Fitbit, etc.)',
          'Advanced analytics and trends',
          'Telehealth consultations (2 per month)',
          'Personalized health goals',
          '1 year data retention'
        ],
        limits: {
          healthMetrics: -1, // unlimited
          goalTracking: -1,
          aiInsights: 50,
          telehealthConsults: 2,
          dataRetentionDays: 365
        }
      },
      'pro': {
        id: 'pro',
        name: 'Professional Health Platform',
        price: 2999, // $29.99 in cents
        currency: 'usd',
        interval: 'month',
        stripePriceId: process.env.STRIPE_PRO_PRICE_ID,
        features: [
          'Everything in Premium',
          'Unlimited telehealth consultations',
          'Advanced AI health coaching',
          'Family health management (up to 4 members)',
          'Priority customer support',
          'Health data export and portability',
          'Unlimited data retention',
          'Early access to new features'
        ],
        limits: {
          healthMetrics: -1,
          goalTracking: -1,
          aiInsights: -1,
          telehealthConsults: -1,
          familyMembers: 4,
          dataRetentionDays: -1 // unlimited
        }
      }
    };

    this.userSubscriptions = new Map();
    this.usageTracking = new Map();
  }

  /**
   * Create Stripe customer and subscription
   */
  async createSubscription(userId, planId, paymentMethodId, userEmail) {
    try {
      const plan = this.subscriptionPlans[planId];
      if (!plan || plan.price === 0) {
        throw new Error('Invalid plan for subscription creation');
      }

      // Create or retrieve Stripe customer
      let customer;
      const existingSubscription = this.userSubscriptions.get(userId);
      
      if (existingSubscription && existingSubscription.stripeCustomerId) {
        customer = await stripe.customers.retrieve(existingSubscription.stripeCustomerId);
      } else {
        customer = await stripe.customers.create({
          email: userEmail,
          payment_method: paymentMethodId,
          invoice_settings: {
            default_payment_method: paymentMethodId,
          },
        });
      }

      // Attach payment method to customer
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customer.id,
      });

      // Create subscription
      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{
          price: plan.stripePriceId,
        }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
      });

      // Store subscription data
      const subscriptionData = {
        userId,
        planId,
        stripeCustomerId: customer.id,
        stripeSubscriptionId: subscription.id,
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        createdAt: new Date(),
        features: plan.features,
        limits: plan.limits
      };

      this.userSubscriptions.set(userId, subscriptionData);
      this.initializeUsageTracking(userId);

      return {
        subscription: subscriptionData,
        clientSecret: subscription.latest_invoice.payment_intent.client_secret,
        status: subscription.status
      };

    } catch (error) {
      console.error('Error creating subscription:', error);
      throw new Error(`Failed to create subscription: ${error.message}`);
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(userId, immediateCancel = false) {
    try {
      const userSubscription = this.userSubscriptions.get(userId);
      if (!userSubscription || !userSubscription.stripeSubscriptionId) {
        throw new Error('No active subscription found');
      }

      const canceledSubscription = await stripe.subscriptions.update(
        userSubscription.stripeSubscriptionId,
        {
          cancel_at_period_end: !immediateCancel,
          ...(immediateCancel && { cancel_at: Math.floor(Date.now() / 1000) })
        }
      );

      // Update local subscription data
      userSubscription.status = canceledSubscription.status;
      userSubscription.cancelAtPeriodEnd = canceledSubscription.cancel_at_period_end;
      userSubscription.canceledAt = new Date();

      return userSubscription;

    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw new Error(`Failed to cancel subscription: ${error.message}`);
    }
  }

  /**
   * Change subscription plan
   */
  async changeSubscriptionPlan(userId, newPlanId) {
    try {
      const userSubscription = this.userSubscriptions.get(userId);
      if (!userSubscription || !userSubscription.stripeSubscriptionId) {
        throw new Error('No active subscription found');
      }

      const newPlan = this.subscriptionPlans[newPlanId];
      if (!newPlan) {
        throw new Error('Invalid plan ID');
      }

      // Get current subscription
      const subscription = await stripe.subscriptions.retrieve(
        userSubscription.stripeSubscriptionId
      );

      // Update subscription with new plan
      const updatedSubscription = await stripe.subscriptions.update(
        userSubscription.stripeSubscriptionId,
        {
          items: [{
            id: subscription.items.data[0].id,
            price: newPlan.stripePriceId,
          }],
          proration_behavior: 'create_prorations',
        }
      );

      // Update local data
      userSubscription.planId = newPlanId;
      userSubscription.features = newPlan.features;
      userSubscription.limits = newPlan.limits;
      userSubscription.updatedAt = new Date();

      return userSubscription;

    } catch (error) {
      console.error('Error changing subscription plan:', error);
      throw new Error(`Failed to change subscription plan: ${error.message}`);
    }
  }

  /**
   * Check if user has access to specific feature
   */
  hasFeatureAccess(userId, feature) {
    const subscription = this.getUserSubscription(userId);
    
    // Feature access mapping
    const featureRequirements = {
      'ai_insights': ['premium', 'pro'],
      'telehealth': ['premium', 'pro'],
      'device_integrations': ['premium', 'pro'],
      'advanced_analytics': ['premium', 'pro'],
      'family_management': ['pro'],
      'unlimited_consultations': ['pro'],
      'data_export': ['pro'],
      'priority_support': ['pro']
    };

    const requiredPlans = featureRequirements[feature];
    if (!requiredPlans) return true; // Feature doesn't require subscription

    return requiredPlans.includes(subscription.planId);
  }

  /**
   * Check usage limits and enforce restrictions
   */
  checkUsageLimit(userId, limitType) {
    const subscription = this.getUserSubscription(userId);
    const usage = this.usageTracking.get(userId) || {};
    
    const limit = subscription.limits[limitType];
    if (limit === -1) return { allowed: true, unlimited: true }; // Unlimited
    
    const currentUsage = usage[limitType] || 0;
    const allowed = currentUsage < limit;
    
    return {
      allowed,
      currentUsage,
      limit,
      remaining: Math.max(0, limit - currentUsage)
    };
  }

  /**
   * Track feature usage
   */
  trackUsage(userId, limitType, increment = 1) {
    if (!this.usageTracking.has(userId)) {
      this.initializeUsageTracking(userId);
    }
    
    const usage = this.usageTracking.get(userId);
    usage[limitType] = (usage[limitType] || 0) + increment;
    usage.lastUpdated = new Date();
    
    return usage[limitType];
  }

  /**
   * Initialize usage tracking for user
   */
  initializeUsageTracking(userId) {
    const usage = {
      aiInsights: 0,
      telehealthConsults: 0,
      goalTracking: 0,
      lastReset: new Date(),
      lastUpdated: new Date()
    };
    
    this.usageTracking.set(userId, usage);
    return usage;
  }

  /**
   * Reset monthly usage counters
   */
  resetMonthlyUsage(userId) {
    const usage = this.usageTracking.get(userId);
    if (usage) {
      usage.aiInsights = 0;
      usage.telehealthConsults = 0;
      usage.lastReset = new Date();
      usage.lastUpdated = new Date();
    }
  }

  /**
   * Get user's current subscription
   */
  getUserSubscription(userId) {
    const subscription = this.userSubscriptions.get(userId);
    
    // Return basic plan if no subscription
    if (!subscription) {
      return {
        userId,
        planId: 'basic',
        status: 'active',
        ...this.subscriptionPlans.basic
      };
    }
    
    return subscription;
  }

  /**
   * Get subscription analytics
   */
  getSubscriptionAnalytics() {
    const analytics = {
      totalSubscribers: this.userSubscriptions.size,
      planDistribution: {},
      monthlyRevenue: 0,
      churnRate: 0
    };

    // Calculate plan distribution and revenue
    this.userSubscriptions.forEach(subscription => {
      const planId = subscription.planId;
      analytics.planDistribution[planId] = (analytics.planDistribution[planId] || 0) + 1;
      
      if (subscription.status === 'active') {
        const plan = this.subscriptionPlans[planId];
        analytics.monthlyRevenue += plan.price;
      }
    });

    // Convert revenue from cents to dollars
    analytics.monthlyRevenue = analytics.monthlyRevenue / 100;

    return analytics;
  }

  /**
   * Handle Stripe webhook events
   */
  async handleWebhook(event) {
    try {
      switch (event.type) {
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object);
          break;
        
        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object);
          break;
        
        case 'invoice.payment_succeeded':
          await this.handlePaymentSucceeded(event.data.object);
          break;
        
        case 'invoice.payment_failed':
          await this.handlePaymentFailed(event.data.object);
          break;
        
        default:
          console.log(`Unhandled webhook event type: ${event.type}`);
      }
    } catch (error) {
      console.error('Error handling webhook:', error);
      throw error;
    }
  }

  async handleSubscriptionUpdated(subscription) {
    // Find user by Stripe subscription ID
    const userId = this.findUserByStripeSubscription(subscription.id);
    if (userId) {
      const userSubscription = this.userSubscriptions.get(userId);
      userSubscription.status = subscription.status;
      userSubscription.currentPeriodStart = new Date(subscription.current_period_start * 1000);
      userSubscription.currentPeriodEnd = new Date(subscription.current_period_end * 1000);
    }
  }

  async handleSubscriptionDeleted(subscription) {
    const userId = this.findUserByStripeSubscription(subscription.id);
    if (userId) {
      // Downgrade to basic plan
      const basicSubscription = {
        userId,
        planId: 'basic',
        status: 'active',
        ...this.subscriptionPlans.basic
      };
      this.userSubscriptions.set(userId, basicSubscription);
    }
  }

  async handlePaymentSucceeded(invoice) {
    // Reset monthly usage counters on successful payment
    const userId = this.findUserByStripeCustomer(invoice.customer);
    if (userId) {
      this.resetMonthlyUsage(userId);
    }
  }

  async handlePaymentFailed(invoice) {
    console.log(`Payment failed for customer: ${invoice.customer}`);
    // Could implement dunning management here
  }

  findUserByStripeSubscription(subscriptionId) {
    for (const [userId, subscription] of this.userSubscriptions) {
      if (subscription.stripeSubscriptionId === subscriptionId) {
        return userId;
      }
    }
    return null;
  }

  findUserByStripeCustomer(customerId) {
    for (const [userId, subscription] of this.userSubscriptions) {
      if (subscription.stripeCustomerId === customerId) {
        return userId;
      }
    }
    return null;
  }
}

// Export singleton instance
const subscriptionManager = new SubscriptionManager();

module.exports = {
  SubscriptionManager,
  subscriptionManager
};