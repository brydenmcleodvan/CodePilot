import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

/**
 * Input sanitization and validation utilities
 * 
 * Protects against XSS and injection attacks by sanitizing user input
 */

/**
 * Sanitize a string input to prevent XSS
 * 
 * @param input The string to sanitize
 * @returns Sanitized string
 */
export function sanitizeString(input: string): string {
  if (!input) return input;
  
  // Convert HTML entities
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Sanitize an object recursively
 * 
 * @param obj The object to sanitize
 * @returns Sanitized object
 */
export function sanitizeObject<T>(obj: T): T {
  if (!obj) return obj;
  
  if (typeof obj === 'string') {
    return sanitizeString(obj) as unknown as T;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item)) as unknown as T;
  }
  
  if (typeof obj === 'object' && obj !== null) {
    const result: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(obj)) {
      result[key] = sanitizeObject(value);
    }
    
    return result as T;
  }
  
  return obj;
}

/**
 * Middleware to sanitize request body, query, and params
 */
export function sanitizeInputs(req: Request, _res: Response, next: NextFunction) {
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }
  
  next();
}

/**
 * Create a validator middleware using Zod schema
 * 
 * @param schema Zod schema to validate against
 * @param source Where to find the data (body, query, params)
 * @returns Express middleware
 */
export function validateWith<T>(schema: z.ZodType<T>, source: 'body' | 'query' | 'params' = 'body') {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req[source];
      const validatedData = schema.parse(data);
      
      // Replace the original data with validated data
      req[source] = validatedData;
      
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: 'Validation error',
          errors: error.errors,
          code: 'VALIDATION_ERROR'
        });
      }
      
      next(error);
    }
  };
}

/**
 * Safely parse JSON without throwing
 * 
 * @param text The JSON string to parse
 * @param fallback Fallback value if parsing fails
 * @returns Parsed JSON or fallback
 */
export function safeJsonParse<T>(text: string, fallback: T): T {
  try {
    return JSON.parse(text) as T;
  } catch (error) {
    return fallback;
  }
}

/**
 * Creates a sanitized HTML string that's safe for rendering
 * 
 * @param html The HTML to sanitize
 * @returns Sanitized HTML
 */
export function sanitizeHtml(html: string): string {
  // In a real implementation, use a library like DOMPurify
  // This is a simple implementation for basic cases
  
  const allowedTags = ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li', 'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
  const allowedAttrs = ['href', 'target', 'rel'];
  
  // Remove script tags and their contents
  html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove on* attributes (event handlers)
  html = html.replace(/\s+on\w+\s*=\s*("[^"]*"|'[^']*')/gi, '');
  
  // Remove style attributes (potential CSS injection)
  html = html.replace(/\s+style\s*=\s*("[^"]*"|'[^']*')/gi, '');
  
  // Filter only allowed tags and attributes
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  const sanitize = (node: Element) => {
    const nodeName = node.nodeName.toLowerCase();
    
    // If not allowed tag, replace with text content
    if (!allowedTags.includes(nodeName)) {
      const text = document.createTextNode(node.textContent || '');
      node.parentNode?.replaceChild(text, node);
      return;
    }
    
    // Remove disallowed attributes
    Array.from(node.attributes).forEach(attr => {
      if (!allowedAttrs.includes(attr.name.toLowerCase())) {
        node.removeAttribute(attr.name);
      }
    });
    
    // If it's an anchor tag, ensure it has rel="noopener noreferrer"
    if (nodeName === 'a' && node.hasAttribute('href')) {
      node.setAttribute('rel', 'noopener noreferrer');
      
      // Ensure href doesn't contain javascript:
      const href = node.getAttribute('href') || '';
      if (href.toLowerCase().trim().startsWith('javascript:')) {
        node.setAttribute('href', '#');
      }
    }
    
    // Process children
    Array.from(node.children).forEach(sanitize);
  };
  
  Array.from(tempDiv.children).forEach(sanitize);
  
  return tempDiv.innerHTML;
}