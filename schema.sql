
-- OmniHR Multi-Client Schema
-- Run this in your PostgreSQL tool (pgAdmin)

CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    subdomain VARCHAR(100) UNIQUE,
    logo_url TEXT,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6),
    geofence_radius_meters INTEGER DEFAULT 100
);

CREATE TYPE user_role AS ENUM ('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE');

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    password_hash TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'EMPLOYEE',
    is_active BOOLEAN DEFAULT true,
    UNIQUE(client_id, email)
);

CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES branches(id),
    manager_id UUID REFERENCES users(id),
    employee_code VARCHAR(50),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    designation VARCHAR(100),
    department VARCHAR(100),
    joining_date DATE DEFAULT CURRENT_DATE
);

CREATE TABLE IF NOT EXISTS attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id),
    punch_in TIMESTAMP WITH TIME ZONE NOT NULL,
    punch_out TIMESTAMP WITH TIME ZONE,
    working_hours DECIMAL(5,2),
    location_type VARCHAR(20) DEFAULT 'OFFICE',
    punch_in_lat DECIMAL(9,6),
    punch_in_lng DECIMAL(9,6),
    is_within_geofence BOOLEAN DEFAULT true,
    status VARCHAR(20) DEFAULT 'PRESENT'
);
