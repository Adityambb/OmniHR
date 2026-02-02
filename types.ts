
export enum Role {
  ADMIN = 'ADMIN',
  HR = 'HR',
  MANAGER = 'MANAGER',
  EMPLOYEE = 'EMPLOYEE'
}

export enum LocationType {
  OFFICE = 'OFFICE',
  WFH = 'WFH'
}

export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED'
}

export interface Client {
  id: string;
  name: string;
  logo: string;
  settings: ClientSettings;
}

export interface ClientSettings {
  gracePeriodMinutes: number;
  halfDayThresholdHours: number;
  requireSelfie: boolean;
  requireGPS: boolean;
  geofenceEnabled?: boolean;
  geofenceRadius?: number; // In meters
}

export interface User {
  id: string;
  clientId: string;
  name: string;
  email: string;
  role: Role;
  managerId?: string;
  avatar: string;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  date: string;
  clockIn: string;
  clockOut?: string;
  latitude?: number;
  longitude?: number;
  selfieUrl?: string;
  locationType: LocationType;
  isWithinGeofence?: boolean;
  status: 'PRESENT' | 'LATE' | 'ABSENT' | 'HALF_DAY';
}

export interface AttendanceCorrectionRequest {
  id: string;
  userId: string;
  date: string;
  type: 'MISSED_IN' | 'MISSED_OUT' | 'WRONG_TIME';
  requestedTime: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

export interface LeaveRequest {
  id: string;
  userId: string;
  startDate: string;
  endDate: string;
  type: 'SICK' | 'CASUAL' | 'VACATION' | 'UNPAID';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reason: string;
}

export interface Task {
  id: string;
  clientId: string;
  title: string;
  description: string;
  assignedTo: string;
  assignedBy: string;
  dueDate: string;
  status: TaskStatus;
}

export interface DashboardStats {
  totalPresent: number;
  totalLate: number;
  totalOnLeave: number;
  attendanceTrend: { day: string; count: number }[];
}
