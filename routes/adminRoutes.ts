
import express from 'express';
import { addEmployee, getEmployees } from '../controllers/employeeController';
import { createShift, getShifts } from '../controllers/shiftController';
import { createClient, getClients } from '../controllers/clientController';
import { authorizeRoles } from '../middleware/authMiddleware';
import { Role } from '../types';

const router = express.Router();

// Client management (Global/SuperAdmin context)
router.post('/clients', authorizeRoles(Role.ADMIN) as any, createClient);
router.get('/clients', authorizeRoles(Role.ADMIN) as any, getClients);

// Tenant-specific admin
router.post('/employees', authorizeRoles(Role.ADMIN, Role.HR) as any, addEmployee);
router.get('/employees', authorizeRoles(Role.ADMIN, Role.HR, Role.MANAGER) as any, getEmployees);

router.post('/shifts', authorizeRoles(Role.ADMIN, Role.HR) as any, createShift);
router.get('/shifts', authorizeRoles(Role.ADMIN, Role.HR, Role.MANAGER) as any, getShifts);

export default router;
