
import { Request, Response, NextFunction } from 'express';
import { query } from '../db';

// FIX: Using any for req and res to bypass incorrect type resolution for Express objects, consistent with other controllers
export const createClient = async (req: any, res: any, next: NextFunction) => {
  const { name, subdomain, logoUrl, settings } = req.body;

  try {
    const result = await query(
      `INSERT INTO clients (name, subdomain, logo_url, settings)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, subdomain, logoUrl, settings || {}]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

// FIX: Using any for req and res to bypass incorrect type resolution for Express objects, consistent with other controllers
export const getClients = async (req: any, res: any, next: NextFunction) => {
  try {
    const result = await query('SELECT * FROM clients');
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
};
