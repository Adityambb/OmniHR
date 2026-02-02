
import React, { useState } from 'react';
import { User, Role, LeaveRequest } from '../types';

interface LeaveManagementProps {
  user: User;
}

const MOCK_LEAVES: (LeaveRequest & { employeeName?: string })[] = [
  { id: 'l1', userId: 'u4', startDate: '2023-10-25', endDate: '2023-10-26', type: 'SICK', status: 'APPROVED', reason: 'Flu recovery', employeeName: 'Alex Johnson' },
  { id: 'l2', userId: 'u4', startDate: '2023-11-10', endDate: '2023-11-15', type: 'VACATION', status: 'PENDING', reason: 'Family trip', employeeName: 'Alex Johnson' },
  { id: 'l3', userId: 'u5', startDate: '2023-11-20', endDate: '2023-11-21', type: 'CASUAL', status: 'PENDING', reason: 'Personal work', employeeName: 'Sarah Miller' },
];

const LeaveManagement: React.FC<LeaveManagementProps> = ({ user }) => {
  const [requests, setRequests] = useState(MOCK_LEAVES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [newRequest, setNewRequest] = useState({
    type: 'CASUAL',
    startDate: '',
    endDate: '',
    reason: ''
  });

  const isHRorManager = user.role === Role.HR || user.role === Role.ADMIN || user.role === Role.MANAGER;

  const handleApplyLeave = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    const req: any = {
      id: `l-${Date.now()}`,
      userId: user.id,
      startDate: newRequest.startDate,
      endDate: newRequest.endDate,
      type: newRequest.type,
      status: 'PENDING',
      reason: newRequest.reason,
      employeeName: user.name
    };
    setRequests([req, ...requests]);
    setIsModalOpen(false);
    setNewRequest({ type: 'CASUAL', startDate: '', endDate: '', reason: '' });
    setLoading(false);
  };

  const handleUpdateStatus = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setRequests(requests.map(r => r.id === id ? { ...r, status } : r));
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-700 border-green-200';
      case 'REJECTED': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-amber-100 text-amber-700 border-amber-200';
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Responsive Header - No Clustering */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 px-1 py-2">
        <div className="text-center sm:text-left space-y-1">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter">Leave Management</h2>
          <p className="text-slate-500 font-medium text-xs md:text-sm">Track and manage time-off requests.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-200 active:scale-95 flex items-center justify-center gap-3"
        >
          <i className="fas fa-plus"></i> Request Leave
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Balance Remaining</p>
          <p className="text-3xl font-black text-slate-900">14 Days</p>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Used This Year</p>
          <p className="text-3xl font-black text-indigo-600">6 Days</p>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Pending Requests</p>
          <p className="text-3xl font-black text-amber-500">
            {requests.filter(r => r.status === 'PENDING').length}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-xl shadow-slate-200/50">
        <div className="p-6 md:p-8 border-b border-slate-50 flex items-center justify-between">
          <h3 className="text-lg font-black text-slate-900">Request History</h3>
          <div className="flex items-center gap-2">
             <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Filter: All</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead className="bg-slate-50/50">
              <tr>
                {isHRorManager && <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Employee</th>}
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Dates</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest hidden md:table-cell">Reason</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {requests.map(req => (
                <tr key={req.id} className="hover:bg-slate-50/50 transition-colors group">
                  {isHRorManager && (
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-black">
                          {req.employeeName?.charAt(0)}
                        </div>
                        <span className="text-sm font-bold text-slate-900">{req.employeeName}</span>
                      </div>
                    </td>
                  )}
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${
                      req.type === 'SICK' ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600'
                    }`}>
                      {req.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-black text-slate-900">{req.startDate}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">to {req.endDate}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-wider ${getStatusColor(req.status)}`}>
                      <span className={`w-1.5 h-1.5 rounded-full mr-2 ${
                        req.status === 'APPROVED' ? 'bg-emerald-500' : req.status === 'REJECTED' ? 'bg-rose-500' : 'bg-amber-500'
                      }`}></span>
                      {req.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <p className="text-xs text-slate-500 italic max-w-xs truncate" title={req.reason}>
                      "{req.reason}"
                    </p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {isHRorManager && req.status === 'PENDING' ? (
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleUpdateStatus(req.id, 'APPROVED')}
                          disabled={loading}
                          className="w-9 h-9 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all disabled:opacity-50"
                        >
                          <i className="fas fa-check text-xs"></i>
                        </button>
                        <button 
                          onClick={() => handleUpdateStatus(req.id, 'REJECTED')}
                          disabled={loading}
                          className="w-9 h-9 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all disabled:opacity-50"
                        >
                          <i className="fas fa-times text-xs"></i>
                        </button>
                      </div>
                    ) : (
                      <button className="w-9 h-9 bg-slate-50 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all">
                        <i className="fas fa-eye text-xs"></i>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Leave Request Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-8 md:p-10 bg-indigo-600 text-white relative text-center sm:text-left">
              <h3 className="text-2xl font-black tracking-tight">New Request</h3>
              <p className="text-indigo-100 font-medium mt-1">Submit your time-off request for review.</p>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="absolute top-8 right-8 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-all"
              >
                <i className="fas fa-times text-lg"></i>
              </button>
            </div>
            
            <div className="p-8 md:p-10 space-y-8">
              <div className="space-y-3 text-center sm:text-left">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Leave Type</label>
                <div className="grid grid-cols-3 gap-3">
                  {['CASUAL', 'SICK', 'VACATION'].map(t => (
                    <button
                      key={t}
                      onClick={() => setNewRequest({...newRequest, type: t})}
                      className={`py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all border-2 ${
                        newRequest.type === t 
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-600 shadow-md' 
                          : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-100'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Start Date</label>
                  <input 
                    type="date" 
                    value={newRequest.startDate}
                    onChange={(e) => setNewRequest({...newRequest, startDate: e.target.value})}
                    className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl py-3.5 px-4 focus:bg-white focus:border-indigo-500 transition-all outline-none font-bold text-slate-700 text-sm" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">End Date</label>
                  <input 
                    type="date" 
                    value={newRequest.endDate}
                    onChange={(e) => setNewRequest({...newRequest, endDate: e.target.value})}
                    className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl py-3.5 px-4 focus:bg-white focus:border-indigo-500 transition-all outline-none font-bold text-slate-700 text-sm" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Reason</label>
                <textarea 
                  value={newRequest.reason}
                  onChange={(e) => setNewRequest({...newRequest, reason: e.target.value})}
                  className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl py-4 px-5 h-28 focus:bg-white focus:border-indigo-500 transition-all outline-none font-bold text-slate-700 text-sm resize-none" 
                  placeholder="Tell us why you need this leave..."
                ></textarea>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-50">
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  className="flex-1 h-14 bg-slate-100 text-slate-500 rounded-2xl font-black text-sm active:scale-95 transition-all"
                >
                  Discard
                </button>
                <button 
                  onClick={handleApplyLeave}
                  disabled={loading || !newRequest.startDate || !newRequest.endDate || !newRequest.reason}
                  className="flex-1 h-14 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-2xl shadow-indigo-100 active:scale-95 transition-all disabled:opacity-50"
                >
                  {loading ? <i className="fas fa-spinner fa-spin mr-2"></i> : 'Submit Request'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveManagement;
