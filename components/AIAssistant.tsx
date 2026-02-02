
import React, { useState } from 'react';
import { User, Role } from '../types';
import { getAttendanceInsights } from '../services/geminiService';

interface AIAssistantProps {
  user: User;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ user }) => {
  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState<string | null>(null);

  const generateInsights = async () => {
    setLoading(true);
    // Simulated attendance data
    const dummyData = [
      { name: 'John', lateCount: 4, absentCount: 1 },
      { name: 'Sarah', lateCount: 0, absentCount: 0 },
      { name: 'Mike', lateCount: 1, absentCount: 3 },
    ];
    const result = await getAttendanceInsights(dummyData);
    setInsight(result || "No data insights available.");
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 rounded-2xl text-white flex items-center justify-between shadow-xl">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold">HR Intelligence Engine</h2>
          <p className="text-indigo-100 max-w-md">Use Gemini AI to detect patterns, predict burnout, and optimize staffing schedules based on attendance data.</p>
        </div>
        <div className="hidden md:block">
          <i className="fas fa-brain text-7xl opacity-30"></i>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">AI Analysis Tools</h3>
            <div className="space-y-3">
              <button 
                onClick={generateInsights}
                disabled={loading}
                className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-indigo-50 transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <i className="fas fa-chart-line"></i>
                  </div>
                  <span className="text-sm font-bold text-gray-700">Attendance Trends</span>
                </div>
                <i className="fas fa-chevron-right text-gray-300"></i>
              </button>
              
              <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-indigo-50 transition-colors group">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
                    <i className="fas fa-calendar-check"></i>
                  </div>
                  <span className="text-sm font-bold text-gray-700">Predictive Scheduling</span>
                </div>
                <i className="fas fa-chevron-right text-gray-300"></i>
              </button>

              <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-indigo-50 transition-colors group">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-amber-100 text-amber-600 rounded flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
                    <i className="fas fa-shield-virus"></i>
                  </div>
                  <span className="text-sm font-bold text-gray-700">Anomaly Detection</span>
                </div>
                <i className="fas fa-chevron-right text-gray-300"></i>
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-full flex flex-col">
            <h3 className="font-bold text-gray-900 mb-6 flex items-center">
              <i className="fas fa-comment-dots mr-2 text-indigo-500"></i> AI Output
            </h3>
            
            <div className="flex-1 bg-gray-50 rounded-xl p-6 relative overflow-y-auto max-h-[400px]">
              {loading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-50/80">
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-indigo-600 font-bold">Analyzing Multi-Client Data...</p>
                  </div>
                </div>
              ) : insight ? (
                <div className="prose prose-indigo max-w-none">
                  <p className="whitespace-pre-wrap text-gray-700 text-sm leading-relaxed">
                    {insight}
                  </p>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 space-y-4">
                  <i className="fas fa-robot text-5xl opacity-20"></i>
                  <p className="max-w-xs font-medium">Select an analysis tool on the left to generate insights based on current client data.</p>
                </div>
              )}
            </div>
            
            <div className="mt-6 flex space-x-2">
              <input 
                type="text" 
                placeholder="Ask HR assistant anything..." 
                className="flex-1 bg-gray-50 border-none rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500"
              />
              <button className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700">
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
