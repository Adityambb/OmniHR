
import React, { useState, useEffect } from 'react';
import { Role, User, Client } from './types';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import AttendanceTracker from './components/AttendanceTracker';
import TaskManagement from './components/TaskManagement';
import LeaveManagement from './components/LeaveManagement';
import DatabaseDocs from './components/DatabaseDocs';
import AdminPanel from './components/AdminPanel';
import AIAssistant from './components/AIAssistant';
import Login from './components/Login';

const MOCK_CLIENT: Client = {
  id: 'client_001',
  name: 'TechFlow Solutions',
  logo: 'https://picsum.photos/200',
  settings: {
    gracePeriodMinutes: 15,
    halfDayThresholdHours: 4,
    requireSelfie: true,
    requireGPS: true,
  }
};

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [client, setClient] = useState<Client>(MOCK_CLIENT);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem('omnihr_token');
    const savedUser = localStorage.getItem('omnihr_user');
    if (savedToken && savedUser) {
      setCurrentUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const handleLoginSuccess = (user: User, token: string, tenantId: string) => {
    localStorage.setItem('omnihr_token', token);
    localStorage.setItem('omnihr_user', JSON.stringify(user));
    localStorage.setItem('omnihr_tenant', tenantId);
    
    setCurrentUser(user);
    setIsAuthenticated(true);
    showToast(`Welcome back, ${user.name}!`);
    
    if (user.role === Role.EMPLOYEE) {
      setActiveTab('attendance');
    } else {
      setActiveTab('dashboard');
    }
  };

  const handleRoleChange = (role: Role) => {
    if (currentUser) {
      setCurrentUser({ ...currentUser, role });
      showToast(`Switched view to ${role} mode`, "info");
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setIsSidebarOpen(false);
  };

  if (!isAuthenticated || !currentUser) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  const mobileNavItems = [
    { id: 'dashboard', icon: 'fa-grid-2', label: 'Home' },
    { id: 'attendance', icon: 'fa-fingerprint', label: 'Punch' },
    { id: 'tasks', icon: 'fa-list-check', label: 'Tasks' },
    { id: 'leave', icon: 'fa-calendar-day', label: 'Leave' },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans antialiased text-slate-900 relative">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={handleTabChange} 
        role={currentUser.role} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <Header 
          user={currentUser} 
          client={client} 
          onRoleChange={handleRoleChange} 
          toggleSidebar={() => setIsSidebarOpen(true)}
        />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-28 md:pb-8 scroll-smooth transition-all duration-300">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && <Dashboard user={currentUser} client={client} showToast={showToast} />}
            {activeTab === 'attendance' && <AttendanceTracker user={currentUser} client={client} showToast={showToast} />}
            {activeTab === 'tasks' && <TaskManagement user={currentUser} />}
            {activeTab === 'leave' && <LeaveManagement user={currentUser} />}
            {activeTab === 'db-design' && <DatabaseDocs />}
            {activeTab === 'admin' && <AdminPanel client={client} setClient={setClient} />}
            {activeTab === 'ai-insights' && <AIAssistant user={currentUser} />}
          </div>
        </main>

        {/* Mobile Bottom Navigation - Narrower container for better centering */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-slate-100 lg:hidden z-40 shadow-[0_-15px_30px_rgba(0,0,0,0.05)] pb-safe">
          <div className="max-w-xs mx-auto px-2 py-3 flex items-center justify-around">
            {mobileNavItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center gap-1 transition-all duration-300 relative ${
                  activeTab === item.id ? 'text-indigo-600 scale-105' : 'text-slate-400'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  activeTab === item.id ? 'bg-indigo-50 shadow-inner' : 'bg-transparent'
                }`}>
                  <i className={`fas ${item.icon} text-lg`}></i>
                </div>
                <span className={`text-[8px] font-black uppercase tracking-tighter transition-opacity ${
                  activeTab === item.id ? 'opacity-100' : 'opacity-60'
                }`}>
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Global Toast Container */}
        <div className="fixed bottom-24 md:bottom-6 right-4 left-4 md:left-auto z-[9999] flex flex-col gap-3 pointer-events-none">
          {toasts.map(toast => (
            <div 
              key={toast.id}
              className={`pointer-events-auto flex items-center gap-3 px-4 py-3 md:px-5 md:py-4 rounded-2xl shadow-2xl border animate-in slide-in-from-bottom-10 duration-500 ${
                toast.type === 'success' ? 'bg-white border-green-100 text-green-800' :
                toast.type === 'error' ? 'bg-white border-red-100 text-red-800' :
                'bg-white border-blue-100 text-blue-800'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                toast.type === 'success' ? 'bg-green-50 text-green-600' :
                toast.type === 'error' ? 'bg-red-50 text-red-600' :
                'bg-blue-50 text-blue-600'
              }`}>
                <i className={`fas ${
                  toast.type === 'success' ? 'fa-check-circle' :
                  toast.type === 'error' ? 'fa-exclamation-circle' :
                  'fa-info-circle'
                }`}></i>
              </div>
              <span className="font-semibold text-xs md:text-sm">{toast.message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;
