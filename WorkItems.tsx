import React, { useState } from 'react';
import { WorkItem, User, Priority } from '../types';
import { PRIORITY_LABELS, STATUS_LABELS } from '../constants';
import { CheckCircle, Clock, LayoutGrid, List, MapPin, Eye, EyeOff, Settings2, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface WorkItemsProps {
  items: WorkItem[];
  setItems: React.Dispatch<React.SetStateAction<WorkItem[]>>;
  currentUser: User;
  isImportantMode?: boolean; // New prop for "Important" page
}

export const WorkItems: React.FC<WorkItemsProps> = ({ items, setItems, currentUser, isImportantMode = false }) => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'list' | 'cards'>('cards');
  const [filter, setFilter] = useState<'all' | 'my'>('all');
  
  // View Settings State
  const [showSettings, setShowSettings] = useState(false);
  const [visibleFields, setVisibleFields] = useState({
      date: false,
      status: true,
      priority: false,
      location: false
  });

  // Filter Logic
  const visibleItems = items.filter(item => {
      if (item.status === 'archived') return false; 
      
      // Permission check
      const canView = item.viewPermission === 'all' || 
                      (item.viewPermission === 'manager' && (currentUser.role === 'admin' || currentUser.role === 'manager')) ||
                      (Array.isArray(item.viewPermission) && item.viewPermission.includes(currentUser.id));
      
      if (!canView) return false;

      // Important Mode Filter
      if (isImportantMode) {
          return item.priority === 'high' || item.priority === 'critical';
      }

      // Tab Filter
      if (filter === 'my') {
          return item.ownerId === currentUser.id || item.executorIds.includes(currentUser.id);
      }
      return true;
  });

  const getPriorityColor = (p: Priority) => {
      switch (p) {
          case 'critical': return 'bg-red-100 text-red-700 border-red-200';
          case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
          case 'low': return 'bg-green-100 text-green-700 border-green-200';
          default: return 'bg-blue-50 text-blue-700 border-blue-200';
      }
  };

  const handleMarkDone = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      setItems(prev => prev.map(item => {
          if (item.id === id) {
              const isDone = item.status === 'done';
              return { ...item, status: isDone ? 'pending' : 'done' };
          }
          return item;
      }));
  };

  const handleRead = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      setItems(prev => prev.map(item => {
          if (item.id === id) {
              const hasRead = item.readBy.includes(currentUser.id);
              return { ...item, readBy: hasRead ? item.readBy : [...item.readBy, currentUser.id] };
          }
          return item;
      }));
  };

  return (
    <div className="animate-fade-in pb-24">
      {/* Header */}
      <div className="flex flex-col gap-4 mb-6">
         <div className="flex justify-between items-center">
            <div>
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    {isImportantMode && <AlertTriangle className="text-orange-500" />}
                    {isImportantMode ? 'דברים חשובים' : 'משימות והודעות'}
                </h2>
                <p className="text-gray-500 text-sm">
                    {isImportantMode ? 'פריטים בעדיפות גבוהה וקריטית' : 'לוח עבודה משותף'}
                </p>
            </div>

            {/* View Controls */}
            <div className="flex items-center gap-2">
                 <div className="relative">
                    <button 
                        onClick={() => setShowSettings(!showSettings)} 
                        className={`p-2 rounded-full border transition-colors ${showSettings ? 'bg-blue-100 border-blue-300 text-blue-600' : 'bg-white border-gray-200 text-gray-500'}`}
                        title="הגדרות תצוגה"
                    >
                        <Eye size={20} />
                    </button>
                    
                    {/* Popover for Settings */}
                    {showSettings && (
                        <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 p-4 w-48 z-10 animate-fade-in-up">
                            <h4 className="text-xs font-bold text-gray-400 mb-2 uppercase">הצג בכרטיסייה</h4>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm cursor-pointer">
                                    <input type="checkbox" checked={visibleFields.date} onChange={() => setVisibleFields({...visibleFields, date: !visibleFields.date})} className="accent-blue-600"/> תאריך
                                </label>
                                <label className="flex items-center gap-2 text-sm cursor-pointer">
                                    <input type="checkbox" checked={visibleFields.status} onChange={() => setVisibleFields({...visibleFields, status: !visibleFields.status})} className="accent-blue-600"/> סטטוס
                                </label>
                                <label className="flex items-center gap-2 text-sm cursor-pointer">
                                    <input type="checkbox" checked={visibleFields.priority} onChange={() => setVisibleFields({...visibleFields, priority: !visibleFields.priority})} className="accent-blue-600"/> עדיפות
                                </label>
                                <label className="flex items-center gap-2 text-sm cursor-pointer">
                                    <input type="checkbox" checked={visibleFields.location} onChange={() => setVisibleFields({...visibleFields, location: !visibleFields.location})} className="accent-blue-600"/> מיקום
                                </label>
                            </div>
                        </div>
                    )}
                 </div>
                 
                 <div className="flex items-center gap-1 bg-white p-1 rounded-lg border shadow-sm">
                     <button onClick={() => setViewMode('cards')} className={`p-2 rounded ${viewMode === 'cards' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}><LayoutGrid size={18}/></button>
                     <button onClick={() => setViewMode('list')} className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}><List size={18}/></button>
                 </div>
            </div>
         </div>
      </div>

      {/* Filter Tabs (Only in main mode) */}
      {!isImportantMode && (
          <div className="flex gap-4 mb-6 text-sm border-b">
              <button onClick={() => setFilter('all')} className={`pb-2 px-1 ${filter === 'all' ? 'border-b-2 border-blue-600 font-bold text-blue-600' : 'text-gray-500'}`}>הכל</button>
              <button onClick={() => setFilter('my')} className={`pb-2 px-1 ${filter === 'my' ? 'border-b-2 border-blue-600 font-bold text-blue-600' : 'text-gray-500'}`}>שלי / באחריותי</button>
          </div>
      )}

      <div className={viewMode === 'cards' ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "space-y-3"}>
         {visibleItems.map(item => (
             <div 
               key={item.id}
               onClick={() => navigate(`/item/${item.id}`)}
               className={`border rounded-xl p-4 cursor-pointer hover:shadow-lg transition-all relative overflow-hidden group flex flex-col ${item.status === 'done' ? 'opacity-70' : ''}`}
               style={{ backgroundColor: item.backgroundColor || 'white' }}
             >
                 {/* Status Stripe */}
                 <div className={`absolute top-0 right-0 bottom-0 w-1 ${item.status === 'done' ? 'bg-green-500' : 'bg-blue-500'}`}></div>

                 <div className="flex justify-between items-start mb-2 pr-3">
                     <div className="flex gap-2">
                        {visibleFields.priority && (
                            <span className={`text-xs px-2 py-0.5 rounded-full border ${getPriorityColor(item.priority)}`}>
                                {PRIORITY_LABELS[item.priority]}
                            </span>
                        )}
                        {visibleFields.status && (
                             <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                                {STATUS_LABELS[item.status]}
                             </span>
                        )}
                     </div>
                     {visibleFields.location && item.location && <MapPin size={14} className="text-gray-400" />}
                 </div>

                 <h3 className={`font-bold text-lg text-gray-800 mb-1 pr-3 ${item.status === 'done' ? 'line-through' : ''}`}>{item.title}</h3>
                 
                 {/* Truncated Content */}
                 <div className="text-gray-500 text-sm mb-4 pr-3 line-clamp-3">
                     {/* We strip markdown for the preview card to keep it clean */}
                     {item.content.replace(/[*#]/g, '')}
                 </div>

                 <div className="mt-auto pt-3 border-t pr-3 flex items-center justify-between">
                     <div className="flex items-center gap-2 text-xs text-gray-400">
                         {visibleFields.date && (
                            <>
                                <Clock size={12} /> {new Date(item.publishDate).toLocaleDateString()}
                            </>
                         )}
                     </div>
                     
                     <div className="flex gap-2">
                        {!item.readBy.includes(currentUser.id) && (
                            <button 
                                onClick={(e) => handleRead(e, item.id)}
                                className="flex items-center gap-1 text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full hover:bg-blue-100"
                            >
                                <Eye size={12}/> אשר קריאה
                            </button>
                        )}
                        <button 
                            onClick={(e) => handleMarkDone(e, item.id)}
                            className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${item.status === 'done' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                            <CheckCircle size={12}/> {item.status === 'done' ? 'בוצע' : 'סמן כבוצע'}
                        </button>
                     </div>
                 </div>
             </div>
         ))}
      </div>
    </div>
  );
};