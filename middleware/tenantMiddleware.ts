
import { Request, Response, NextFunction } from 'express';
import { query } from '../db';

// Fix: Using any for req and res to bypass incorrect type resolution for Express objects
export const tenantMiddleware = async (req: any, res: any, next: NextFunction) => {
  const tenantId = req.headers['x-tenant-id'];

  if (!tenantId) {
    return res.status(401).json({ 
      error: 'Unauthorized', 
      message: 'Missing x-tenant-id header. Multi-tenant context required.' 
    });
  }

  try {
    // Validate tenant exists and is active
    const result = await query('SELECT id FROM clients WHERE id = $1', [tenantId]);
    
    if (result.rowCount === 0) {
      return res.status(403).json({ 
        error: 'Forbidden', 
        message: 'Invalid or inactive tenant ID.' 
      });
    }

    // Attach tenant ID to request for use in controllers/models
    req.tenantId = tenantId as string;
    next();
  } catch (err) {
    next(err);
  }
};

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      tenantId?: string;
    }
  }
}
