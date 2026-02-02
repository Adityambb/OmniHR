
import React from 'react';
import { User, Client, Role } from '../types';

interface HeaderProps {
  user: User;
  client: Client;
  onRoleChange: (role: Role) => void;
  toggleSidebar?: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, client, onRoleChange, toggleSidebar }) => {
  return (
    <header className="bg-white/80 backdrop-blur-xl border-b border-slate-100 h-20 md:h-24 flex items-center justify-between px-5 md:px-12 flex-shrink-0 sticky top-0 z-40 transition-all duration-300">
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          className="lg:hidden w-11 h-11 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-600 hover:bg-slate-100 transition-all active:scale-90 border border-slate-200 shadow-sm"
        >
          <i className="fas fa-bars-staggered"></i>
        </button>

        <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl overflow-hidden shadow-2xl border-2 border-white hidden sm:block rotate-1 group hover:rotate-0 transition-transform">
           <img src={client.logo} alt={client.name} className="w-full h-full object-cover" />
        </div>
        <div className="min-w-0">
          <span className="text-slate-900 font-black tracking-tight text-sm md:text-xl block truncate">{client.name}</span>
          <div className="flex items-center gap-2 mt-0.5">
             <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
             <span className="text-[9px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest truncate">
               Active Workspace
             </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-10">
        <div className="hidden md:flex items-center gap-4 bg-slate-50 px-5 py-2.5 rounded-2xl border border-slate-100 shadow-inner group hover:bg-white transition-all">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Context</label>
          <select 
            className="text-xs font-black bg-transparent border-none text-indigo-600 focus:ring-0 cursor-pointer pr-10 uppercase tracking-wider transition-colors"
            value={user.role}
            onChange={(e) => onRoleChange(e.target.value as Role)}
          >
            {Object.values(Role).map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-4 md:pl-10 md:border-l md:border-slate-100 group cursor-pointer">
          <div className="text-right hidden sm:block">
            <p className="text-xs md:text-base font-black text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors">{user.name}</p>
            <p className="text-[9px] md:text-[11px] font-black text-indigo-500 uppercase tracking-[0.2em] mt-0.5">{user.role}</p>
          </div>
          <div className="relative">
            <img 
              src={user.avatar} 
              alt={user.name} 
              className="w-11 h-11 md:w-14 md:h-14 rounded-2xl md:rounded-[1.5rem] object-cover border-4 border-white shadow-2xl group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-4 border-white rounded-full shadow-lg ring-2 ring-emerald-100"></div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
