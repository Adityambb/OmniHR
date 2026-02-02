
import React from 'react';
import { Role } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  role: Role;
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, role, isOpen, onClose }) => {
  const menuItems = [
    { id: 'dashboard', icon: 'fa-grid-2', label: 'Overview', roles: [Role.ADMIN, Role.HR, Role.MANAGER, Role.EMPLOYEE] },
    { id: 'attendance', icon: 'fa-fingerprint', label: 'Attendance', roles: [Role.ADMIN, Role.HR, Role.MANAGER, Role.EMPLOYEE] },
    { id: 'tasks', icon: 'fa-list-check', label: 'Tasks', roles: [Role.ADMIN, Role.HR, Role.MANAGER, Role.EMPLOYEE] },
    { id: 'leave', icon: 'fa-calendar-day', label: 'Time Off', roles: [Role.ADMIN, Role.HR, Role.MANAGER, Role.EMPLOYEE] },
    { id: 'ai-insights', icon: 'fa-sparkles', label: 'Intelligence', roles: [Role.ADMIN, Role.HR, Role.MANAGER] },
    { id: 'admin', icon: 'fa-sliders-h', label: 'Client Setup', roles: [Role.ADMIN, Role.HR] },
    { id: 'db-design', icon: 'fa-database', label: 'Architect', roles: [Role.ADMIN] },
  ];

  const sidebarContent = (
    <aside className="w-64 h-full bg-slate-900 text-white flex-shrink-0 flex flex-col shadow-2xl overflow-y-auto">
      <div className="p-8 pb-10 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-900/40 transform rotate-3">
            <i className="fas fa-terminal text-lg"></i>
          </div>
          <h1 className="text-xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">OmniHR</h1>
        </div>
        
        {/* Mobile Close Button */}
        <button 
          onClick={onClose}
          className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <i className="fas fa-times"></i>
        </button>
      </div>
      
      <nav className="flex-1 px-4 py-2 space-y-2">
        {menuItems.filter(item => item.roles.includes(role)).map(item => (
          <button
            key={item.id}
            onClick={() => {
              setActiveTab(item.id);
              if (onClose) onClose();
            }}
            className={`w-full flex items-center space-x-3 px-5 py-3.5 rounded-2xl transition-all duration-300 relative group ${
              activeTab === item.id 
                ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-900/30 font-bold' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <i className={`fas ${item.icon} w-5 text-center group-hover:scale-110 transition-transform`}></i>
            <span className="text-sm tracking-wide">{item.label}</span>
            {activeTab === item.id && (
              <div className="absolute right-4 w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
            )}
          </button>
        ))}
      </nav>
      
      <div className="p-6 mt-auto">
        <div className="bg-slate-800/40 backdrop-blur-md rounded-2xl p-4 border border-slate-800/60 group hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Engine v1.2</span>
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          </div>
          <p className="text-xs font-medium text-slate-400 leading-relaxed">
            Multi-Tenant isolated <br/> infrastructure active.
          </p>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Mobile Drawer Wrapper */}
      <div 
        className={`fixed inset-0 z-[60] lg:relative lg:z-auto transition-visibility duration-300 ${
          isOpen ? 'visible' : 'invisible lg:visible'
        }`}
      >
        {/* Backdrop / Overlay */}
        <div 
          className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
            isOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={onClose}
        />

        {/* The Actual Sidebar */}
        <div 
          className={`fixed inset-y-0 left-0 w-64 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {sidebarContent}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
