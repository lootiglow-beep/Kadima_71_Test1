import React, { useState } from 'react';
import { ChatSession, ChatType, Message, User } from '../types';
import { MOCK_CHATS, MOCK_USERS } from '../constants';
import { Send, MessageSquare, Users, Lock, Reply, Shield, Trash2, EyeOff, Snowflake, History, Plus, X, Search } from 'lucide-react';

interface MessagesProps {
  currentUser: User;
}

export const Messages: React.FC<MessagesProps> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'general' | 'context' | 'coordinator' | 'private'>('general');
  const [chats, setChats] = useState<ChatSession[]>(MOCK_CHATS);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  
  // New Chat Modal State
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [newChatParticipants, setNewChatParticipants] = useState<string[]>([]);
  const [newChatTitle, setNewChatTitle] = useState('');

  // --- Helpers ---
  const isAdmin = currentUser.role === 'admin';
  const isManager = currentUser.role === 'manager';

  const getVisibleChats = () => {
    return chats.filter(chat => {
      // 1. Is it hidden by user?
      if (chat.hiddenFor.includes(currentUser.id)) return false;

      // 2. Admin Super View (See ALL private/coordinator chats)
      if (isAdmin) return true;

      // 3. Tab Filtering & Permissions
      switch (activeTab) {
        case 'all':
           return chat.type === 'general' || chat.participants.includes(currentUser.id) || (isManager && chat.type === 'coordinator');
        case 'general':
          return chat.type === 'general';
        case 'coordinator':
          return chat.type === 'coordinator' && (isManager || isAdmin);
        case 'context':
          return chat.type === 'context' && chat.participants.includes(currentUser.id);
        case 'private':
          return chat.type === 'private' && chat.participants.includes(currentUser.id);
        default:
          return false;
      }
    }).filter(chat => {
        // Double check tab consistency for Admin who passed the first filter
        if (activeTab === 'all') return true;
        return chat.type === activeTab;
    });
  };

  const selectedChat = chats.find(c => c.id === selectedChatId);

  // --- Actions ---

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChatId) return;
    
    // Check if frozen
    if (selectedChat?.isFrozen && !isAdmin) {
        alert("הצ'אט הזה מוקפא על ידי המנהל.");
        return;
    }

    const msg: Message = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      senderName: currentUser.name,
      content: newMessage,
      timestamp: Date.now(),
      type: 'text'
    };

    setChats(prev => prev.map(c => c.id === selectedChatId ? {
      ...c, 
      messages: [...c.messages, msg],
      lastMessageAt: Date.now()
    } : c));
    setNewMessage('');
  };

  const createNewPrivateChat = () => {
      if (newChatParticipants.length === 0) return;
      
      const newChat: ChatSession = {
          id: Date.now().toString(),
          type: 'private',
          title: newChatTitle || (newChatParticipants.length === 1 ? MOCK_USERS.find(u => u.id === newChatParticipants[0])?.name : 'קבוצה חדשה'),
          participants: [...newChatParticipants, currentUser.id],
          messages: [],
          isFrozen: false,
          hiddenFor: [],
          lastMessageAt: Date.now()
      };
      
      setChats([newChat, ...chats]);
      setShowNewChatModal(false);
      setNewChatParticipants([]);
      setNewChatTitle('');
      setActiveTab('private');
      setSelectedChatId(newChat.id);
  };

  // --- Admin/User Actions ---

  const toggleFreeze = (chatId: string) => {
      if (!isAdmin) return;
      setChats(prev => prev.map(c => c.id === chatId ? { ...c, isFrozen: !c.isFrozen } : c));
  };

  const deleteChatForever = (chatId: string) => {
      if (!isAdmin) return;
      if (confirm('האם אתה בטוח? פעולה זו תמחק את הצ\'אט לכולם.')) {
        setChats(prev => prev.filter(c => c.id !== chatId));
        if (selectedChatId === chatId) setSelectedChatId(null);
      }
  };

  const hideChatForSelf = (chatId: string) => {
      setChats(prev => prev.map(c => c.id === chatId ? { ...c, hiddenFor: [...c.hiddenFor, currentUser.id] } : c));
      if (selectedChatId === chatId) setSelectedChatId(null);
  };

  // Tabs ordered from Right to Left as requested in RTL layout
  const tabs = [
    { id: 'all', label: 'הכל', icon: MessageSquare, showText: false },
    { id: 'general', label: 'כללי', icon: Users, showText: true },
    { id: 'context', label: 'בתגובה', icon: Reply, showText: true },
    { id: 'coordinator', label: 'רכזים', icon: Shield, showText: false },
    { id: 'private', label: 'פרטי', icon: Lock, showText: false },
  ];

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col animate-fade-in relative">
       
       {/* Tabs Navigation - Compact, Single Line */}
       <div className="flex justify-between items-center gap-1 mb-4 p-1.5 bg-gray-100 rounded-xl w-full">
           {tabs.map(tab => (
               <button 
                 key={tab.id}
                 onClick={() => { setActiveTab(tab.id as any); setSelectedChatId(null); }} 
                 title={tab.label} // Tooltip on hover/long press
                 className={`flex-1 py-2 px-1 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors ${activeTab === tab.id ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:bg-gray-200'}`}
               >
                   <tab.icon size={18}/> 
                   {tab.showText && <span className="whitespace-nowrap">{tab.label}</span>}
               </button>
           ))}
       </div>

       <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 flex overflow-hidden">
           
           {/* Sidebar - Chat List */}
           <div className={`w-full md:w-80 border-l bg-gray-50 flex flex-col ${selectedChatId ? 'hidden md:flex' : 'flex'}`}>
                {/* Header Actions */}
                <div className="p-4 border-b flex justify-between items-center bg-white">
                    <div className="flex items-center gap-2 text-gray-500">
                        <History size={16} />
                        <span className="text-xs font-bold">היסטוריית שיחות</span>
                    </div>
                    {activeTab === 'private' && (
                        <button onClick={() => setShowNewChatModal(true)} className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 shadow-sm">
                            <Plus size={16} />
                        </button>
                    )}
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {getVisibleChats().length === 0 && (
                        <div className="text-center text-gray-400 mt-10 text-sm">אין שיחות בקטגוריה זו</div>
                    )}
                    {getVisibleChats().map(chat => (
                        <div 
                          key={chat.id} 
                          onClick={() => setSelectedChatId(chat.id)}
                          className={`p-3 rounded-xl cursor-pointer transition-all border ${selectedChatId === chat.id ? 'bg-white border-blue-300 shadow-sm' : 'bg-transparent border-transparent hover:bg-white hover:border-gray-200'}`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <h4 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                                    {chat.title || chat.participants.map(p => MOCK_USERS.find(u => u.id === p)?.name).join(', ')}
                                    {isAdmin && !chat.participants.includes(currentUser.id) && (
                                        <span title="צפיית מנהל">
                                            <Lock size={12} className="text-red-500" />
                                        </span>
                                    )}
                                    {chat.isFrozen && (
                                        <span title="מוקפא">
                                            <Snowflake size={12} className="text-blue-400" />
                                        </span>
                                    )}
                                </h4>
                                <span className="text-[10px] text-gray-400">{new Date(chat.lastMessageAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            </div>
                            <p className="text-xs text-gray-500 line-clamp-1">
                                {chat.messages[chat.messages.length - 1]?.content || 'אין הודעות'}
                            </p>
                        </div>
                    ))}
                </div>
           </div>

           {/* Chat View */}
           <div className={`flex-1 flex flex-col ${!selectedChatId ? 'hidden md:flex' : 'flex'}`}>
                {!selectedChat ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                        <MessageSquare size={48} className="mb-2 opacity-20"/>
                        <p>בחר שיחה מהרשימה</p>
                    </div>
                ) : (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b flex justify-between items-center bg-white z-10">
                             <div className="flex items-center gap-3">
                                 <button onClick={() => setSelectedChatId(null)} className="md:hidden text-gray-500"><X size={20}/></button>
                                 <div>
                                     <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                         {selectedChat.title || 'שיחה פרטית'}
                                         {selectedChat.isFrozen && <span className="text-xs bg-blue-100 text-blue-600 px-2 rounded-full flex items-center gap-1"><Snowflake size={10}/> מוקפא</span>}
                                     </h3>
                                     <p className="text-xs text-gray-500">
                                         {selectedChat.participants.length} משתתפים
                                     </p>
                                 </div>
                             </div>
                             
                             {/* Chat Controls */}
                             <div className="flex items-center gap-1">
                                 {isAdmin && (
                                     <>
                                        <button onClick={() => toggleFreeze(selectedChat.id)} className={`p-2 rounded-full ${selectedChat.isFrozen ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:bg-gray-100'}`} title="הקפאת דיון">
                                            <Snowflake size={18} />
                                        </button>
                                        <button onClick={() => deleteChatForever(selectedChat.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full" title="מחק לצמיתות">
                                            <Trash2 size={18} />
                                        </button>
                                     </>
                                 )}
                                 <button onClick={() => hideChatForSelf(selectedChat.id)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full" title="הסתר מהרשימה שלי">
                                     <EyeOff size={18} />
                                 </button>
                             </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                             {selectedChat.messages.map(msg => (
                                 <div key={msg.id} className={`flex flex-col ${msg.senderId === currentUser.id ? 'items-start' : 'items-end'}`}>
                                     <div className={`max-w-[80%] rounded-2xl p-3 ${msg.senderId === currentUser.id ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white border rounded-tl-none'}`}>
                                         {msg.senderId !== currentUser.id && <div className="text-[10px] font-bold mb-1 opacity-70">{msg.senderName}</div>}
                                         <div className="text-sm">{msg.content}</div>
                                     </div>
                                     <span className="text-[10px] text-gray-400 mt-1 px-1">
                                         {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                     </span>
                                 </div>
                             ))}
                        </div>

                        {/* Input Area */}
                        <div className="p-3 bg-white border-t">
                             {selectedChat.isFrozen && !isAdmin ? (
                                 <div className="text-center text-sm text-gray-500 bg-gray-100 p-2 rounded-lg flex items-center justify-center gap-2">
                                     <Lock size={14}/> השיחה הוקפאה על ידי מנהל
                                 </div>
                             ) : (
                                <form onSubmit={handleSendMessage} className="flex gap-2">
                                    <input 
                                        type="text" 
                                        value={newMessage} 
                                        onChange={e => setNewMessage(e.target.value)} 
                                        placeholder="הקלד הודעה..."
                                        className="flex-1 p-2 rounded-xl border bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    />
                                    <button type="submit" disabled={!newMessage.trim()} className="bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
                                        <Send size={20} />
                                    </button>
                                </form>
                             )}
                        </div>
                    </>
                )}
           </div>
       </div>

       {/* New Chat Modal */}
       {showNewChatModal && (
           <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
               <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-fade-in-up">
                   <div className="flex justify-between items-center mb-4">
                       <h3 className="text-xl font-bold">שיחה חדשה</h3>
                       <button onClick={() => setShowNewChatModal(false)}><X size={24}/></button>
                   </div>
                   
                   <div className="space-y-4">
                       <div>
                           <label className="block text-sm font-medium mb-1">נושא / שם הקבוצה (אופציונלי)</label>
                           <input type="text" className="w-full p-2 border rounded-lg" value={newChatTitle} onChange={e => setNewChatTitle(e.target.value)} />
                       </div>

                       <div>
                           <label className="block text-sm font-medium mb-1">בחר משתתפים</label>
                           <div className="max-h-40 overflow-y-auto border rounded-lg p-2 space-y-1">
                               {MOCK_USERS.filter(u => u.id !== currentUser.id).map(u => (
                                   <label key={u.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                                       <input 
                                         type="checkbox" 
                                         checked={newChatParticipants.includes(u.id)}
                                         onChange={() => {
                                             if (newChatParticipants.includes(u.id)) {
                                                 setNewChatParticipants(prev => prev.filter(id => id !== u.id));
                                             } else {
                                                 setNewChatParticipants(prev => [...prev, u.id]);
                                             }
                                         }}
                                         className="w-4 h-4"
                                       />
                                       <span>{u.name}</span>
                                       <span className="text-xs text-gray-400">({u.role === 'admin' ? 'מנהל' : 'משתמש'})</span>
                                   </label>
                               ))}
                           </div>
                       </div>

                       <button 
                         onClick={createNewPrivateChat} 
                         disabled={newChatParticipants.length === 0}
                         className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold disabled:opacity-50"
                       >
                           צור שיחה
                       </button>
                   </div>
               </div>
           </div>
       )}
    </div>
  );
};