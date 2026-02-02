
import React, { useState } from 'react';
import { Role, User, Client } from '../types';

interface LoginProps {
  onLoginSuccess: (user: User, token: string, tenantId: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [tenantId, setTenantId] = useState('client_001');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // In a real production environment, this would be:
      /*
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-tenant-id': tenantId 
        },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.message);
      onLoginSuccess(data.user, data.token, tenantId);
      */

      // SIMULATION for demo purposes:
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock user detection based on email prefix for demo
      let role = Role.EMPLOYEE;
      if (email.startsWith('admin')) role = Role.ADMIN;
      else if (email.startsWith('hr')) role = Role.HR;
      else if (email.startsWith('mgr')) role = Role.MANAGER;

      const mockUser: User = {
        id: `u-${Math.random().toString(36).substr(2, 9)}`,
        clientId: tenantId,
        name: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1),
        email: email,
        role: role,
        avatar: `https://i.pravatar.cc/150?u=${email}`
      };

      onLoginSuccess(mockUser, 'mock-jwt-token', tenantId);
    } catch (err: any) {
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-100 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-100 rounded-full blur-3xl opacity-50"></div>
      </div>

      <div className="w-full max-w-[440px] relative z-10">
        <div className="bg-white rounded-3xl shadow-2xl shadow-indigo-100/50 overflow-hidden border border-gray-100">
          <div className="p-8 pb-0 text-center">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-200">
              <i className="fas fa-users-cog text-3xl text-white"></i>
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">OmniHR</h1>
            <p className="text-gray-500 mt-2 font-medium">Enterprise Time & Attendance</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-medium flex items-center animate-shake">
                <i className="fas fa-exclamation-circle mr-2"></i>
                {error}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Company ID</label>
              <div className="relative">
                <i className="fas fa-building absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"></i>
                <input
                  type="text"
                  required
                  value={tenantId}
                  onChange={(e) => setTenantId(e.target.value)}
                  placeholder="client_001"
                  className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl py-3.5 pl-11 pr-4 focus:bg-white focus:border-indigo-500 transition-all outline-none font-medium text-gray-700"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <i className="fas fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"></i>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@company.com"
                  className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl py-3.5 pl-11 pr-4 focus:bg-white focus:border-indigo-500 transition-all outline-none font-medium text-gray-700"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Password</label>
                <a href="#" className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest hover:text-indigo-700">Forgot?</a>
              </div>
              <div className="relative">
                <i className="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"></i>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl py-3.5 pl-11 pr-12 focus:bg-white focus:border-indigo-500 transition-all outline-none font-medium text-gray-700"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
                >
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white rounded-2xl py-4 font-bold text-lg shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:shadow-indigo-200 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Authenticating...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="p-8 pt-0 border-t border-gray-50">
            <div className="bg-gray-50 rounded-2xl p-4 flex items-start space-x-3">
              <i className="fas fa-info-circle text-indigo-400 mt-0.5"></i>
              <p className="text-[11px] text-gray-500 leading-relaxed font-medium">
                Try <span className="text-indigo-600">admin@tech.com</span> for Admin, 
                <span className="text-indigo-600 ml-1">hr@tech.com</span> for HR, or 
                <span className="text-indigo-600 ml-1">emp@tech.com</span> for Employee.
              </p>
            </div>
          </div>
        </div>
        
        <p className="text-center mt-8 text-sm text-gray-400 font-medium">
          Powered by OmniHR Engine v1.2.4
        </p>
      </div>
    </div>
  );
};

export default Login;
