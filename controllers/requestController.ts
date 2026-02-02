
import { Request, Response, NextFunction } from 'express';
import { query } from '../db';
import { Role } from '../types';

/**
 * Creates a new request (Leave, WFH, or Regularization)
 */
export const createRequest = async (req: any, res: any, next: NextFunction) => {
  const { 
    requestType, 
    fromDate, 
    toDate, 
    date, 
    inTime, 
    outTime, 
    reason 
  } = req.body;
  
  const tenantId = req.tenantId;
  const userId = req.user.id;

  try {
    // 1. Get employee ID for the authenticated user
    const empResult = await query(
      'SELECT id FROM employees WHERE user_id = $1 AND client_id = $2',
      [userId, tenantId]
    );

    if (empResult.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Employee profile not found.' });
    }

    const employeeId = empResult.rows[0].id;

    // 2. Normalize dates based on request type
    // If it's WFH or Regularization, from_date and to_date are the same as 'date'
    const finalFromDate = requestType === 'Leave' ? fromDate : date;
    const finalToDate = requestType === 'Leave' ? toDate : date;

    // 3. Insert into requests table
    const result = await query(
      `INSERT INTO requests (
        client_id, 
        employee_id, 
        request_type, 
        from_date, 
        to_date, 
        in_time, 
        out_time, 
        reason, 
        status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'PENDING')
      RETURNING *`,
      [
        tenantId, 
        employeeId, 
        requestType.toUpperCase(), 
        finalFromDate, 
        finalToDate, 
        inTime || null, 
        outTime || null, 
        reason
      ]
    );

    res.status(201).json({
      success: true,
      message: `${requestType} request submitted successfully.`,
      data: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Gets requests for the current user or team (if manager/hr)
 */
export const getRequests = async (req: any, res: any, next: NextFunction) => {
  const tenantId = req.tenantId;
  const { role, id: userId } = req.user;

  try {
    let sql = `
      SELECT r.*, e.first_name, e.last_name, e.employee_code 
      FROM requests r
      JOIN employees e ON r.employee_id = e.id
      WHERE r.client_id = $1
    `;
    const params: any[] = [tenantId];

    if (role === Role.EMPLOYEE) {
      sql += ' AND e.user_id = $2';
      params.push(userId);
    } else if (role === Role.MANAGER) {
      sql += ' AND e.manager_id = $2';
      params.push(userId);
    }

    sql += ' ORDER BY r.created_at DESC';
    const result = await query(sql, params);

    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
};

/**
 * Updates request status (Approve/Reject)
 */
export const updateRequestStatus = async (req: any, res: any, next: NextFunction) => {
  const { requestId } = req.params;
  const { status, comments } = req.body;
  const tenantId = req.tenantId;
  const approverId = req.user.id;

  if (!['APPROVED', 'REJECTED'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status update.' });
  }

  try {
    const result = await query(
      `UPDATE requests 
       SET status = $1, 
           updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 AND client_id = $3
       RETURNING *`,
      [status, requestId, tenantId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }

    // Optional: Log the approval in the approvals audit table
    await query(
      `INSERT INTO approvals (client_id, entity_type, entity_id, approver_id, status, comments)
       VALUES ($1, 'GENERIC_REQUEST', $2, $3, $4, $5)`,
      [tenantId, requestId, approverId, status, comments || '']
    );

    res.json({
      success: true,
      message: `Request ${status.toLowerCase()} successfully.`,
      data: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
};
