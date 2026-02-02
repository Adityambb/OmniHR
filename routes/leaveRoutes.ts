
import express from 'express';
import { createLeaveRequest, getLeaveRequests, updateLeaveStatus } from '../controllers/leaveController';
import { authorizeRoles } from '../middleware/authMiddleware';
import { Role } from '../types';

const router = express.Router();

router.get('/', getLeaveRequests);
router.post('/apply', createLeaveRequest);
router.patch('/:leaveId/status', authorizeRoles(Role.ADMIN, Role.HR, Role.MANAGER) as any, updateLeaveStatus);

export default router;
