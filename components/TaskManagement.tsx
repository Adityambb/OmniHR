
import React, { useState } from 'react';
import { User, Role, Task, TaskStatus } from '../types';

interface TaskManagementProps {
  user: User;
}

const MOCK_TASKS: Task[] = [
  {
    id: 't1',
    clientId: 'client_001',
    title: 'Complete Onboarding',
    description: 'Finalize the HR portal setup for the new team members.',
    assignedTo: 'emp@tech.com',
    assignedBy: 'admin@tech.com',
    dueDate: '2023-12-01',
    status: TaskStatus.IN_PROGRESS,
  },
  {
    id: 't2',
    clientId: 'client_001',
    title: 'Review Leave Policy',
    description: 'Update the casual leave allowance for the upcoming year.',
    assignedTo: 'hr@tech.com',
    assignedBy: 'admin@tech.com',
    dueDate: '2023-11-28',
    status: TaskStatus.COMPLETED,
  },
];

const TaskManagement: React.FC<TaskManagementProps> = ({ user }) => {
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assignedTo: '',
    dueDate: '',
  });

  const canCreateTask = [Role.ADMIN, Role.HR, Role.MANAGER].includes(user.role);

  const handleCreateTask = () => {
    const task: Task = {
      id: `t-${Date.now()}`,
      clientId: user.clientId,
      title: newTask.title,
      description: newTask.description,
      assignedTo: newTask.assignedTo || user.email,
      assignedBy: user.email,
      dueDate: newTask.dueDate,
      status: TaskStatus.PENDING,
    };
    setTasks([task, ...tasks]);
    setIsModalOpen(false);
    setNewTask({ title: '', description: '', assignedTo: '', dueDate: '' });
  };

  const toggleTaskStatus = (id: string) => {
    setTasks(tasks.map(t => {
      if (t.id === id) {
        const nextStatus = t.status === TaskStatus.COMPLETED ? TaskStatus.PENDING : TaskStatus.COMPLETED;
        return { ...t, status: nextStatus };
      }
      return t;
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Task Management</h2>
          <p className="text-gray-500">Assign and track work items across your team.</p>
        </div>
        {canCreateTask && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-md"
          >
            <i className="fas fa-plus mr-2"></i> Create Task
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm font-medium text-gray-500 mb-1 uppercase tracking-wider">Total Tasks</p>
          <p className="text-3xl font-bold text-gray-900">{tasks.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm border-l-4 border-l-green-500">
          <p className="text-sm font-medium text-gray-500 mb-1 uppercase tracking-wider">Completed</p>
          <p className="text-3xl font-bold text-green-600">{tasks.filter(t => t.status === TaskStatus.COMPLETED).length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm border-l-4 border-l-amber-500">
          <p className="text-sm font-medium text-gray-500 mb-1 uppercase tracking-wider">Pending</p>
          <p className="text-3xl font-bold text-amber-600">{tasks.filter(t => t.status !== TaskStatus.COMPLETED).length}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider w-12">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Task Details</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Assigned To</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Due Date</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {tasks.map(task => (
              <tr key={task.id} className="hover:bg-gray-50 transition-colors group">
                <td className="px-6 py-4">
                  <button 
                    onClick={() => toggleTaskStatus(task.id)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      task.status === TaskStatus.COMPLETED 
                        ? 'bg-green-500 border-green-500 text-white' 
                        : 'border-gray-300 hover:border-indigo-400'
                    }`}
                  >
                    {task.status === TaskStatus.COMPLETED && <i className="fas fa-check text-xs"></i>}
                  </button>
                </td>
                <td className="px-6 py-4">
                  <h4 className={`text-sm font-bold ${task.status === TaskStatus.COMPLETED ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                    {task.title}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1 max-w-md truncate">{task.description}</p>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-[10px] font-bold">
                      {task.assignedTo.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm text-gray-600">{task.assignedTo}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-xs font-medium ${new Date(task.dueDate) < new Date() && task.status !== TaskStatus.COMPLETED ? 'text-red-600 font-bold' : 'text-gray-500'}`}>
                    <i className="far fa-calendar mr-1"></i> {task.dueDate}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                   <button className="text-gray-400 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                     <i className="fas fa-ellipsis-v"></i>
                   </button>
                </td>
              </tr>
            ))}
            {tasks.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic text-sm">
                  No tasks found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Task Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 bg-indigo-600 text-white flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold">New Project Task</h3>
                <p className="text-xs text-indigo-100 mt-1 opacity-80">Define goals and assign them to members</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="hover:opacity-70 transition-opacity p-2">
                <i className="fas fa-times text-lg"></i>
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Task Title</label>
                <input 
                  type="text" 
                  placeholder="e.g. Prepare Quarter Report"
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  className="w-full bg-gray-50 border-2 border-gray-50 rounded-xl py-3 px-4 focus:bg-white focus:border-indigo-500 transition-all outline-none font-medium text-gray-700"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Description</label>
                <textarea 
                  placeholder="Describe the objective..."
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  className="w-full bg-gray-50 border-2 border-gray-50 rounded-xl py-3 px-4 h-24 focus:bg-white focus:border-indigo-500 transition-all outline-none font-medium text-gray-700 resize-none"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Assigned To</label>
                  <input 
                    type="email" 
                    placeholder="email@example.com"
                    value={newTask.assignedTo}
                    onChange={(e) => setNewTask({...newTask, assignedTo: e.target.value})}
                    className="w-full bg-gray-50 border-2 border-gray-50 rounded-xl py-3 px-4 focus:bg-white focus:border-indigo-500 transition-all outline-none font-medium text-gray-700"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Due Date</label>
                  <input 
                    type="date" 
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                    className="w-full bg-gray-50 border-2 border-gray-50 rounded-xl py-3 px-4 focus:bg-white focus:border-indigo-500 transition-all outline-none font-medium text-gray-700"
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-4 border-t border-gray-50">
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                >
                  Discard
                </button>
                <button 
                  onClick={handleCreateTask}
                  disabled={!newTask.title || !newTask.dueDate}
                  className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  Create Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskManagement;
