import { Request, Response, NextFunction } from 'express';
import { query } from '../db';
import { isWithinGeofence } from '../utils/geoUtils';

/**
 * Handles employee punch-in
 */
export const punchIn = async (req: any, res: any, next: NextFunction) => {
  const { employeeId, lat, lng, selfieUrl, locationType } = req.body;
  const tenantId = req.tenantId;

  try {
    const activePunch = await query(
      'SELECT id FROM attendance WHERE client_id = $1 AND employee_id = $2 AND punch_out IS NULL',
      [tenantId, employeeId]
    );

    if (activePunch.rowCount && activePunch.rowCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Active session already exists.'
      });
    }

    // Lateness detection
    const empShift = await query(
      `SELECT s.id, s.start_time, s.grace_period_mins 
       FROM employees e 
       JOIN shifts s ON e.shift_id = s.id 
       WHERE e.id = $1 AND e.client_id = $2`,
      [employeeId, tenantId]
    );

    let isLate = false;
    let shiftId = null;
    if (empShift.rowCount && empShift.rowCount > 0) {
      const shift = empShift.rows[0];
      shiftId = shift.id;
      const now = new Date();
      const [sHours, sMins] = shift.start_time.split(':').map(Number);
      const shiftStart = new Date();
      shiftStart.setHours(sHours, sMins, 0, 0);
      
      const lateThreshold = new Date(shiftStart.getTime() + (shift.grace_period_mins * 60000));
      if (now > lateThreshold) {
        isLate = true;
      }
    }

    let geofenceStatus = true;
    if (locationType === 'OFFICE' && lat && lng) {
      const branchData = await query(
        `SELECT b.latitude, b.longitude, b.geofence_radius_meters 
         FROM employees e 
         JOIN branches b ON e.branch_id = b.id 
         WHERE e.id = $1 AND e.client_id = $2`,
        [employeeId, tenantId]
      );

      if (branchData.rowCount && branchData.rowCount > 0) {
        const { latitude, longitude, geofence_radius_meters } = branchData.rows[0];
        if (latitude && longitude) {
          geofenceStatus = isWithinGeofence(
            parseFloat(latitude), 
            parseFloat(longitude), 
            lat, 
            lng, 
            geofence_radius_meters || 100
          );
        }
      }
    }

    const result = await query(
      `INSERT INTO attendance (
        client_id, 
        employee_id, 
        shift_id,
        punch_in, 
        punch_in_lat, 
        punch_in_lng, 
        punch_in_selfie_url,
        location_type,
        is_within_geofence,
        status
      ) 
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP, $4, $5, $6, $7, $8, $9) 
      RETURNING *`,
      [tenantId, employeeId, shiftId, lat, lng, selfieUrl, locationType || 'OFFICE', geofenceStatus, isLate ? 'LATE' : 'PRESENT']
    );

    res.status(201).json({
      success: true,
      message: isLate ? 'Punch-in recorded (Late)' : 'Punch-in successful',
      data: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Handles employee punch-out
 */
export const punchOut = async (req: any, res: any, next: NextFunction) => {
  const { employeeId, lat, lng, selfieUrl } = req.body;
  const tenantId = req.tenantId;

  try {
    const activePunch = await query(
      `SELECT id, punch_in, location_type, is_within_geofence, status 
       FROM attendance 
       WHERE client_id = $1 AND employee_id = $2 AND punch_out IS NULL
       ORDER BY punch_in DESC LIMIT 1`,
      [tenantId, employeeId]
    );

    if (!activePunch.rowCount || activePunch.rowCount === 0) {
      return res.status(400).json({
        success: false,
        message: 'No active session found to punch out from.'
      });
    }

    const punchRecord = activePunch.rows[0];
    const punchInTime = new Date(punchRecord.punch_in);
    const now = new Date();
    
    const diffMinutes = (now.getTime() - punchInTime.getTime()) / (1000 * 60);
    
    if (diffMinutes < 15) {
      return res.status(400).json({
        success: false,
        message: `Minimum shift duration is 15 minutes.`
      });
    }

    let geofenceStatusOut = true;
    if (punchRecord.location_type === 'OFFICE' && lat && lng) {
      const branchData = await query(
        `SELECT b.latitude, b.longitude, b.geofence_radius_meters 
         FROM employees e 
         JOIN branches b ON e.branch_id = b.id 
         WHERE e.id = $1 AND e.client_id = $2`,
        [employeeId, tenantId]
      );

      if (branchData.rowCount && branchData.rowCount > 0) {
        const { latitude, longitude, geofence_radius_meters } = branchData.rows[0];
        if (latitude && longitude) {
          geofenceStatusOut = isWithinGeofence(
            parseFloat(latitude), 
            parseFloat(longitude), 
            lat, 
            lng, 
            geofence_radius_meters || 100
          );
        }
      }
    }

    const hours = diffMinutes / 60;
    let finalStatus = punchRecord.status; // Keep LATE if already set, otherwise evaluate hours
    if (hours < 4) {
      finalStatus = 'ABSENT';
    } else if (hours < 8 && finalStatus !== 'LATE') {
      finalStatus = 'HALF_DAY';
    }

    const result = await query(
      `UPDATE attendance 
       SET punch_out = CURRENT_TIMESTAMP,
           punch_out_lat = $1,
           punch_out_lng = $2,
           punch_out_selfie_url = $3,
           working_hours = $4,
           status = $5,
           is_within_geofence = is_within_geofence AND $6
       WHERE id = $7
       RETURNING *`,
      [lat, lng, selfieUrl, hours.toFixed(2), finalStatus, geofenceStatusOut, punchRecord.id]
    );

    res.json({
      success: true,
      message: `Punch-out successful.`,
      data: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
};

export const getAttendanceLogs = async (req: any, res: any, next: NextFunction) => {
  const tenantId = req.tenantId;
  try {
    // FIX: Replaced single quotes with template literal backticks to correctly handle multi-line SQL string
    const result = await query(
      `SELECT a.*, e.first_name, e.last_name 
       FROM attendance a 
       JOIN employees e ON a.employee_id = e.id 
       WHERE a.client_id = $1 ORDER BY a.punch_in DESC LIMIT 50`,
      [tenantId]
    );
    res.json({ success: true, count: result.rowCount, data: result.rows });
  } catch (err) {
    next(err);
  }
};