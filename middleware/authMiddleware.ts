
import jwt from 'jsonwebtoken';
import { Role } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

/**
 * Middleware to verify JWT and attach user context to request
 */
export const authenticateJWT = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) {
        return res.status(403).json({ 
          success: false, 
          message: 'Token is invalid or expired' 
        });
      }

      // Ensure the user belongs to the tenant requested in the headers
      if (req.tenantId && user.clientId !== req.tenantId) {
        return res.status(403).json({ 
          success: false, 
          message: 'Cross-tenant access denied' 
        });
      }

      req.user = user;
      next();
    });
  } else {
    res.status(401).json({ 
      success: false, 
      message: 'Authentication token required' 
    });
  }
};

/**
 * Higher-order middleware to restrict routes to specific roles
 */
export const authorizeRoles = (...allowedRoles: Role[]) => {
  return (req: any, res: any, next: any) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Insufficient permissions for this action' 
      });
    }
    next();
  };
};
