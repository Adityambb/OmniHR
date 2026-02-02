
import { Request, Response, NextFunction } from 'express';
import { query } from '../db';

export const createShift = async (req: any, res: any, next: NextFunction) => {
  const { name, startTime, endTime, gracePeriodMins, halfDayThresholdHours } = req.body;
  const tenantId = req.tenantId;

  try {
    const result = await query(
      `INSERT INTO shifts (client_id, name, start_time, end_time, grace_period_mins, half_day_threshold_hours)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [tenantId, name, startTime, endTime, gracePeriodMins || 15, halfDayThresholdHours || 4.0]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

export const getShifts = async (req: any, res: any, next: NextFunction) => {
  const tenantId = req.tenantId;
  try {
    const result = await query('SELECT * FROM shifts WHERE client_id = $1', [tenantId]);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
};
