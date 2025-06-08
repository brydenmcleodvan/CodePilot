/**
 * Background Task Queue Service
 * Handles intensive operations like PDF exports, email reports, and data processing
 */

const { rateLimitingService } = require('./rateLimitingService');

class BackgroundTaskQueue {
  constructor() {
    this.taskQueue = [];
    this.activeTasks = new Map();
    this.completedTasks = new Map();
    this.workers = [];
    this.maxConcurrentTasks = 3;
    this.isProcessing = false;
    
    // Task type configurations
    this.taskConfigs = {
      'pdf_export': {
        priority: 2,
        timeout: 30000, // 30 seconds
        retries: 2
      },
      'email_report': {
        priority: 3,
        timeout: 15000, // 15 seconds
        retries: 3
      },
      'data_processing': {
        priority: 1,
        timeout: 60000, // 60 seconds
        retries: 1
      },
      'health_summary': {
        priority: 4,
        timeout: 10000, // 10 seconds
        retries: 2
      },
      'backup_data': {
        priority: 1,
        timeout: 120000, // 2 minutes
        retries: 1
      }
    };
    
    // Start background processing
    this.startProcessing();
    
    // Cleanup completed tasks every hour
    setInterval(() => this.cleanupCompletedTasks(), 60 * 60 * 1000);
  }

  /**
   * Add task to queue
   */
  async addTask(taskType, taskData, userId, priority = null) {
    // Check if user can queue this task type
    const canQueue = await this.checkTaskPermissions(userId, taskType);
    if (!canQueue.allowed) {
      throw new Error(canQueue.message);
    }

    const task = {
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: taskType,
      data: taskData,
      userId,
      priority: priority || this.taskConfigs[taskType]?.priority || 1,
      status: 'queued',
      createdAt: new Date(),
      retries: 0,
      maxRetries: this.taskConfigs[taskType]?.retries || 1,
      timeout: this.taskConfigs[taskType]?.timeout || 30000
    };

    // Insert task in priority order
    this.insertTaskByPriority(task);
    
    console.log(`Task queued: ${task.id} (${taskType}) for user ${userId}`);
    
    // Trigger processing if not already running
    if (!this.isProcessing) {
      this.processQueue();
    }
    
    return task.id;
  }

  /**
   * Check if user can queue a task
   */
  async checkTaskPermissions(userId, taskType) {
    // Rate limit task creation
    const rateLimit = rateLimitingService.checkRateLimit(userId, 'backgroundTask');
    if (!rateLimit.allowed) {
      return {
        allowed: false,
        message: 'Too many background tasks queued. Please wait before adding more.'
      };
    }

    // Check concurrent task limits per user
    const userActiveTasks = Array.from(this.activeTasks.values())
      .filter(task => task.userId === userId).length;
    
    if (userActiveTasks >= 2) {
      return {
        allowed: false,
        message: 'Maximum concurrent tasks reached. Please wait for current tasks to complete.'
      };
    }

    // Check task-specific limits
    const taskLimits = {
      'pdf_export': { daily: 10, hourly: 3 },
      'email_report': { daily: 5, hourly: 2 },
      'data_processing': { daily: 20, hourly: 5 }
    };

    if (taskLimits[taskType]) {
      const userTaskCount = this.getUserTaskCount(userId, taskType);
      const limits = taskLimits[taskType];
      
      if (userTaskCount.daily >= limits.daily) {
        return {
          allowed: false,
          message: `Daily limit of ${limits.daily} ${taskType} tasks reached.`
        };
      }
      
      if (userTaskCount.hourly >= limits.hourly) {
        return {
          allowed: false,
          message: `Hourly limit of ${limits.hourly} ${taskType} tasks reached.`
        };
      }
    }

    return { allowed: true };
  }

  /**
   * Insert task maintaining priority order
   */
  insertTaskByPriority(task) {
    let insertIndex = this.taskQueue.length;
    
    // Find correct position based on priority (higher number = higher priority)
    for (let i = 0; i < this.taskQueue.length; i++) {
      if (this.taskQueue[i].priority < task.priority) {
        insertIndex = i;
        break;
      }
    }
    
    this.taskQueue.splice(insertIndex, 0, task);
  }

  /**
   * Start background processing
   */
  startProcessing() {
    if (this.isProcessing) return;
    
    this.isProcessing = true;
    this.processQueue();
  }

  /**
   * Process task queue
   */
  async processQueue() {
    while (this.taskQueue.length > 0 && this.activeTasks.size < this.maxConcurrentTasks) {
      const task = this.taskQueue.shift();
      
      if (task) {
        this.activeTasks.set(task.id, task);
        this.executeTask(task);
      }
    }

    // Continue processing if there are more tasks
    if (this.taskQueue.length > 0) {
      setTimeout(() => this.processQueue(), 1000);
    } else {
      this.isProcessing = false;
    }
  }

  /**
   * Execute individual task
   */
  async executeTask(task) {
    task.status = 'running';
    task.startedAt = new Date();
    
    console.log(`Executing task: ${task.id} (${task.type})`);
    
    try {
      // Set timeout for task execution
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Task timeout')), task.timeout);
      });
      
      const taskPromise = this.runTaskHandler(task);
      
      // Race between task completion and timeout
      const result = await Promise.race([taskPromise, timeoutPromise]);
      
      task.status = 'completed';
      task.completedAt = new Date();
      task.result = result;
      
      console.log(`Task completed: ${task.id}`);
      this.moveToCompleted(task);
      
    } catch (error) {
      console.error(`Task failed: ${task.id}`, error.message);
      
      if (task.retries < task.maxRetries) {
        task.retries++;
        task.status = 'retrying';
        task.error = error.message;
        
        // Re-queue for retry with delay
        setTimeout(() => {
          this.taskQueue.unshift(task);
          this.activeTasks.delete(task.id);
          this.processQueue();
        }, 5000 * task.retries); // Exponential backoff
        
      } else {
        task.status = 'failed';
        task.completedAt = new Date();
        task.error = error.message;
        
        console.error(`Task permanently failed: ${task.id}`);
        this.moveToCompleted(task);
      }
    }
  }

  /**
   * Run specific task handler based on type
   */
  async runTaskHandler(task) {
    switch (task.type) {
      case 'pdf_export':
        return await this.handlePdfExport(task);
      case 'email_report':
        return await this.handleEmailReport(task);
      case 'data_processing':
        return await this.handleDataProcessing(task);
      case 'health_summary':
        return await this.handleHealthSummary(task);
      case 'backup_data':
        return await this.handleBackupData(task);
      default:
        throw new Error(`Unknown task type: ${task.type}`);
    }
  }

  /**
   * Handle PDF export tasks
   */
  async handlePdfExport(task) {
    const { reportType, dateRange, userId } = task.data;
    
    // Simulate PDF generation (would integrate with actual PDF library)
    await this.delay(5000); // Simulate processing time
    
    const pdfData = {
      filename: `health_report_${userId}_${Date.now()}.pdf`,
      size: Math.floor(Math.random() * 1000000) + 500000, // 500KB - 1.5MB
      pages: Math.floor(Math.random() * 20) + 5,
      downloadUrl: `/api/downloads/pdf/${task.id}`,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    };
    
    // Store PDF metadata for download
    this.storePdfMetadata(task.id, pdfData);
    
    return {
      type: 'pdf_export',
      filename: pdfData.filename,
      downloadUrl: pdfData.downloadUrl,
      size: pdfData.size,
      pages: pdfData.pages
    };
  }

  /**
   * Handle email report tasks
   */
  async handleEmailReport(task) {
    const { recipients, reportType, data } = task.data;
    
    // Simulate email sending
    await this.delay(3000);
    
    const emailResults = [];
    
    for (const recipient of recipients) {
      // Simulate individual email sending
      const success = Math.random() > 0.1; // 90% success rate
      
      emailResults.push({
        recipient,
        success,
        messageId: success ? `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` : null,
        error: success ? null : 'Failed to send email'
      });
    }
    
    return {
      type: 'email_report',
      totalRecipients: recipients.length,
      successfulSends: emailResults.filter(r => r.success).length,
      failedSends: emailResults.filter(r => !r.success).length,
      results: emailResults
    };
  }

  /**
   * Handle data processing tasks
   */
  async handleDataProcessing(task) {
    const { operation, dataset } = task.data;
    
    // Simulate data processing
    await this.delay(8000);
    
    return {
      type: 'data_processing',
      operation,
      recordsProcessed: dataset?.length || Math.floor(Math.random() * 10000),
      outputSize: Math.floor(Math.random() * 5000000) + 1000000, // 1-6MB
      processingTime: Math.floor(Math.random() * 30000) + 5000 // 5-35 seconds
    };
  }

  /**
   * Handle health summary generation
   */
  async handleHealthSummary(task) {
    const { userId, timeframe } = task.data;
    
    // Simulate summary generation
    await this.delay(2000);
    
    return {
      type: 'health_summary',
      userId,
      timeframe,
      summaryData: {
        metricsAnalyzed: Math.floor(Math.random() * 1000) + 100,
        insights: Math.floor(Math.random() * 20) + 5,
        recommendationsGenerated: Math.floor(Math.random() * 10) + 3,
        aiProcessingTime: Math.floor(Math.random() * 5000) + 1000
      }
    };
  }

  /**
   * Handle data backup tasks
   */
  async handleBackupData(task) {
    const { userId, dataTypes } = task.data;
    
    // Simulate backup process
    await this.delay(15000);
    
    return {
      type: 'backup_data',
      userId,
      dataTypes,
      backupSize: Math.floor(Math.random() * 50000000) + 10000000, // 10-60MB
      backupLocation: `backups/user_${userId}_${Date.now()}.zip`,
      compressionRatio: (Math.random() * 0.3 + 0.6).toFixed(2) // 60-90%
    };
  }

  /**
   * Move task to completed storage
   */
  moveToCompleted(task) {
    this.activeTasks.delete(task.id);
    this.completedTasks.set(task.id, task);
    
    // Continue processing queue
    if (this.taskQueue.length > 0) {
      this.processQueue();
    }
  }

  /**
   * Get task status
   */
  getTaskStatus(taskId) {
    if (this.activeTasks.has(taskId)) {
      return this.activeTasks.get(taskId);
    }
    
    if (this.completedTasks.has(taskId)) {
      return this.completedTasks.get(taskId);
    }
    
    // Check if still in queue
    const queuedTask = this.taskQueue.find(task => task.id === taskId);
    if (queuedTask) {
      return queuedTask;
    }
    
    return null;
  }

  /**
   * Get user's task count
   */
  getUserTaskCount(userId, taskType) {
    const now = new Date();
    const oneHourAgo = new Date(now - 60 * 60 * 1000);
    const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000);
    
    const allUserTasks = [
      ...Array.from(this.activeTasks.values()),
      ...Array.from(this.completedTasks.values()),
      ...this.taskQueue
    ].filter(task => task.userId === userId && task.type === taskType);
    
    return {
      hourly: allUserTasks.filter(task => task.createdAt >= oneHourAgo).length,
      daily: allUserTasks.filter(task => task.createdAt >= oneDayAgo).length
    };
  }

  /**
   * Get queue statistics
   */
  getQueueStats() {
    const tasksByType = {};
    const tasksByStatus = {};
    
    const allTasks = [
      ...this.taskQueue,
      ...Array.from(this.activeTasks.values()),
      ...Array.from(this.completedTasks.values())
    ];
    
    allTasks.forEach(task => {
      tasksByType[task.type] = (tasksByType[task.type] || 0) + 1;
      tasksByStatus[task.status] = (tasksByStatus[task.status] || 0) + 1;
    });
    
    return {
      queueLength: this.taskQueue.length,
      activeTasks: this.activeTasks.size,
      completedTasks: this.completedTasks.size,
      maxConcurrent: this.maxConcurrentTasks,
      tasksByType,
      tasksByStatus,
      isProcessing: this.isProcessing
    };
  }

  /**
   * Store PDF metadata for download
   */
  storePdfMetadata(taskId, pdfData) {
    // In a real implementation, this would store to database
    console.log(`PDF metadata stored for task ${taskId}:`, pdfData);
  }

  /**
   * Cleanup old completed tasks
   */
  cleanupCompletedTasks() {
    const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
    
    for (const [taskId, task] of this.completedTasks.entries()) {
      if (task.completedAt && task.completedAt < cutoffTime) {
        this.completedTasks.delete(taskId);
      }
    }
    
    console.log(`Task cleanup completed. Active completed tasks: ${this.completedTasks.size}`);
  }

  /**
   * Utility delay function
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Cancel task
   */
  cancelTask(taskId, userId) {
    // Check if user owns the task
    const task = this.getTaskStatus(taskId);
    if (!task || task.userId !== userId) {
      throw new Error('Task not found or access denied');
    }
    
    if (task.status === 'completed' || task.status === 'failed') {
      throw new Error('Cannot cancel completed or failed task');
    }
    
    if (task.status === 'running') {
      // Mark for cancellation (actual implementation would need worker coordination)
      task.status = 'cancelled';
      task.completedAt = new Date();
      this.moveToCompleted(task);
      return true;
    }
    
    // Remove from queue
    const queueIndex = this.taskQueue.findIndex(t => t.id === taskId);
    if (queueIndex !== -1) {
      this.taskQueue.splice(queueIndex, 1);
      task.status = 'cancelled';
      task.completedAt = new Date();
      this.completedTasks.set(taskId, task);
      return true;
    }
    
    return false;
  }
}

// Export singleton instance
const backgroundTaskQueue = new BackgroundTaskQueue();

module.exports = {
  BackgroundTaskQueue,
  backgroundTaskQueue
};