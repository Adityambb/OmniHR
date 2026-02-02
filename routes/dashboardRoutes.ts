
import express from 'express';
import { getManagerDashboardStats } from '../controllers/dashboardController';
import { authorizeRoles } from '../middleware/authMiddleware';
import { Role } from '../types';

const router = express.Router();

// Restricted to Managers, HR, and Admins
router.get('/manager-stats', authorizeRoles(Role.MANAGER, Role.HR, Role.ADMIN) as any, getManagerDashboardStats);

export default router;
