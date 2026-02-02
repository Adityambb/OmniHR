
import React, { useState } from 'react';

const DatabaseDocs: React.FC = () => {
  const [activeView, setActiveView] = useState<'diagram' | 'sql'>('diagram');

  const sqlDDL = `-- Multi-Client HRMS Time & Attendance Schema
-- Optimized for PostgreSQL

-- 1. Clients (Tenants)
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    subdomain VARCHAR(100) UNIQUE,
    logo_url TEXT,
    settings JSONB DEFAULT '{}', -- Multi-client rules (grace period, selfie req, etc)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Branches (Locations per client)
CREATE TABLE branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    address TEXT,
    timezone VARCHAR(50) DEFAULT 'UTC',
    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6),
    geofence_radius_meters INTEGER DEFAULT 100
);

-- 3. Users (Auth & Identity)
CREATE TYPE user_role AS ENUM ('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    password_hash TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'EMPLOYEE',
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    UNIQUE(client_id, email)
);

-- 4. Employees (HR Profile)
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES branches(id),
    manager_id UUID REFERENCES users(id), -- Reports to
    employee_code VARCHAR(50),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    department VARCHAR(100),
    designation VARCHAR(100),
    joining_date DATE,
    UNIQUE(client_id, employee_code)
);

-- 5. Shifts (Configurable per client)
CREATE TABLE shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    name VARCHAR(100),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    grace_period_mins INTEGER DEFAULT 15,
    half_day_threshold_hours DECIMAL(4,2) DEFAULT 4.0
);

-- 6. Attendance (The core tracker)
CREATE TABLE attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id),
    shift_id UUID REFERENCES shifts(id),
    punch_in TIMESTAMP WITH TIME ZONE NOT NULL,
    punch_out TIMESTAMP WITH TIME ZONE,
    working_hours DECIMAL(5,2), -- Calculated on punch-out
    location_type VARCHAR(20) DEFAULT 'OFFICE', -- OFFICE, WFH
    punch_in_lat DECIMAL(9,6),
    punch_in_lng DECIMAL(9,6),
    punch_out_lat DECIMAL(9,6),
    punch_out_lng DECIMAL(9,6),
    punch_in_selfie_url TEXT,
    punch_out_selfie_url TEXT,
    status VARCHAR(20) DEFAULT 'PRESENT', -- Rules: >=8h PRESENT, 4-8h HALF_DAY, <4h ABSENT
    is_within_geofence BOOLEAN DEFAULT true,
    verification_metadata JSONB -- Browser/Device info
);

-- 7. Unified Requests (Leave, WFH, Regularization)
CREATE TYPE request_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

CREATE TABLE requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id),
    request_type VARCHAR(50) NOT NULL, -- LEAVE, WFH, REGULARIZATION
    from_date DATE NOT NULL,
    to_date DATE NOT NULL,
    in_time TIME,
    out_time TIME,
    reason TEXT,
    status request_status DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Approvals (Audit Trail)
CREATE TABLE approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL, -- 'LEAVE', 'ATTENDANCE_CORRECTION', 'GENERIC_REQUEST'
    entity_id UUID NOT NULL,
    approver_id UUID NOT NULL REFERENCES users(id),
    status request_status NOT NULL,
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);`;

  const tables = [
    {
      name: 'clients',
      desc: 'Root tenant table. Controls billing and global settings.',
      cols: ['id', 'name', 'subdomain', 'settings (JSONB)', 'created_at']
    },
    {
      name: 'users',
      desc: 'Credential storage. Isolated by client_id.',
      cols: ['id', 'client_id', 'email', 'role (ENUM)', 'is_active']
    },
    {
      name: 'requests',
      desc: 'Unified table for Leave, WFH, and Regularization requests.',
      cols: ['id', 'employee_id', 'request_type', 'from_date', 'to_date', 'status']
    },
    {
      name: 'attendance',
      desc: 'Transactional logs for every shift movement.',
      cols: ['id', 'employee_id', 'punch_in', 'punch_out', 'working_hours', 'location_type', 'gps_coords', 'selfie_url']
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">System Architecture</h2>
          <p className="text-gray-500">Relational schema design for high-scale multi-tenancy.</p>
        </div>
        <div className="flex bg-gray-200 p-1 rounded-lg">
          <button 
            onClick={() => setActiveView('diagram')}
            className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${activeView === 'diagram' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'}`}
          >
            Diagram View
          </button>
          <button 
            onClick={() => setActiveView('sql')}
            className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${activeView === 'sql' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'}`}
          >
            SQL Source
          </button>
        </div>
      </div>

      {activeView === 'diagram' ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tables.map(table => (
              <div key={table.name} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:border-indigo-300 transition-colors">
                <div className="bg-indigo-600 text-white p-3 flex items-center justify-between">
                  <span className="font-mono text-sm font-bold uppercase tracking-wider">{table.name}</span>
                  <i className="fas fa-database text-indigo-200"></i>
                </div>
                <div className="p-4 space-y-3">
                  <p className="text-xs text-gray-500 leading-relaxed font-medium">{table.desc}</p>
                  <div className="pt-2 border-t border-gray-50">
                    {table.cols.map(col => (
                      <div key={col} className="flex items-center space-x-2 py-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                        <span className="text-xs font-mono text-gray-700">{col}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-indigo-900 rounded-2xl p-8 text-white relative overflow-hidden shadow-2xl">
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-12">
              <div>
                <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center mb-4">
                  <i className="fas fa-fingerprint text-xl"></i>
                </div>
                <h4 className="font-bold text-lg mb-2">Isolation Pattern</h4>
                <p className="text-sm text-indigo-100 leading-relaxed">
                  Every SQL query is automatically appended with <code className="bg-indigo-800 px-1 rounded">WHERE client_id = ?</code> via middleware or RLS (Row Level Security).
                </p>
              </div>
              <div>
                <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center mb-4">
                  <i className="fas fa-map-marked-alt text-xl"></i>
                </div>
                <h4 className="font-bold text-lg mb-2">Spatial Analytics</h4>
                <p className="text-sm text-indigo-100 leading-relaxed">
                  PostGIS geography types allow managers to run proximity reports: "Show all employees who punched in outside their designated geofence."
                </p>
              </div>
              <div>
                <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center mb-4">
                  <i className="fas fa-history text-xl"></i>
                </div>
                <h4 className="font-bold text-lg mb-2">Immutable Logs</h4>
                <p className="text-sm text-indigo-100 leading-relaxed">
                  The <code className="bg-indigo-800 px-1 rounded">attendance</code> table is write-heavy and optimized for time-series partitioning to handle millions of records per month.
                </p>
              </div>
            </div>
            <i className="fas fa-project-diagram absolute -right-20 -bottom-20 text-[300px] opacity-5 rotate-12"></i>
          </div>
        </div>
      ) : (
        <div className="bg-gray-900 rounded-xl overflow-hidden shadow-2xl border border-gray-800">
          <div className="flex items-center justify-between px-4 py-2 bg-gray-800">
            <div className="flex space-x-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <span className="text-xs font-mono text-gray-400">schema_v3_unified.sql</span>
            <button 
              onClick={() => navigator.clipboard.writeText(sqlDDL)}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-bold"
            >
              COPY SQL
            </button>
          </div>
          <pre className="p-6 overflow-x-auto text-sm leading-relaxed font-mono text-gray-300 scrollbar-hide">
            {sqlDDL}
          </pre>
        </div>
      )}
    </div>
  );
};

export default DatabaseDocs;
