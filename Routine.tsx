import React from 'react';
import { WorkItem, User } from '../types';
import { Check, Clock, AlertCircle } from 'lucide-react';

interface TasksProps {
  tasks: WorkItem[];
  setTasks: React.Dispatch<React.SetStateAction<WorkItem[]>>;
  currentUser: User;
}

export const Tasks: React.FC<TasksProps> = ({ tasks, setTasks, currentUser }) => {

  const myTasks = tasks.filter(t => t.ownerId === currentUser.id || t.executorIds.includes(currentUser.id) || t.viewPermission === 'all');

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => 
      t.id === id ? { ...t, status: t.status === 'done' ? 'pending' : 'done' } : t
    ));
    // In real app, sync with server here
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('he-IL');
  };

  const pendingCount = myTasks.filter(t => t.status !== 'done').length;

  return (
    <div className="max-w-3xl mx-auto animate-fade-in pb-20">
      <div className="mb-8">
         <h2 className="text-3xl font-bold text-gray-800">משימות ועדכונים</h2>
         <p className="text-gray-500 mt-1">
           {pendingCount > 0 
             ? `יש לך ${pendingCount} משימות פתוחות`
             : 'כל הכבוד! סיימת את כל המשימות.'
           }
         </p>
      </div>

      {myTasks.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-200">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-800">אין משימות חדשות</h3>
          <p className="text-gray-500">כרגע הכל נקי.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {myTasks.map((task) => (
            <div 
              key={task.id}
              className={`relative overflow-hidden p-5 rounded-2xl border transition-all ${
                task.status === 'done'
                  ? 'bg-gray-50 border-gray-200 opacity-60' 
                  : 'bg-white border-blue-100 shadow-sm hover:shadow-md'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Checkbox */}
                <button
                  onClick={() => toggleTask(task.id)}
                  className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
                    task.status === 'done'
                      ? 'bg-green-500 border-green-500' 
                      : 'border-gray-300 hover:border-blue-400'
                  }`}
                >
                  {task.status === 'done' && <Check size={14} className="text-white" />}
                </button>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                     <h3 className={`font-bold text-lg ${task.status === 'done' ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                       {task.title}
                     </h3>
                     {task.ownerId !== currentUser.id && task.status !== 'done' && (
                       <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full whitespace-nowrap">
                         כללי
                       </span>
                     )}
                     {task.ownerId === currentUser.id && task.status !== 'done' && (
                       <span className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full whitespace-nowrap">
                         אישי
                       </span>
                     )}
                  </div>
                  
                  <p className={`mt-2 text-sm ${task.status === 'done' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {task.content}
                  </p>

                  <div className="mt-4 flex items-center gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {formatDate(task.createdAt)}
                    </span>
                    {task.expiryDate && (
                      <span className="flex items-center gap-1 text-red-400">
                        <AlertCircle size={12} />
                        עד: {task.expiryDate}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};