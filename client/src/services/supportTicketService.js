import { collection, addDoc, getDocs, query, where, orderBy, updateDoc, doc } from 'firebase/firestore';
import { db } from './firebaseConfig';

/**
 * Support Ticket Service
 * Manages user support requests with Firebase persistence and localStorage fallback
 */
class SupportTicketService {
  constructor() {
    this.localStorageKey = 'healthmap_support_tickets';
  }

  /**
   * Submit a new support ticket
   */
  async submitSupportTicket(ticketData) {
    const ticket = {
      id: `ticket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: ticketData.userId,
      subject: ticketData.subject,
      message: ticketData.message,
      category: ticketData.category || 'general',
      priority: this.calculatePriority(ticketData),
      status: 'open',
      userPlan: ticketData.userPlan || 'basic',
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      currentUrl: window.location.href,
      attachments: ticketData.attachments || [],
      responses: []
    };

    try {
      if (db) {
        // Store in Firebase Firestore
        const docRef = await addDoc(collection(db, 'support_tickets'), ticket);
        ticket.firestoreId = docRef.id;
        console.log('Support ticket submitted to Firebase:', ticket.id);
      } else {
        // Fallback to localStorage
        this.saveTicketLocally(ticket);
        console.log('Support ticket saved locally:', ticket.id);
      }
      
      // Send confirmation email (would integrate with email service)
      this.sendConfirmationEmail(ticket);
      
      return ticket;
    } catch (error) {
      console.warn('Failed to submit ticket to Firebase, saving locally:', error);
      this.saveTicketLocally(ticket);
      return ticket;
    }
  }

  /**
   * Get tickets for a specific user
   */
  async getUserTickets(userId) {
    try {
      if (db) {
        return await this.getFirebaseTickets(userId);
      } else {
        return this.getLocalTickets(userId);
      }
    } catch (error) {
      console.warn('Failed to get tickets from Firebase, using localStorage:', error);
      return this.getLocalTickets(userId);
    }
  }

  /**
   * Get all tickets (admin function)
   */
  async getAllTickets(filters = {}) {
    try {
      if (db) {
        return await this.getAllFirebaseTickets(filters);
      } else {
        return this.getAllLocalTickets(filters);
      }
    } catch (error) {
      console.warn('Failed to get all tickets from Firebase, using localStorage:', error);
      return this.getAllLocalTickets(filters);
    }
  }

  /**
   * Update ticket status or add response
   */
  async updateTicket(ticketId, updates) {
    try {
      if (db) {
        const ticketRef = doc(db, 'support_tickets', ticketId);
        await updateDoc(ticketRef, {
          ...updates,
          updatedAt: new Date().toISOString()
        });
        console.log('Ticket updated in Firebase:', ticketId);
      } else {
        this.updateLocalTicket(ticketId, updates);
        console.log('Ticket updated locally:', ticketId);
      }
      return true;
    } catch (error) {
      console.error('Failed to update ticket:', error);
      return false;
    }
  }

  /**
   * Calculate ticket priority based on user plan and category
   */
  calculatePriority(ticketData) {
    const planPriority = {
      'basic': 1,
      'premium': 2,
      'pro': 3
    };
    
    const categoryPriority = {
      'billing': 3,
      'technical': 2,
      'feature': 1,
      'general': 1
    };
    
    const userPlanScore = planPriority[ticketData.userPlan] || 1;
    const categoryScore = categoryPriority[ticketData.category] || 1;
    
    const totalScore = userPlanScore + categoryScore;
    
    if (totalScore >= 5) return 'high';
    if (totalScore >= 3) return 'medium';
    return 'low';
  }

  /**
   * Get tickets from Firebase
   */
  async getFirebaseTickets(userId) {
    const q = query(
      collection(db, 'support_tickets'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    );

    const snapshot = await getDocs(q);
    const tickets = [];
    
    snapshot.forEach(doc => {
      tickets.push({ firestoreId: doc.id, ...doc.data() });
    });

    return tickets;
  }

  /**
   * Get all tickets from Firebase (admin)
   */
  async getAllFirebaseTickets(filters) {
    let q = query(collection(db, 'support_tickets'), orderBy('timestamp', 'desc'));

    if (filters.status) {
      q = query(
        collection(db, 'support_tickets'),
        where('status', '==', filters.status),
        orderBy('timestamp', 'desc')
      );
    }

    const snapshot = await getDocs(q);
    const tickets = [];
    
    snapshot.forEach(doc => {
      tickets.push({ firestoreId: doc.id, ...doc.data() });
    });

    return this.applyFilters(tickets, filters);
  }

  /**
   * Get tickets from localStorage
   */
  getLocalTickets(userId) {
    const allTickets = this.getAllLocalTickets();
    return allTickets.filter(ticket => ticket.userId === userId);
  }

  /**
   * Get all tickets from localStorage
   */
  getAllLocalTickets(filters = {}) {
    try {
      const stored = localStorage.getItem(this.localStorageKey);
      const tickets = stored ? JSON.parse(stored) : [];
      return this.applyFilters(tickets, filters);
    } catch (error) {
      console.warn('Failed to retrieve tickets from localStorage:', error);
      return [];
    }
  }

  /**
   * Apply filters to ticket list
   */
  applyFilters(tickets, filters) {
    let filteredTickets = [...tickets];
    
    if (filters.status) {
      filteredTickets = filteredTickets.filter(t => t.status === filters.status);
    }
    if (filters.priority) {
      filteredTickets = filteredTickets.filter(t => t.priority === filters.priority);
    }
    if (filters.category) {
      filteredTickets = filteredTickets.filter(t => t.category === filters.category);
    }
    
    return filteredTickets.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  /**
   * Save ticket to localStorage
   */
  saveTicketLocally(ticket) {
    try {
      const existingTickets = this.getAllLocalTickets();
      existingTickets.push(ticket);
      localStorage.setItem(this.localStorageKey, JSON.stringify(existingTickets));
    } catch (error) {
      console.warn('Failed to save ticket to localStorage:', error);
    }
  }

  /**
   * Update ticket in localStorage
   */
  updateLocalTicket(ticketId, updates) {
    try {
      const tickets = this.getAllLocalTickets();
      const ticketIndex = tickets.findIndex(t => t.id === ticketId);
      
      if (ticketIndex !== -1) {
        tickets[ticketIndex] = { ...tickets[ticketIndex], ...updates };
        localStorage.setItem(this.localStorageKey, JSON.stringify(tickets));
      }
    } catch (error) {
      console.warn('Failed to update ticket in localStorage:', error);
    }
  }

  /**
   * Send confirmation email (stub - would integrate with email service)
   */
  sendConfirmationEmail(ticket) {
    // This would integrate with your email service (SendGrid, etc.)
    console.log(`Confirmation email would be sent for ticket ${ticket.id}`);
    
    // Example integration point:
    // await emailService.sendTicketConfirmation({
    //   to: ticket.userEmail,
    //   ticketId: ticket.id,
    //   subject: ticket.subject
    // });
  }

  /**
   * Get ticket statistics for admin dashboard
   */
  async getTicketStats(timeframeDays = 30) {
    const allTickets = await this.getAllTickets();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - timeframeDays);
    
    const recentTickets = allTickets.filter(ticket => 
      new Date(ticket.timestamp) >= cutoffDate
    );

    const stats = {
      total: recentTickets.length,
      byStatus: {},
      byPriority: {},
      byCategory: {},
      avgResponseTime: 0,
      resolutionRate: 0
    };

    recentTickets.forEach(ticket => {
      // Count by status
      stats.byStatus[ticket.status] = (stats.byStatus[ticket.status] || 0) + 1;
      
      // Count by priority
      stats.byPriority[ticket.priority] = (stats.byPriority[ticket.priority] || 0) + 1;
      
      // Count by category
      stats.byCategory[ticket.category] = (stats.byCategory[ticket.category] || 0) + 1;
    });

    // Calculate resolution rate
    const resolvedTickets = (stats.byStatus.resolved || 0) + (stats.byStatus.closed || 0);
    stats.resolutionRate = recentTickets.length > 0 ? 
      ((resolvedTickets / recentTickets.length) * 100).toFixed(1) : 0;

    return stats;
  }

  /**
   * Clear user tickets (GDPR compliance)
   */
  async clearUserTickets(userId) {
    try {
      if (db) {
        // Would implement batch delete from Firebase
        console.log('Firebase ticket cleanup would be implemented here');
      }
      
      // Clear from localStorage
      const allTickets = this.getAllLocalTickets();
      const filteredTickets = allTickets.filter(ticket => ticket.userId !== userId);
      localStorage.setItem(this.localStorageKey, JSON.stringify(filteredTickets));
      
      return true;
    } catch (error) {
      console.error('Failed to clear user tickets:', error);
      return false;
    }
  }
}

// Export singleton instance
export const supportTicketService = new SupportTicketService();