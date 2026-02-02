
import express from 'express';
import { punchIn, punchOut, getAttendanceLogs } from '../controllers/attendanceController';
import { authorizeRoles } from '../middleware/authMiddleware';
import { Role } from '../types';

const router = express.Router();

// Any authenticated user can punch in/out
router.post('/punch-in', punchIn);
router.post('/punch-out', punchOut);

// Only managers, HR, and Admins can view the full attendance logs
router.get('/logs', authorizeRoles(Role.ADMIN, Role.HR, Role.MANAGER) as any, getAttendanceLogs);

export default router;
