import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Resource, User, WorkItem, Priority, WorkItemType, AutomationRule, UserOverride } from '../types';
import { MOCK_USERS, PRIORITY_LABELS, STATUS_LABELS } from '../constants';
import { Plus, Trash2, Users, Layers, ClipboardList, MapPin, Shield, Settings, Calendar, Save, X, RotateCcw, Palette } from 'lucide-react';
import { SmartEditor } from '../components/SmartEditor'; // Import the new editor

interface AdminProps {
  resources: Resource[];
  setResources: React.Dispatch<React.SetStateAction<Resource[]>>;
  tasks: WorkItem[];
  setTasks: React.Dispatch<React.SetStateAction<WorkItem[]>>;
  currentUser: User;
}

export const Admin: React.FC<AdminProps> = ({ resources, setResources, tasks, setTasks, currentUser }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'content' | 'users' | 'workitems'>('content');

  // --- Work Items State ---
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  
  // Main Form Data
  const [newItemData, setNewItemData] = useState<Partial<WorkItem>>({
    type: 'task', priority: 'normal', viewPermission: 'all', editPermission: 'manager', 
    commentPermission: 'all', ownerId: currentUser.id, executorIds: [], automationRules: [], userOverrides: [],
    backgroundColor: '#ffffff'
  });
  
  // Helper for location form
  const [locLink, setLocLink] = useState('');
  const [locAddress, setLocAddress] = useState('');

  // --- Advanced Settings Modal State ---
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [tempAutomation, setTempAutomation] = useState<Partial<AutomationRule>>({ actionType: 'setStatus', newValue: 'done' });
  const [tempOverride, setTempOverride] = useState<Partial<UserOverride>>({});

  // --- Users Mock ---
  const [usersList, setUsersList] = useState<User[]>(MOCK_USERS);

  const BG_COLORS = ['#ffffff', '#fef2f2', '#fffbeb', '#f0fdf4', '#eff6ff', '#f5f3ff'];

  // Check if we navigated here with an edit request
  useEffect(() => {
    if (location.state && location.state.editItem) {
      const itemToEdit = location.state.editItem as WorkItem;
      loadItemForEdit(itemToEdit);
      // Clear state so refresh doesn't stick
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const loadItemForEdit = (item: WorkItem) => {
    setActiveTab('workitems');
    setIsAddingItem(true);
    setEditingItemId(item.id);
    setNewItemData({ ...item });
    setLocAddress(item.location?.address || '');
    setLocLink(item.location?.link || '');
  };

  const resetForm = () => {
    setIsAddingItem(false);
    setEditingItemId(null);
    setNewItemData({ 
        type: 'task', priority: 'normal', 
        viewPermission: 'all', editPermission: 'manager', commentPermission: 'all',
        ownerId: currentUser.id, executorIds: [], automationRules: [], userOverrides: [],
        backgroundColor: '#ffffff'
    });
    setLocAddress('');
    setLocLink('');
    setShowAdvancedSettings(false);
  };

  const handleCreateOrUpdateWorkItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemData.title || !newItemData.content) return;

    const itemPayload: WorkItem = {
      id: editingItemId || Date.now().toString(),
      title: newItemData.title!,
      content: newItemData.content!,
      type: newItemData.type as WorkItemType || 'task',
      status: newItemData.status || 'pending',
      priority: newItemData.priority as Priority || 'normal',
      publishDate: newItemData.publishDate || Date.now(),
      
      backgroundColor: newItemData.backgroundColor || '#ffffff',

      ownerId: newItemData.ownerId || currentUser.id,
      executorIds: newItemData.executorIds || [],
      
      viewPermission: newItemData.viewPermission || 'all',
      editPermission: newItemData.editPermission || 'manager',
      commentPermission: newItemData.commentPermission || 'all',
      
      customNotes: newItemData.customNotes,
      location: locAddress ? { address: locAddress, link: locLink } : undefined,
      
      readBy: newItemData.readBy || [],
      completedBy: newItemData.completedBy || [],
      createdBy: editingItemId ? (newItemData.createdBy || currentUser.id) : currentUser.id,
      createdAt: newItemData.createdAt || Date.now(),
      
      automationRules: newItemData.automationRules || [],
      userOverrides: newItemData.userOverrides || [],
    };

    if (editingItemId) {
      setTasks(prev => prev.map(t => t.id === editingItemId ? itemPayload : t));
    } else {
      setTasks(prev => [itemPayload, ...prev]);
    }
    
    resetForm();
  };

  const toggleExecutor = (userId: string) => {
      const current = newItemData.executorIds || [];
      if (current.includes(userId)) {
          setNewItemData({...newItemData, executorIds: current.filter(id => id !== userId)});
      } else {
          setNewItemData({...newItemData, executorIds: [...current, userId]});
      }
  };

  // --- Automation Handlers ---
  const addAutomationRule = () => {
    if (!tempAutomation.triggerDate) return;
    const rule: AutomationRule = {
      id: Date.now().toString(),
      triggerDate: tempAutomation.triggerDate,
      actionType: tempAutomation.actionType!,
      newValue: tempAutomation.newValue!
    };
    setNewItemData(prev => ({ ...prev, automationRules: [...(prev.automationRules || []), rule] }));
    setTempAutomation({ actionType: 'setStatus', newValue: 'done' });
  };

  const addUserOverride = () => {
    if (!tempOverride.userId) return;
    const override: UserOverride = {
      userId: tempOverride.userId,
      priority: tempOverride.priority,
      dueDate: tempOverride.dueDate
    };
    setNewItemData(prev => ({ ...prev, userOverrides: [...(prev.userOverrides || []), override] }));
    setTempOverride({});
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in pb-20 relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">ניהול מערכת</h2>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-gray-200 rounded-xl mb-8 w-fit overflow-x-auto">
        <button onClick={() => setActiveTab('content')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'content' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'}`}>
          <Layers size={18} /> תכנים
        </button>
        <button onClick={() => setActiveTab('workitems')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'workitems' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'}`}>
          <ClipboardList size={18} /> משימות והודעות
        </button>
        <button onClick={() => setActiveTab('users')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'users' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'}`}>
          <Users size={18} /> משתמשים
        </button>
      </div>

      {/* --- WORK ITEMS TAB --- */}
      {activeTab === 'workitems' && (
        <div>
           {!isAddingItem && (
             <div className="flex justify-end mb-4">
              <button 
                onClick={() => { resetForm(); setIsAddingItem(true); }}
                className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 flex items-center gap-2"
              >
                <Plus size={20} />
                <span>יצירת פריט עבודה</span>
              </button>
            </div>
           )}

          {isAddingItem && (
             <form onSubmit={handleCreateOrUpdateWorkItem} className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 mb-8 animate-slide-down space-y-6">
                <div className="flex justify-between border-b pb-2 items-center">
                   <h3 className="text-xl font-bold">{editingItemId ? 'עריכת פריט' : 'פריט חדש'}</h3>
                   
                   {/* Advanced Settings Toggle */}
                   <button 
                     type="button" 
                     onClick={() => setShowAdvancedSettings(true)}
                     className="text-blue-600 hover:bg-blue-50 px-3 py-1 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
                   >
                     <Settings size={18} />
                     הגדרות מתקדמות
                   </button>
                </div>
                
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="col-span-1 md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">כותרת</label>
                        <input type="text" required value={newItemData.title || ''} onChange={e => setNewItemData({...newItemData, title: e.target.value})} className="w-full p-2 border rounded-lg" placeholder="למשל: ישיבת צוות" />
                    </div>
                    
                    {/* Visual Editor Area */}
                    <div className="col-span-1 md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">תוכן (עורך חכם)</label>
                        <SmartEditor 
                            value={newItemData.content || ''} 
                            onChange={(val) => setNewItemData({...newItemData, content: val})} 
                        />
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg border">
                         <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1"><Palette size={14}/> צבע כרטיסייה</label>
                         <div className="flex gap-2">
                            {BG_COLORS.map(color => (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() => setNewItemData({...newItemData, backgroundColor: color})}
                                    className={`w-8 h-8 rounded-full border shadow-sm transition-transform ${newItemData.backgroundColor === color ? 'scale-110 ring-2 ring-blue-500' : ''}`}
                                    style={{ backgroundColor: color }}
                                />
                            ))}
                         </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">עדיפות</label>
                        <select value={newItemData.priority} onChange={e => setNewItemData({...newItemData, priority: e.target.value as Priority})} className="w-full p-2 border rounded-lg">
                            <option value="low">נמוכה</option>
                            <option value="normal">רגילה</option>
                            <option value="high">גבוהה</option>
                            <option value="critical">קריטית</option>
                        </select>
                    </div>
                </div>

                {/* Responsibility */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h4 className="font-bold text-sm mb-3 flex items-center gap-2"><Users size={16}/> אחריות וביצוע</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">אחראי ראשי</label>
                            <select value={newItemData.ownerId} onChange={e => setNewItemData({...newItemData, ownerId: e.target.value})} className="w-full p-2 border rounded-lg text-sm">
                                {usersList.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">מבצעים נוספים</label>
                            <div className="flex flex-wrap gap-2">
                                {usersList.map(u => (
                                    <button 
                                      type="button" 
                                      key={u.id} 
                                      onClick={() => toggleExecutor(u.id)}
                                      className={`text-xs px-2 py-1 rounded-full border ${newItemData.executorIds?.includes(u.id) ? 'bg-blue-100 border-blue-300 text-blue-700' : 'bg-white border-gray-300'}`}
                                    >
                                        {u.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Location & Permissions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1"><MapPin size={14}/> מיקום</label>
                        <input type="text" value={locAddress} onChange={e => setLocAddress(e.target.value)} className="w-full p-2 border rounded-lg mb-2" placeholder="כתובת / שם מקום" />
                        <input type="text" value={locLink} onChange={e => setLocLink(e.target.value)} className="w-full p-2 border rounded-lg text-xs" placeholder="לינק (Waze/Maps)" dir="ltr"/>
                     </div>
                     <div>
                         <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1"><Shield size={14}/> הרשאות צפייה</label>
                         <select value={newItemData.viewPermission as string} onChange={e => setNewItemData({...newItemData, viewPermission: e.target.value as any})} className="w-full p-2 border rounded-lg mb-2">
                            <option value="all">כולם</option>
                            <option value="manager">מנהלים בלבד</option>
                        </select>
                     </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t sticky bottom-0 bg-white p-2">
                    <button type="button" onClick={resetForm} className="px-4 py-2 text-gray-600">ביטול</button>
                    <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md flex items-center gap-2">
                      <Save size={18} />
                      {editingItemId ? 'עדכן פריט' : 'שמור ופרסם'}
                    </button>
                </div>
             </form>
          )}

          {/* List of items */}
          {!isAddingItem && (
            <div className="space-y-2">
               {tasks.map(task => (
                   <div key={task.id} className="p-3 rounded-lg border flex justify-between items-center hover:shadow-md transition-shadow" style={{ backgroundColor: task.backgroundColor || 'white' }}>
                      <div>
                          <div className="font-bold text-gray-800">{task.title}</div>
                          <div className="text-xs text-gray-500">
                             {PRIORITY_LABELS[task.priority]} • {STATUS_LABELS[task.status]}
                          </div>
                      </div>
                      <div className="flex gap-2">
                           <button 
                             onClick={() => loadItemForEdit(task)} 
                             className="p-2 text-blue-500 hover:bg-blue-50 rounded-full"
                             title="ערוך"
                           >
                             <Settings size={16}/>
                           </button>
                           <button onClick={() => {
                               if(window.confirm('למחוק?')) setTasks(prev => prev.filter(t => t.id !== task.id));
                           }} className="p-2 text-red-500 hover:bg-red-50 rounded-full"><Trash2 size={16}/></button>
                      </div>
                   </div>
               ))}
            </div>
          )}
        </div>
      )}

      {/* --- Advanced Settings Modal --- */}
      {showAdvancedSettings && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 animate-fade-in-up">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold flex items-center gap-2">
                  <Settings size={24} className="text-blue-600"/>
                  הגדרות מתקדמות ותזמון
                </h3>
                <button onClick={() => setShowAdvancedSettings(false)} className="p-2 hover:bg-gray-100 rounded-full"><X size={24}/></button>
              </div>

              {/* Automation Rules */}
              <div className="mb-8 border-b pb-6">
                 <h4 className="font-bold text-lg mb-3 flex items-center gap-2"><RotateCcw size={18}/> אוטומציה ושינויי סטטוס</h4>
                 <p className="text-sm text-gray-500 mb-4">הגדר פעולות שיקרו אוטומטית בתאריך מסוים</p>
                 
                 <div className="bg-blue-50 p-4 rounded-xl mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                       <div>
                          <label className="text-xs font-bold text-gray-500">בתאריך</label>
                          <input type="date" className="w-full p-2 rounded border" value={tempAutomation.triggerDate || ''} onChange={e => setTempAutomation({...tempAutomation, triggerDate: e.target.value})} />
                       </div>
                       <div>
                          <label className="text-xs font-bold text-gray-500">בצע פעולה</label>
                          <select className="w-full p-2 rounded border" value={tempAutomation.actionType} onChange={e => setTempAutomation({...tempAutomation, actionType: e.target.value as any})}>
                             <option value="setStatus">שנה סטטוס ל...</option>
                             <option value="setPriority">שנה עדיפות ל...</option>
                             <option value="archive">העבר לארכיון</option>
                          </select>
                       </div>
                       <div>
                          <label className="text-xs font-bold text-gray-500">ערך חדש</label>
                          {tempAutomation.actionType === 'setStatus' ? (
                             <select className="w-full p-2 rounded border" value={tempAutomation.newValue} onChange={e => setTempAutomation({...tempAutomation, newValue: e.target.value})}>
                                <option value="pending">ממתין</option>
                                <option value="done">בוצע</option>
                                <option value="archived">ארכיון</option>
                             </select>
                          ) : tempAutomation.actionType === 'setPriority' ? (
                             <select className="w-full p-2 rounded border" value={tempAutomation.newValue} onChange={e => setTempAutomation({...tempAutomation, newValue: e.target.value})}>
                                <option value="low">נמוכה</option>
                                <option value="high">גבוהה</option>
                                <option value="critical">קריטית</option>
                             </select>
                          ) : (
                             <input disabled className="w-full p-2 rounded border bg-gray-100" value="-" />
                          )}
                       </div>
                    </div>
                    <button onClick={addAutomationRule} className="mt-3 text-sm bg-blue-600 text-white px-3 py-1 rounded shadow hover:bg-blue-700">הוסף כלל</button>
                 </div>

                 {/* List of rules */}
                 <div className="space-y-2">
                    {newItemData.automationRules?.map((rule, idx) => (
                       <div key={idx} className="flex justify-between items-center bg-gray-50 p-2 rounded border text-sm">
                          <span>
                             ב-<strong>{rule.triggerDate}</strong>: 
                             {rule.actionType === 'setStatus' ? ' שנה סטטוס ל-' : ' שנה עדיפות ל-'}
                             <strong>{rule.newValue}</strong>
                          </span>
                          <button onClick={() => setNewItemData(prev => ({...prev, automationRules: prev.automationRules?.filter((_, i) => i !== idx)}))} className="text-red-500"><Trash2 size={14}/></button>
                       </div>
                    ))}
                 </div>
              </div>

              {/* User Overrides */}
              <div>
                 <h4 className="font-bold text-lg mb-3 flex items-center gap-2"><Users size={18}/> חריגות והתאמות אישיות</h4>
                 <p className="text-sm text-gray-500 mb-4">הגדר נתונים שונים עבור משתמש ספציפי (לדוגמה: דחיפות גבוהה יותר למנהל מסוים)</p>

                 <div className="bg-orange-50 p-4 rounded-xl mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                       <div>
                          <label className="text-xs font-bold text-gray-500">עבור משתמש</label>
                          <select className="w-full p-2 rounded border" value={tempOverride.userId || ''} onChange={e => setTempOverride({...tempOverride, userId: e.target.value})}>
                             <option value="">בחר...</option>
                             {usersList.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                          </select>
                       </div>
                       <div>
                          <label className="text-xs font-bold text-gray-500">שנה עדיפות (אופציונלי)</label>
                          <select className="w-full p-2 rounded border" value={tempOverride.priority || ''} onChange={e => setTempOverride({...tempOverride, priority: e.target.value as Priority})}>
                                <option value="">ללא שינוי</option>
                                <option value="low">נמוכה</option>
                                <option value="high">גבוהה</option>
                                <option value="critical">קריטית</option>
                          </select>
                       </div>
                    </div>
                    <button onClick={addUserOverride} className="text-sm bg-orange-600 text-white px-3 py-1 rounded shadow hover:bg-orange-700">הוסף חריגה</button>
                 </div>

                 <div className="space-y-2">
                    {newItemData.userOverrides?.map((ov, idx) => (
                       <div key={idx} className="flex justify-between items-center bg-gray-50 p-2 rounded border text-sm">
                          <span>
                             עבור <strong>{usersList.find(u => u.id === ov.userId)?.name}</strong>: 
                             {ov.priority && ` עדיפות: ${PRIORITY_LABELS[ov.priority]}`}
                          </span>
                          <button onClick={() => setNewItemData(prev => ({...prev, userOverrides: prev.userOverrides?.filter((_, i) => i !== idx)}))} className="text-red-500"><Trash2 size={14}/></button>
                       </div>
                    ))}
                 </div>
              </div>

              <div className="mt-8 pt-4 border-t flex justify-end">
                 <button onClick={() => setShowAdvancedSettings(false)} className="bg-gray-800 text-white px-6 py-2 rounded-lg font-bold">סיום וסגירה</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};