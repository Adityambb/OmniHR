
import { Request, Response, NextFunction } from 'express';
import { query, getClient as getDbClient } from '../db';
import bcrypt from 'bcryptjs';

export const addEmployee = async (req: any, res: any, next: NextFunction) => {
  const { email, password, firstName, lastName, role, branchId, shiftId, employeeCode, designation, department } = req.body;
  const tenantId = req.tenantId;
  const dbClient = await getDbClient();

  try {
    await dbClient.query('BEGIN');

    // 1. Create User
    const hashedPassword = await bcrypt.hash(password || 'Welcome123', 10);
    const userResult = await dbClient.query(
      `INSERT INTO users (client_id, email, password_hash, role) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id`,
      [tenantId, email, hashedPassword, role || 'EMPLOYEE']
    );
    const userId = userResult.rows[0].id;

    // 2. Create Employee Profile
    const empResult = await dbClient.query(
      `INSERT INTO employees (
        user_id, client_id, branch_id, shift_id, employee_code, 
        first_name, last_name, designation, department, joining_date
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_DATE) 
      RETURNING *`,
      [userId, tenantId, branchId, shiftId, employeeCode, firstName, lastName, designation, department]
    );

    await dbClient.query('COMMIT');
    res.status(201).json({ success: true, data: empResult.rows[0] });
  } catch (err) {
    await dbClient.query('ROLLBACK');
    next(err);
  } finally {
    dbClient.release();
  }
};

export const getEmployees = async (req: any, res: any, next: NextFunction) => {
  const tenantId = req.tenantId;
  try {
    const result = await query(
      `SELECT e.*, u.email, u.role, s.name as shift_name, b.name as branch_name
       FROM employees e
       JOIN users u ON e.user_id = u.id
       LEFT JOIN shifts s ON e.shift_id = s.id
       LEFT JOIN branches b ON e.branch_id = b.id
       WHERE e.client_id = $1`,
      [tenantId]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
};
