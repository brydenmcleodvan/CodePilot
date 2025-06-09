import { Request, Response } from 'express';
import fs from 'fs/promises';
import path from 'path';

interface ChangelogEntry {
  id: string;
  version: string;
  date: string;
  title: string;
  description: string;
  changes: Array<{
    type: 'added' | 'improved' | 'fixed' | 'removed';
    description: string;
  }>;
  releaseNotes?: string;
}

/**
 * Get the changelog entries
 */
export async function getChangelog(req: Request, res: Response) {
  try {
    // Create data directory if it doesn't exist
    const dataDir = path.join(process.cwd(), 'data');
    await fs.mkdir(dataDir, { recursive: true });
    
    // Read changelog file
    const changelogFile = path.join(dataDir, 'changelog.json');
    let changelog: ChangelogEntry[] = [];
    
    try {
      const fileContent = await fs.readFile(changelogFile, 'utf-8');
      changelog = JSON.parse(fileContent);
    } catch (error) {
      // File might not exist yet, create with sample data
      changelog = [
        {
          id: '1',
          version: '1.0.0',
          date: new Date().toISOString(),
          title: 'Initial Release',
          description: 'The first version of Healthmap is now available!',
          changes: [
            {
              type: 'added',
              description: 'Core health tracking features for steps, sleep, and nutrition'
            },
            {
              type: 'added',
              description: 'Neural Health Profile for personalized insights'
            },
            {
              type: 'added',
              description: 'Basic dashboard with visualization of health metrics'
            }
          ],
          releaseNotes: 'This is our first release of Healthmap. We\'re excited to start this journey with you and will be rapidly adding new features based on your feedback.'
        }
      ];
      
      // Save initial changelog
      await fs.writeFile(changelogFile, JSON.stringify(changelog, null, 2));
    }
    
    // Sort by date (newest first)
    changelog.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    res.status(200).json(changelog);
  } catch (error) {
    console.error('Error fetching changelog:', error);
    res.status(500).json({ error: 'Failed to fetch changelog' });
  }
}

/**
 * Add a new entry to the changelog (admin only)
 */
export async function addChangelogEntry(req: Request, res: Response) {
  try {
    // Check authentication (only admin should access this)
    if (!req.isAuthenticated || !req.user?.isAdmin) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const { version, title, description, changes, releaseNotes } = req.body;
    
    // Validate required fields
    if (!version || !title || !description || !changes || !Array.isArray(changes)) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Create data directory if it doesn't exist
    const dataDir = path.join(process.cwd(), 'data');
    await fs.mkdir(dataDir, { recursive: true });
    
    // Read existing changelog
    const changelogFile = path.join(dataDir, 'changelog.json');
    let changelog: ChangelogEntry[] = [];
    
    try {
      const fileContent = await fs.readFile(changelogFile, 'utf-8');
      changelog = JSON.parse(fileContent);
    } catch (error) {
      // File might not exist yet, starting fresh
      changelog = [];
    }
    
    // Add new entry
    const newEntry: ChangelogEntry = {
      id: Date.now().toString(),
      version,
      date: new Date().toISOString(),
      title,
      description,
      changes,
      releaseNotes
    };
    
    changelog.push(newEntry);
    
    // Save updated changelog
    await fs.writeFile(changelogFile, JSON.stringify(changelog, null, 2));
    
    res.status(201).json(newEntry);
  } catch (error) {
    console.error('Error adding changelog entry:', error);
    res.status(500).json({ error: 'Failed to add changelog entry' });
  }
}