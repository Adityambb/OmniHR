
import { Request, Response, NextFunction } from 'express';
import { query } from '../db';

/**
 * Aggregates statistics for the manager's dashboard
 */
export const getManagerDashboardStats = async (req: any, res: any, next: NextFunction) => {
  const tenantId = req.tenantId;
  const managerUserId = req.user.id; // Corrected from employeeId to use the authenticated user ID

  try {
    // 1. Get the list of employee IDs reporting to this manager
    const teamResult = await query(
      'SELECT id FROM employees WHERE manager_id = $1 AND client_id = $2',
      [managerUserId, tenantId]
    );

    const teamIds = teamResult.rows.map(row => row.id);
    
    if (teamIds.length === 0) {
      return res.json({
        success: true,
        data: {
          presentToday: 0,
          lateToday: 0,
          onLeaveToday: 0,
          teamSize: 0,
          recentActivity: []
        }
      });
    }

    // 2. Fetch Aggregated Stats
    const statsQuery = `
      SELECT 
        (SELECT COUNT(DISTINCT employee_id) FROM attendance 
         WHERE employee_id = ANY($1) AND DATE(punch_in) = CURRENT_DATE) as present_today,
        
        (SELECT COUNT(DISTINCT employee_id) FROM attendance 
         WHERE employee_id = ANY($1) AND DATE(punch_in) = CURRENT_DATE AND status = 'LATE') as late_today,
        
        (SELECT COUNT(DISTINCT employee_id) FROM leaves 
         WHERE employee_id = ANY($1) AND status = 'APPROVED' AND CURRENT_DATE BETWEEN start_date AND end_date) as on_leave_today
    `;

    const statsResult = await query(statsQuery, [teamIds]);
    const stats = statsResult.rows[0];

    // 3. Fetch Recent Activity for the team
    const activityResult = await query(
      `SELECT a.*, e.first_name, e.last_name 
       FROM attendance a 
       JOIN employees e ON a.employee_id = e.id 
       WHERE a.employee_id = ANY($1) 
       ORDER BY a.punch_in DESC LIMIT 10`,
      [teamIds]
    );

    res.json({
      success: true,
      data: {
        presentToday: parseInt(stats.present_today),
        lateToday: parseInt(stats.late_today),
        onLeaveToday: parseInt(stats.on_leave_today),
        teamSize: teamIds.length,
        recentActivity: activityResult.rows
      }
    });
  } catch (err) {
    next(err);
  }
};
