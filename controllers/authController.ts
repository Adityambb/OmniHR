
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../db';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

export const login = async (req: any, res: any, next: any) => {
  const { email, password } = req.body;
  const tenantId = req.tenantId; // From tenantMiddleware

  try {
    // 1. Find user by email AND client_id for isolation
    const result = await query(
      'SELECT id, email, password_hash, role, client_id FROM users WHERE email = $1 AND client_id = $2 AND is_active = true',
      [email, tenantId]
    );

    if (result.rowCount === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // 2. Compare hashed password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // 3. Generate JWT
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role, 
        clientId: user.client_id 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // 4. Return user role and token
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        clientId: user.client_id
      }
    });
  } catch (err) {
    next(err);
  }
};

export const register = async (req: any, res: any, next: any) => {
  const { email, password, role } = req.body;
  const tenantId = req.tenantId;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await query(
      `INSERT INTO users (client_id, email, password_hash, role) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, email, role, client_id`,
      [tenantId, email, hashedPassword, role || 'EMPLOYEE']
    );

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
};
