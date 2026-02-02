
import express from 'express';
import { createRequest, getRequests, updateRequestStatus } from '../controllers/requestController';
import { authorizeRoles } from '../middleware/authMiddleware';
import { Role } from '../types';

const router = express.Router();

// Employees can create and view their own requests
router.post('/', createRequest);
router.get('/', getRequests);

// Only Managers, HR, and Admins can approve/reject requests
router.patch('/:requestId/status', authorizeRoles(Role.ADMIN, Role.HR, Role.MANAGER) as any, updateRequestStatus);

export default router;
