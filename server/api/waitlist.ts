import { Request, Response } from 'express';
import fs from 'fs/promises';
import path from 'path';

interface WaitlistEntry {
  email: string;
  timestamp: string;
  source?: string;
  referrer?: string;
}

/**
 * Add a user to the waitlist
 * Stores the email and relevant metadata in a JSON file
 */
export async function addToWaitlist(req: Request, res: Response) {
  try {
    const { email } = req.body;
    
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ error: 'Valid email is required' });
    }
    
    // Create data directory if it doesn't exist
    const dataDir = path.join(process.cwd(), 'data');
    await fs.mkdir(dataDir, { recursive: true });
    
    // Read existing waitlist entries
    const waitlistFile = path.join(dataDir, 'waitlist.json');
    let waitlist: WaitlistEntry[] = [];
    
    try {
      const fileContent = await fs.readFile(waitlistFile, 'utf-8');
      waitlist = JSON.parse(fileContent);
    } catch (error) {
      // File might not exist yet, starting fresh
      waitlist = [];
    }
    
    // Check if email already exists
    const emailExists = waitlist.some(entry => entry.email.toLowerCase() === email.toLowerCase());
    
    if (emailExists) {
      return res.status(200).json({ 
        message: 'You are already on our waitlist. Thanks for your interest!',
        alreadyRegistered: true
      });
    }
    
    // Add new entry
    const newEntry: WaitlistEntry = {
      email,
      timestamp: new Date().toISOString(),
      source: req.headers.referer || undefined,
      referrer: req.headers['user-agent'] || undefined
    };
    
    waitlist.push(newEntry);
    
    // Save updated waitlist
    await fs.writeFile(waitlistFile, JSON.stringify(waitlist, null, 2));
    
    // Return success
    res.status(201).json({ 
      message: 'Successfully added to waitlist! We\'ll notify you when we launch.',
      position: waitlist.length
    });
    
  } catch (error) {
    console.error('Error adding to waitlist:', error);
    res.status(500).json({ error: 'Failed to add to waitlist' });
  }
}

/**
 * Get a count of how many people are on the waitlist
 * Used for displaying social proof on the landing page
 */
export async function getWaitlistCount(req: Request, res: Response) {
  try {
    const waitlistFile = path.join(process.cwd(), 'data', 'waitlist.json');
    
    try {
      const fileContent = await fs.readFile(waitlistFile, 'utf-8');
      const waitlist = JSON.parse(fileContent);
      
      // Return the count
      res.status(200).json({ count: waitlist.length });
    } catch (error) {
      // File might not exist yet
      res.status(200).json({ count: 0 });
    }
  } catch (error) {
    console.error('Error getting waitlist count:', error);
    res.status(500).json({ error: 'Failed to get waitlist count' });
  }
}

// Helper function to validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}