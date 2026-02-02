
import React, { useState, useEffect } from 'react';
import { User } from '../types';

interface RequestModalProps {
  user: User;
  onClose: () => void;
  showToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

type RequestType = 'Leave' | 'WFH' | 'Regularization';

const RequestModal: React.FC<RequestModalProps> = ({ user, onClose, showToast }) => {
  const [requestType, setRequestType] = useState<RequestType>('Leave');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fromDate: '',
    toDate: '',
    date: '',
    inTime: '',
    outTime: '',
    reason: ''
  });

  useEffect(() => {
    setFormData({ fromDate: '', toDate: '', date: '', inTime: '', outTime: '', reason: '' });
  }, [requestType]);

  const validate = () => {
    if (requestType === 'Leave') return formData.fromDate && formData.toDate && formData.reason;
    if (requestType === 'WFH') return formData.date && formData.reason;
    if (requestType === 'Regularization') return formData.date && formData.inTime && formData.outTime && formData.reason;
    return false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      showToast?.('Fill all fields', 'error');
      return;
    }
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    showToast?.(`Request sent!`, 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-3 animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-4">
        <div className="p-6 pb-4 flex items-center justify-between border-b border-slate-50 shrink-0">
          <div>
            <h3 className="text-xl font-black text-slate-900">Create Request</h3>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Manager Approval Required</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 text-slate-400"><i className="fas fa-times"></i></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Type</label>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
              {(['Leave', 'WFH', 'Regularization'] as RequestType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setRequestType(type)}
                  className={`py-2 rounded-lg text-[10px] font-black transition-all ${requestType === type ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {requestType === 'Leave' && (
              <div className="grid grid-cols-2 gap-3">
                <input type="date" value={formData.fromDate} onChange={e => setFormData({...formData, fromDate: e.target.value})} className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs font-bold outline-none" />
                <input type="date" value={formData.toDate} onChange={e => setFormData({...formData, toDate: e.target.value})} className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs font-bold outline-none" />
              </div>
            )}
            {(requestType === 'WFH' || requestType === 'Regularization') && (
              <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs font-bold outline-none" />
            )}
            {requestType === 'Regularization' && (
              <div className="grid grid-cols-2 gap-3">
                <input type="time" value={formData.inTime} onChange={e => setFormData({...formData, inTime: e.target.value})} className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs font-bold outline-none" />
                <input type="time" value={formData.outTime} onChange={e => setFormData({...formData, outTime: e.target.value})} className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs font-bold outline-none" />
              </div>
            )}
            <textarea placeholder="Brief reason..." rows={2} value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs font-bold outline-none resize-none" />
          </div>

          <div className="pt-2 flex gap-3 shrink-0">
            <button type="button" onClick={onClose} className="flex-1 h-12 bg-slate-50 text-slate-500 rounded-xl font-black text-xs">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 h-12 bg-indigo-600 text-white rounded-xl font-black text-xs shadow-xl active:scale-95 transition-all">
              {loading ? 'Sending...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequestModal;
