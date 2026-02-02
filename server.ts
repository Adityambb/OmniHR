
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { tenantMiddleware } from './middleware/tenantMiddleware.js';
import { errorMiddleware } from './middleware/errorMiddleware.js';
import { authenticateJWT } from './middleware/authMiddleware.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import authRoutes from './routes/authRoutes.js';
import leaveRoutes from './routes/leaveRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import requestRoutes from './routes/requestRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/api', tenantMiddleware);
app.use('/api/auth', authRoutes);
app.use('/api/attendance', authenticateJWT, attendanceRoutes);
app.use('/api/leaves', authenticateJWT, leaveRoutes);
app.use('/api/dashboard', authenticateJWT, dashboardRoutes);
app.use('/api/admin', authenticateJWT, adminRoutes);
app.use('/api/requests', authenticateJWT, requestRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date() });
});

app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`[OmniHR] Backend running on port ${PORT}`);
});
