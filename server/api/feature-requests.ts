import { Request, Response } from 'express';
import fs from 'fs/promises';
import path from 'path';

interface FeatureRequest {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'requested' | 'planned' | 'in-progress' | 'completed';
  votes: number;
  createdAt: string;
  submittedBy: {
    id: number;
    name: string;
  };
  comments: Array<{
    id: string;
    text: string;
    createdAt: string;
    user: {
      id: number;
      name: string;
    };
  }>;
  plannedFor?: string;
}

/**
 * Get feature requests
 */
export async function getFeatureRequests(req: Request, res: Response) {
  try {
    // Create data directory if it doesn't exist
    const dataDir = path.join(process.cwd(), 'data');
    await fs.mkdir(dataDir, { recursive: true });
    
    // Read feature requests file
    const featureRequestsFile = path.join(dataDir, 'feature-requests.json');
    let featureRequests: FeatureRequest[] = [];
    
    try {
      const fileContent = await fs.readFile(featureRequestsFile, 'utf-8');
      featureRequests = JSON.parse(fileContent);
    } catch (error) {
      // File might not exist yet, create with sample data
      featureRequests = [
        {
          id: '1',
          title: 'Apple Watch Integration',
          description: 'Add support for syncing health data from Apple Watch directly.',
          category: 'integrations',
          status: 'planned',
          votes: 32,
          createdAt: '2025-03-15T12:00:00Z',
          submittedBy: { id: 2, name: 'Sarah Johnson' },
          comments: [
            {
              id: '101',
              text: 'This would be amazing for tracking workouts!',
              createdAt: '2025-03-16T14:22:00Z',
              user: { id: 3, name: 'Michael Chen' }
            }
          ],
          plannedFor: '2025-Q2'
        },
        {
          id: '2',
          title: 'Dark Mode Support',
          description: 'Add dark mode option to reduce eye strain during nighttime use.',
          category: 'interface',
          status: 'in-progress',
          votes: 28,
          createdAt: '2025-03-10T09:15:00Z',
          submittedBy: { id: 4, name: 'Emma Wilson' },
          comments: []
        },
        {
          id: '3',
          title: 'Meal Planning AI Assistant',
          description: 'Create an AI assistant that suggests meal plans based on health goals and dietary restrictions.',
          category: 'ai-features',
          status: 'requested',
          votes: 15,
          createdAt: '2025-04-01T16:30:00Z',
          submittedBy: { id: 5, name: 'David Rodriguez' },
          comments: [
            {
              id: '102',
              text: 'I would love this! Especially if it can account for allergies.',
              createdAt: '2025-04-02T12:45:00Z',
              user: { id: 6, name: 'Olivia Kim' }
            },
            {
              id: '103',
              text: 'Could it also include grocery lists?',
              createdAt: '2025-04-03T08:20:00Z',
              user: { id: 7, name: 'James Thompson' }
            }
          ]
        },
        {
          id: '4',
          title: 'Export Data to CSV',
          description: 'Allow users to export their health data in CSV format for external analysis.',
          category: 'general',
          status: 'completed',
          votes: 19,
          createdAt: '2025-02-20T11:45:00Z',
          submittedBy: { id: 8, name: 'Sophia Martinez' },
          comments: []
        }
      ];
      
      // Save initial feature requests
      await fs.writeFile(featureRequestsFile, JSON.stringify(featureRequests, null, 2));
    }
    
    res.status(200).json(featureRequests);
  } catch (error) {
    console.error('Error fetching feature requests:', error);
    res.status(500).json({ error: 'Failed to fetch feature requests' });
  }
}

/**
 * Add a new feature request
 */
export async function addFeatureRequest(req: Request, res: Response) {
  try {
    const { title, description, category } = req.body;
    
    // Check if user is authenticated
    if (!req.isAuthenticated && !req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Validate required fields
    if (!title || !description || !category) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Create data directory if it doesn't exist
    const dataDir = path.join(process.cwd(), 'data');
    await fs.mkdir(dataDir, { recursive: true });
    
    // Read existing feature requests
    const featureRequestsFile = path.join(dataDir, 'feature-requests.json');
    let featureRequests: FeatureRequest[] = [];
    
    try {
      const fileContent = await fs.readFile(featureRequestsFile, 'utf-8');
      featureRequests = JSON.parse(fileContent);
    } catch (error) {
      // File might not exist yet, starting fresh
      featureRequests = [];
    }
    
    // Add new feature request
    const newRequest: FeatureRequest = {
      id: Date.now().toString(),
      title,
      description,
      category,
      status: 'requested',
      votes: 1, // Auto-vote by the submitter
      createdAt: new Date().toISOString(),
      submittedBy: {
        id: req.user.id,
        name: req.user.name || req.user.username || 'Anonymous'
      },
      comments: []
    };
    
    featureRequests.push(newRequest);
    
    // Save updated feature requests
    await fs.writeFile(featureRequestsFile, JSON.stringify(featureRequests, null, 2));
    
    res.status(201).json(newRequest);
  } catch (error) {
    console.error('Error adding feature request:', error);
    res.status(500).json({ error: 'Failed to add feature request' });
  }
}

/**
 * Vote for a feature request
 */
export async function voteForFeature(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    // Check if user is authenticated
    if (!req.isAuthenticated && !req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Create data directory if it doesn't exist
    const dataDir = path.join(process.cwd(), 'data');
    await fs.mkdir(dataDir, { recursive: true });
    
    // Read existing feature requests
    const featureRequestsFile = path.join(dataDir, 'feature-requests.json');
    let featureRequests: FeatureRequest[] = [];
    
    try {
      const fileContent = await fs.readFile(featureRequestsFile, 'utf-8');
      featureRequests = JSON.parse(fileContent);
    } catch (error) {
      return res.status(404).json({ error: 'Feature requests not found' });
    }
    
    // Find the feature request
    const featureIndex = featureRequests.findIndex(f => f.id === id);
    if (featureIndex === -1) {
      return res.status(404).json({ error: 'Feature request not found' });
    }
    
    // Increment votes
    featureRequests[featureIndex].votes += 1;
    
    // Save updated feature requests
    await fs.writeFile(featureRequestsFile, JSON.stringify(featureRequests, null, 2));
    
    res.status(200).json(featureRequests[featureIndex]);
  } catch (error) {
    console.error('Error voting for feature:', error);
    res.status(500).json({ error: 'Failed to vote for feature' });
  }
}

/**
 * Add a comment to a feature request
 */
export async function addComment(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { text } = req.body;
    
    // Check if user is authenticated
    if (!req.isAuthenticated && !req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Validate comment text
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Comment text is required' });
    }
    
    // Create data directory if it doesn't exist
    const dataDir = path.join(process.cwd(), 'data');
    await fs.mkdir(dataDir, { recursive: true });
    
    // Read existing feature requests
    const featureRequestsFile = path.join(dataDir, 'feature-requests.json');
    let featureRequests: FeatureRequest[] = [];
    
    try {
      const fileContent = await fs.readFile(featureRequestsFile, 'utf-8');
      featureRequests = JSON.parse(fileContent);
    } catch (error) {
      return res.status(404).json({ error: 'Feature requests not found' });
    }
    
    // Find the feature request
    const featureIndex = featureRequests.findIndex(f => f.id === id);
    if (featureIndex === -1) {
      return res.status(404).json({ error: 'Feature request not found' });
    }
    
    // Add comment
    const newComment = {
      id: Date.now().toString(),
      text,
      createdAt: new Date().toISOString(),
      user: {
        id: req.user.id,
        name: req.user.name || req.user.username || 'Anonymous'
      }
    };
    
    featureRequests[featureIndex].comments.push(newComment);
    
    // Save updated feature requests
    await fs.writeFile(featureRequestsFile, JSON.stringify(featureRequests, null, 2));
    
    res.status(201).json(newComment);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
}

/**
 * Update feature request status (admin only)
 */
export async function updateFeatureStatus(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { status, plannedFor } = req.body;
    
    // Check if user is admin
    if (!req.isAuthenticated || !req.user?.isAdmin) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    // Validate status
    if (!status || !['requested', 'planned', 'in-progress', 'completed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    // Create data directory if it doesn't exist
    const dataDir = path.join(process.cwd(), 'data');
    await fs.mkdir(dataDir, { recursive: true });
    
    // Read existing feature requests
    const featureRequestsFile = path.join(dataDir, 'feature-requests.json');
    let featureRequests: FeatureRequest[] = [];
    
    try {
      const fileContent = await fs.readFile(featureRequestsFile, 'utf-8');
      featureRequests = JSON.parse(fileContent);
    } catch (error) {
      return res.status(404).json({ error: 'Feature requests not found' });
    }
    
    // Find the feature request
    const featureIndex = featureRequests.findIndex(f => f.id === id);
    if (featureIndex === -1) {
      return res.status(404).json({ error: 'Feature request not found' });
    }
    
    // Update status and plannedFor
    featureRequests[featureIndex].status = status;
    if (plannedFor) {
      featureRequests[featureIndex].plannedFor = plannedFor;
    }
    
    // Save updated feature requests
    await fs.writeFile(featureRequestsFile, JSON.stringify(featureRequests, null, 2));
    
    res.status(200).json(featureRequests[featureIndex]);
  } catch (error) {
    console.error('Error updating feature status:', error);
    res.status(500).json({ error: 'Failed to update feature status' });
  }
}