
import React, { useState } from 'react';
import { User, Client, Role } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import RequestModal from './RequestModal';

const DATA = [
  { day: 'Mon', present: 45, late: 5 },
  { day: 'Tue', present: 48, late: 2 },
  { day: 'Wed', present: 42, late: 8 },
  { day: 'Thu', present: 50, late: 0 },
  { day: 'Fri', present: 47, late: 3 },
];

const PIE_DATA = [
  { name: 'On Time', value: 85, color: '#6366f1' },
  { name: 'Late', value: 10, color: '#f59e0b' },
  { name: 'Absent', value: 5, color: '#f43f5e' },
];

const MOCK_LEAVES = [
  { id: '1', name: 'Sarah Miller', type: 'Sick Leave', duration: 'Oct 24 - Oct 26', avatar: 'https://i.pravatar.cc/150?u=sarah' },
  { id: '2', name: 'Mike Ross', type: 'Vacation', duration: 'Oct 20 - Nov 05', avatar: 'https://i.pravatar.cc/150?u=mike' },
];

const MOCK_REGULARIZATIONS = [
  { id: '1', name: 'Alex Thompson', date: 'Oct 23', type: 'Missed Punch', avatar: 'https://i.pravatar.cc/150?u=alex' },
  { id: '2', name: 'Jessica Day', date: 'Oct 22', type: 'Wrong Time', avatar: 'https://i.pravatar.cc/150?u=jessica' },
];

interface DashboardProps {
  user: User;
  client: Client;
  showToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, client, showToast }) => {
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const isManagementView = user.role === Role.ADMIN || user.role === Role.HR || user.role === Role.MANAGER;

  return (
    <div className="space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
        <div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight text-center md:text-left">Overview</h2>
          <p className="text-slate-500 font-medium mt-1.5 text-sm md:text-base text-center md:text-left">
            Real-time insights for <span className="text-indigo-600 font-bold tracking-tight">{client.name}</span>
          </p>
        </div>
        <div className="grid grid-cols-2 md:flex items-center gap-3">
           <button className="h-12 md:h-11 px-4 bg-white border border-slate-200 rounded-2xl text-xs md:text-sm font-black text-slate-600 hover:bg-slate-50 transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2">
             <i className="fas fa-file-export text-slate-400"></i> Export
           </button>
           <button 
             onClick={() => setIsRequestModalOpen(true)}
             className="h-12 md:h-11 px-4 bg-slate-900 text-white rounded-2xl text-xs md:text-sm font-black hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95 flex items-center justify-center gap-2"
           >
             <i className="fas fa-plus"></i> New Request
           </button>
        </div>
      </div>

      {isManagementView ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <StatCard icon="fa-users" label="Active Workforce" value="156" trend="+2.4%" trendType="up" />
            <StatCard icon="fa-check-double" label="Present Today" value="142" color="text-indigo-600" trend="+12%" trendType="up" />
            <StatCard icon="fa-clock" label="Late Arrivals" value="14" color="text-amber-500" trend="-5%" trendType="down" />
            <StatCard icon="fa-calendar-minus" label="Out on Leave" value="8" color="text-rose-500" />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8">
            <div className="xl:col-span-2 bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.04)]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-4">
                <div>
                  <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Attendance Velocity</h3>
                  <p className="text-xs md:text-sm text-slate-500 font-medium mt-1">Rolling 5-day performance metrics</p>
                </div>
                <div className="flex gap-2">
                  <span className="flex items-center gap-1.5 text-[10px] md:text-xs font-black text-indigo-600 bg-indigo-50 px-4 py-2 rounded-full border border-indigo-100">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse"></div> Present
                  </span>
                  <span className="flex items-center gap-1.5 text-[10px] md:text-xs font-black text-amber-600 bg-amber-50 px-4 py-2 rounded-full border border-amber-100">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-600"></div> Late
                  </span>
                </div>
              </div>
              <div className="h-[280px] md:h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={DATA} barGap={6}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="day" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} 
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} 
                    />
                    <Tooltip 
                      cursor={{ fill: '#f8fafc' }}
                      contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="present" fill="#6366f1" radius={[8, 8, 0, 0]} barSize={20} />
                    <Bar dataKey="late" fill="#f59e0b" radius={[8, 8, 0, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.04)]">
              <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight mb-2">Compliance</h3>
              <p className="text-xs md:text-sm text-slate-500 font-medium mb-8">Punctuality snapshot</p>
              <div className="h-[200px] md:h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={PIE_DATA}
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={8}
                      dataKey="value"
                      stroke="none"
                    >
                      {PIE_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} className="outline-none" />
                      ))}
                    </Pie>
                    <Tooltip 
                       contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3 mt-8">
                {PIE_DATA.map(item => (
                  <div key={item.name} className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-slate-50 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-xs md:text-sm font-black text-slate-600">{item.name}</span>
                    </div>
                    <span className="text-xs md:text-sm font-black text-slate-900">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 pb-4">
            <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.04)]">
               <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Team Absence</h3>
                    <p className="text-xs md:text-sm text-slate-500 font-medium mt-1">Currently on authorized leave</p>
                  </div>
                  <button className="text-[10px] md:text-xs font-black text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl active:scale-95 transition-all">View All</button>
               </div>
               <div className="space-y-4">
                  {MOCK_LEAVES.map((leave) => (
                    <div key={leave.id} className="flex items-center justify-between p-4 bg-slate-50/50 border border-slate-100 rounded-3xl group hover:bg-white hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-50 transition-all duration-300">
                      <div className="flex items-center gap-4">
                        <img src={leave.avatar} alt={leave.name} className="w-12 h-12 rounded-2xl border-2 border-white shadow-sm" />
                        <div className="min-w-0">
                          <p className="text-sm font-black text-slate-900 truncate tracking-tight">{leave.name}</p>
                          <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] truncate">{leave.type}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                         <p className="text-[10px] md:text-xs font-black text-slate-700 tracking-tight">{leave.duration}</p>
                         <span className="text-[9px] md:text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-md uppercase tracking-widest mt-1 inline-block">Active</span>
                      </div>
                    </div>
                  ))}
               </div>
            </div>

            <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.04)]">
               <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Action Required</h3>
                    <p className="text-xs md:text-sm text-slate-500 font-medium mt-1">Pending correction requests</p>
                  </div>
                  <div className="w-7 h-7 bg-rose-500 text-white rounded-xl flex items-center justify-center text-[11px] font-black shadow-lg shadow-rose-200">
                    {MOCK_REGULARIZATIONS.length}
                  </div>
               </div>
               <div className="space-y-4">
                  {MOCK_REGULARIZATIONS.map((req) => (
                    <div key={req.id} className="flex items-center justify-between p-4 bg-slate-50/50 border border-slate-100 rounded-3xl group hover:bg-white hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-50 transition-all duration-300">
                      <div className="flex items-center gap-4">
                        <img src={req.avatar} alt={req.name} className="w-12 h-12 rounded-2xl border-2 border-white shadow-sm" />
                        <div className="min-w-0">
                          <p className="text-sm font-black text-slate-900 truncate tracking-tight">{req.name}</p>
                          <p className="text-[9px] md:text-[10px] font-black text-amber-600 uppercase tracking-[0.15em] truncate">{req.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                         <button className="w-10 h-10 bg-white border border-slate-200 text-emerald-600 rounded-2xl hover:bg-emerald-600 hover:text-white hover:border-emerald-600 shadow-sm transition-all active:scale-90">
                            <i className="fas fa-check text-xs"></i>
                         </button>
                         <button className="w-10 h-10 bg-white border border-slate-200 text-rose-600 rounded-2xl hover:bg-rose-600 hover:text-white hover:border-rose-600 shadow-sm transition-all active:scale-90">
                            <i className="fas fa-times text-xs"></i>
                         </button>
                      </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10 pb-4">
          <div className="bg-white p-8 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.04)]">
            <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-10 text-center md:text-left tracking-tight">Performance <span className="text-slate-400 font-medium">(Nov)</span></h3>
            <div className="grid grid-cols-3 gap-3 md:gap-8">
              <div className="p-4 md:p-8 bg-slate-50/50 border border-slate-100 rounded-3xl text-center group hover:bg-white hover:border-indigo-100 hover:shadow-xl transition-all">
                <p className="text-[9px] md:text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Present</p>
                <p className="text-3xl md:text-5xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors tracking-tight">18</p>
              </div>
              <div className="p-4 md:p-8 bg-slate-50/50 border border-slate-100 rounded-3xl text-center group hover:bg-white hover:border-amber-100 hover:shadow-xl transition-all">
                <p className="text-[9px] md:text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Late</p>
                <p className="text-3xl md:text-5xl font-black text-slate-900 group-hover:text-amber-500 transition-colors tracking-tight">02</p>
              </div>
              <div className="p-4 md:p-8 bg-slate-50/50 border border-slate-100 rounded-3xl text-center group hover:bg-white hover:border-rose-100 hover:shadow-xl transition-all">
                <p className="text-[9px] md:text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Off</p>
                <p className="text-3xl md:text-5xl font-black text-slate-900 group-hover:text-rose-500 transition-colors tracking-tight">01</p>
              </div>
            </div>
            <div className="mt-10 pt-10 border-t border-slate-100">
               <div className="flex items-center justify-between mb-4">
                  <span className="text-xs md:text-sm font-black text-slate-500 tracking-tight uppercase tracking-widest">Compliance Score</span>
                  <span className="text-xs md:text-sm font-black text-indigo-600">92%</span>
               </div>
               <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                  <div className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full shadow-lg transition-all duration-1000" style={{ width: '92%' }}></div>
               </div>
            </div>
          </div>

          <div className="bg-slate-900 p-8 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl text-white relative overflow-hidden flex flex-col justify-between min-h-[260px] group transition-all duration-500 hover:shadow-indigo-500/20">
            <div className="relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></div>
                <span className="text-[10px] md:text-[11px] font-black text-indigo-300 uppercase tracking-[0.25em]">Upcoming Shift</span>
              </div>
              <div className="flex items-center gap-5 md:gap-8 mt-6 md:mt-10">
                <div className="w-14 h-14 md:w-20 md:h-20 bg-white/5 backdrop-blur-xl rounded-[1.5rem] md:rounded-[2rem] flex items-center justify-center text-2xl md:text-4xl border border-white/10 shadow-2xl transition-transform group-hover:rotate-6">
                  <i className="fas fa-sun text-indigo-400"></i>
                </div>
                <div>
                  <p className="text-xs md:text-sm font-bold text-indigo-200 mb-1 tracking-tight">Morning General (HQ)</p>
                  <p className="text-2xl md:text-4xl font-black tracking-tighter">09:00 - 18:00</p>
                </div>
              </div>
            </div>
            <div className="relative z-10 mt-10">
              <button className="w-full h-14 md:h-16 bg-indigo-600 text-white rounded-2xl md:rounded-[1.5rem] font-black text-xs md:text-sm shadow-2xl shadow-indigo-900/50 active:scale-95 transition-all hover:bg-indigo-500 flex items-center justify-center gap-3">
                <i className="fas fa-edit"></i>
                Request Modification
              </button>
            </div>
            <i className="fas fa-clock absolute -right-12 -bottom-12 md:-right-24 md:-bottom-24 text-[180px] md:text-[320px] opacity-5 rotate-12 transition-transform duration-700 group-hover:scale-110"></i>
          </div>
        </div>
      )}

      {isRequestModalOpen && (
        <RequestModal 
          user={user} 
          onClose={() => setIsRequestModalOpen(false)} 
          showToast={showToast}
        />
      )}
    </div>
  );
};

const StatCard: React.FC<{ 
  icon: string; 
  label: string; 
  value: string; 
  trend?: string; 
  trendType?: 'up' | 'down'; 
  color?: string 
}> = ({ icon, label, value, trend, trendType, color = 'text-slate-900' }) => (
  <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-[0_10px_40px_rgba(0,0,0,0.03)] group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-indigo-100">
    <div className="flex items-center justify-between mb-8">
      <div className="w-12 h-12 bg-slate-50 text-slate-600 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
        <i className={`fas ${icon} text-xl`}></i>
      </div>
      {trend && (
        <span className={`text-[10px] font-black px-3 py-1.5 rounded-xl flex items-center gap-1.5 border ${
          trendType === 'up' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-rose-50 border-rose-100 text-rose-600'
        }`}>
          <i className={`fas ${trendType === 'up' ? 'fa-arrow-up' : 'fa-arrow-down'}`}></i>
          {trend}
        </span>
      )}
    </div>
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1.5">{label}</p>
      <p className={`text-4xl font-black tracking-tighter ${color}`}>{value}</p>
    </div>
  </div>
);

export default Dashboard;
