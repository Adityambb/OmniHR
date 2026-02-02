
import { Request, Response, NextFunction } from 'express';
import { query } from '../db';
import { Role } from '../types';

/**
 * Creates a new leave request
 */
export const createLeaveRequest = async (req: any, res: any, next: NextFunction) => {
  const { startDate, endDate, type, reason } = req.body;
  const tenantId = req.tenantId;
  const userId = req.user.id;

  try {
    // 1. Get employee ID for the user
    const empResult = await query(
      'SELECT id FROM employees WHERE user_id = $1 AND client_id = $2',
      [userId, tenantId]
    );

    if (empResult.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Employee profile not found.' });
    }

    const employeeId = empResult.rows[0].id;

    // 2. Insert leave request
    const result = await query(
      `INSERT INTO leaves (client_id, employee_id, start_date, end_date, leave_type, reason, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'PENDING')
       RETURNING *`,
      [tenantId, employeeId, startDate, endDate, type, reason]
    );

    res.status(201).json({
      success: true,
      message: 'Leave request submitted successfully.',
      data: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Retrieves leave requests based on role
 */
export const getLeaveRequests = async (req: any, res: any, next: NextFunction) => {
  const tenantId = req.tenantId;
  const { role, id: userId } = req.user;

  try {
    let sql = `
      SELECT l.*, e.first_name, e.last_name, e.employee_code 
      FROM leaves l
      JOIN employees e ON l.employee_id = e.id
      WHERE l.client_id = $1
    `;
    const params: any[] = [tenantId];

    // Employees only see their own
    if (role === Role.EMPLOYEE) {
      sql += ' AND e.user_id = $2';
      params.push(userId);
    } 
    // Managers only see their reports
    else if (role === Role.MANAGER) {
      sql += ' AND e.manager_id = $2';
      params.push(userId);
    }
    // HR/Admin see all for tenant (already covered by client_id = $1)

    sql += ' ORDER BY l.start_date DESC';
    const result = await query(sql, params);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Updates leave status (Approve/Reject)
 */
export const updateLeaveStatus = async (req: any, res: any, next: NextFunction) => {
  const { leaveId } = req.params;
  const { status, comments } = req.body;
  const tenantId = req.tenantId;
  const userId = req.user.id;

  if (!['APPROVED', 'REJECTED'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status update.' });
  }

  try {
    // 1. Check if user is authorized to approve
    // (Middleware already checks for HR/Manager/Admin roles, but we could add specific reporting line checks here)

    // 2. Update leave status
    const result = await query(
      `UPDATE leaves 
       SET status = $1 
       WHERE id = $2 AND client_id = $3
       RETURNING *`,
      [status, leaveId, tenantId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Leave request not found.' });
    }

    // 3. Log the approval action
    await query(
      `INSERT INTO approvals (client_id, entity_type, entity_id, approver_id, status, comments)
       VALUES ($1, 'LEAVE', $2, $3, $4, $5)`,
      [tenantId, leaveId, userId, status, comments]
    );

    res.json({
      success: true,
      message: `Leave request ${status.toLowerCase()} successfully.`,
      data: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
};
