
import React, { useState } from 'react';
import { Client, Role } from '../types';

interface AdminPanelProps {
  client: Client;
  setClient: (c: Client) => void;
}

type AdminSubTab = 'settings' | 'employees' | 'shifts' | 'summary' | 'clients';

const AdminPanel: React.FC<AdminPanelProps> = ({ client, setClient }) => {
  const [activeSubTab, setActiveSubTab] = useState<AdminSubTab>('settings');
  const [showAddModal, setShowAddModal] = useState(false);

  const updateSettings = (key: string, value: any) => {
    setClient({
      ...client,
      settings: {
        ...client.settings,
        [key]: value
      }
    });
  };

  const menuItems = [
    { id: 'settings', label: 'Company Settings', icon: 'fa-sliders-h' },
    { id: 'employees', label: 'Employee Directory', icon: 'fa-users' },
    { id: 'shifts', label: 'Shift Planning', icon: 'fa-business-time' },
    { id: 'summary', label: 'Attendance Summary', icon: 'fa-file-invoice' },
    { id: 'clients', label: 'Client Manager', icon: 'fa-globe' },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Sidebar Navigation */}
      <div className="lg:w-64 flex-shrink-0 space-y-1">
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveSubTab(item.id as AdminSubTab)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
              activeSubTab === item.id 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                : 'text-gray-500 hover:bg-white hover:text-indigo-600'
            }`}
          >
            <i className={`fas ${item.icon} w-5`}></i>
            <span className="font-bold text-sm">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 space-y-6 min-h-[600px]">
        {activeSubTab === 'settings' && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6">
            <div className="flex items-center space-x-3 mb-2">
              <h2 className="text-2xl font-bold text-gray-900">Company Settings</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-lg font-bold mb-6 flex items-center">
                  <i className="fas fa-clock mr-2 text-indigo-500"></i> Time & Attendance Rules
                </h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Grace Period</p>
                      <p className="text-[10px] text-gray-500">Allowed delay minutes after shift start</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input 
                        type="number" 
                        value={client.settings.gracePeriodMinutes}
                        onChange={(e) => updateSettings('gracePeriodMinutes', parseInt(e.target.value))}
                        className="w-16 p-2 bg-gray-50 border border-gray-100 rounded-lg text-center text-sm font-bold"
                      />
                      <span className="text-xs text-gray-400 font-bold uppercase">min</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Half Day Threshold</p>
                      <p className="text-[10px] text-gray-500">Minimum hours for a half-day credit</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input 
                        type="number" 
                        value={client.settings.halfDayThresholdHours}
                        onChange={(e) => updateSettings('halfDayThresholdHours', parseInt(e.target.value))}
                        className="w-16 p-2 bg-gray-50 border border-gray-100 rounded-lg text-center text-sm font-bold"
                      />
                      <span className="text-xs text-gray-400 font-bold uppercase">hrs</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-lg font-bold mb-6 flex items-center">
                  <i className="fas fa-shield-alt mr-2 text-indigo-500"></i> Verification Policies
                </h3>
                <div className="space-y-6">
                  <label className="flex items-center justify-between cursor-pointer group">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm group-hover:text-indigo-600 transition-colors">Require Geolocation</p>
                      <p className="text-[10px] text-gray-500">Users must share GPS to punch in</p>
                    </div>
                    <div className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={client.settings.requireGPS}
                        onChange={(e) => updateSettings('requireGPS', e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </div>
                  </label>

                  <label className="flex items-center justify-between cursor-pointer group">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm group-hover:text-indigo-600 transition-colors">Selfie Verification</p>
                      <p className="text-[10px] text-gray-500">Facial capture required for punches</p>
                    </div>
                    <div className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={client.settings.requireSelfie}
                        onChange={(e) => updateSettings('requireSelfie', e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'employees' && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Employee Directory</h2>
              <button 
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-100"
              >
                <i className="fas fa-plus mr-2"></i> Add Employee
              </button>
            </div>
            
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
               <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center">
                  <div className="relative flex-1">
                    <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                    <input type="text" placeholder="Search by name, email or code..." className="w-full pl-11 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                  </div>
               </div>
               <table className="w-full text-left">
                  <thead className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    <tr>
                      <th className="px-6 py-4">Employee</th>
                      <th className="px-6 py-4">Designation</th>
                      <th className="px-6 py-4">Branch</th>
                      <th className="px-6 py-4">Shift</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {[
                      { name: 'Alex Thompson', email: 'alex@tech.com', code: 'EMP001', role: 'Developer', branch: 'Main HQ', shift: 'Morning' },
                      { name: 'Sarah Miller', email: 'sarah@tech.com', code: 'EMP002', role: 'Designer', branch: 'Design Hub', shift: 'Morning' },
                      { name: 'Mike Ross', email: 'mike@tech.com', code: 'EMP003', role: 'Support', branch: 'Main HQ', shift: 'Night' },
                    ].map((emp, i) => (
                      <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">{emp.name.charAt(0)}</div>
                            <div>
                              <p className="text-sm font-bold text-gray-900">{emp.name}</p>
                              <p className="text-[10px] text-gray-400">{emp.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 font-medium">{emp.role}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 font-medium">{emp.branch}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-amber-50 text-amber-600 rounded-lg text-[10px] font-bold uppercase">{emp.shift}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-gray-400 hover:text-indigo-600 transition-colors"><i className="fas fa-edit"></i></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
               </table>
            </div>
          </div>
        )}

        {activeSubTab === 'shifts' && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6">
             <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Shift Planner</h2>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-100">
                <i className="fas fa-plus mr-2"></i> Create Shift
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { name: 'Morning General', time: '09:00 - 18:00', employees: 42, color: 'bg-blue-500' },
                { name: 'Afternoon Shift', time: '14:00 - 22:00', employees: 18, color: 'bg-orange-500' },
                { name: 'Night Shift', time: '22:00 - 06:00', employees: 12, color: 'bg-indigo-900' },
              ].map((shift, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-indigo-200 transition-all">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-xl ${shift.color} text-white flex items-center justify-center text-xl shadow-lg shadow-gray-100`}>
                      <i className="fas fa-clock"></i>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{shift.name}</h4>
                      <p className="text-sm text-gray-500">{shift.time}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-indigo-600 mb-1">{shift.employees} Staff</p>
                    <button className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-indigo-600">Assign Members</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSubTab === 'summary' && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Attendance Summary</h2>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 overflow-hidden">
              <div className="flex items-center justify-between mb-8">
                 <div className="flex items-center space-x-4">
                    <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                       <i className="fas fa-chart-line"></i>
                    </div>
                    <div>
                       <p className="text-sm font-bold text-gray-900">Attendance Rate</p>
                       <p className="text-[10px] text-gray-400 uppercase tracking-widest">Current Month</p>
                    </div>
                 </div>
                 <div className="text-3xl font-black text-indigo-600">94.2%</div>
              </div>
              <div className="space-y-4">
                <div className="h-2 bg-gray-50 rounded-full overflow-hidden">
                   <div className="h-full bg-indigo-600 rounded-full w-[94%]"></div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                   <div className="text-center">
                      <p className="text-[10px] font-bold text-gray-400 uppercase">On-Time</p>
                      <p className="text-lg font-bold text-gray-900">88%</p>
                   </div>
                   <div className="text-center border-l border-r border-gray-50">
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Late</p>
                      <p className="text-lg font-bold text-amber-600">6.2%</p>
                   </div>
                   <div className="text-center">
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Absent</p>
                      <p className="text-lg font-bold text-red-600">5.8%</p>
                   </div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
                <h4 className="font-bold text-gray-900 text-sm">Top Absentees (Outliers)</h4>
                <button className="text-xs text-indigo-600 font-bold hover:underline">View All</button>
              </div>
              <table className="w-full text-left">
                <tbody className="divide-y divide-gray-50">
                  {[
                    { name: 'John Doe', missing: 4, reason: 'Health issues' },
                    { name: 'Mary Jane', missing: 3, reason: 'Commute issues' },
                  ].map((u, i) => (
                    <tr key={i} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-gray-900">{u.name}</p>
                        <p className="text-[10px] text-gray-400">{u.reason}</p>
                      </td>
                      <td className="px-6 py-4 text-right text-red-600 font-bold text-sm">-{u.missing} days</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeSubTab === 'clients' && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Global Client Manager</h2>
              <button className="px-4 py-2 bg-indigo-900 text-white rounded-xl font-bold text-sm hover:bg-black shadow-lg shadow-gray-100">
                <i className="fas fa-plus mr-2"></i> Register New Client
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {[
                 { name: 'TechFlow', id: 'client_001', staff: 156, status: 'Active' },
                 { name: 'Global Logistics', id: 'client_002', staff: 480, status: 'Active' },
                 { name: 'Creative Agency', id: 'client_003', staff: 24, status: 'Pending' },
               ].map((c, i) => (
                 <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative group overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button className="text-gray-300 hover:text-indigo-600"><i className="fas fa-ellipsis-h"></i></button>
                    </div>
                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center mb-4 font-bold text-xs uppercase">{c.name.substring(0, 2)}</div>
                    <h4 className="font-bold text-gray-900 truncate">{c.name}</h4>
                    <p className="text-[10px] text-gray-400 mb-4 font-mono">{c.id}</p>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                       <span className="text-xs font-bold text-gray-500">{c.staff} Staff</span>
                       <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-tighter ${c.status === 'Active' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>{c.status}</span>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        )}
      </div>

      {/* Simplified Add Employee Modal Placeholder */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
             <div className="p-8 bg-indigo-600 text-white flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold">Add New Employee</h3>
                  <p className="text-indigo-100 text-sm mt-1 opacity-80">Setup credentials and profile</p>
                </div>
                <button onClick={() => setShowAddModal(false)}><i className="fas fa-times text-xl"></i></button>
             </div>
             <div className="p-8 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">First Name</label>
                      <input type="text" className="w-full bg-gray-50 border-2 border-gray-50 rounded-xl py-3 px-4 focus:bg-white focus:border-indigo-500 outline-none transition-all" />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Last Name</label>
                      <input type="text" className="w-full bg-gray-50 border-2 border-gray-50 rounded-xl py-3 px-4 focus:bg-white focus:border-indigo-500 outline-none transition-all" />
                   </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                  <input type="email" className="w-full bg-gray-50 border-2 border-gray-50 rounded-xl py-3 px-4 focus:bg-white focus:border-indigo-500 outline-none transition-all" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Role</label>
                      <select className="w-full bg-gray-50 border-2 border-gray-50 rounded-xl py-3 px-4 focus:bg-white focus:border-indigo-500 outline-none transition-all">
                        <option>EMPLOYEE</option>
                        <option>MANAGER</option>
                        <option>HR</option>
                      </select>
                   </div>
                   <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Shift</label>
                      <select className="w-full bg-gray-50 border-2 border-gray-50 rounded-xl py-3 px-4 focus:bg-white focus:border-indigo-500 outline-none transition-all">
                        <option>Morning</option>
                        <option>Evening</option>
                        <option>Night</option>
                      </select>
                   </div>
                </div>
                <div className="pt-6 border-t border-gray-50 flex space-x-3">
                   <button onClick={() => setShowAddModal(false)} className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-bold hover:bg-gray-200 transition-colors">Cancel</button>
                   <button onClick={() => setShowAddModal(false)} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all">Create Profile</button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
