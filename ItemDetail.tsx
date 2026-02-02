import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { WorkItem, User, Comment } from '../types';
import { MOCK_COMMENTS, STATUS_LABELS, MOCK_USERS } from '../constants';
import { ArrowRight, MapPin, Calendar, User as UserIcon, Send, MessageSquare, Edit } from 'lucide-react';
import { MarkdownDisplay } from '../components/MarkdownDisplay';

interface ItemDetailProps {
  items: WorkItem[];
  currentUser: User;
}

export const ItemDetail: React.FC<ItemDetailProps> = ({ items, currentUser }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const item = items.find(i => i.id === id);
  
  // Comments State (Mocked local state for demo)
  const [comments, setComments] = useState<Comment[]>(MOCK_COMMENTS.filter(c => c.workItemId === id));
  const [newComment, setNewComment] = useState('');
  const [context, setContext] = useState('כללי');

  if (!item) return <div className="p-10 text-center">פריט לא נמצא</div>;

  const ownerName = MOCK_USERS.find(u => u.id === item.ownerId)?.name || 'לא ידוע';
  const canEdit = currentUser.role === 'admin' || currentUser.role === 'manager';

  const handleEdit = () => {
    navigate('/admin', { state: { editItem: item } });
  };

  const handleSendComment = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newComment.trim()) return;
      
      const comment: Comment = {
          id: Date.now().toString(),
          workItemId: item.id,
          userId: currentUser.id,
          userName: currentUser.name,
          content: newComment,
          timestamp: Date.now(),
          type: 'text',
          context: context
      };
      setComments([...comments, comment]);
      setNewComment('');
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in pb-24">
       <div className="flex justify-between items-center mb-4">
         <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-blue-600">
             <ArrowRight size={20} /> חזרה
         </button>
         {canEdit && (
            <button 
              onClick={handleEdit} 
              className="flex items-center gap-2 bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
            >
              <Edit size={16} /> עריכה
            </button>
         )}
       </div>

       <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
           <div className={`h-2 w-full ${item.priority === 'critical' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
           <div className="p-6">
               <div className="flex justify-between items-start mb-4">
                   <h1 className="text-2xl font-bold text-gray-800">{item.title}</h1>
                   <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">
                       {STATUS_LABELS[item.status]}
                   </span>
               </div>
               
               {/* Markdown Content */}
               <div className="mb-6">
                 <MarkdownDisplay content={item.content} />
               </div>

               {/* Meta Grid */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl text-sm">
                   <div className="flex items-center gap-2 text-gray-600">
                       <UserIcon size={16} className="text-blue-500"/>
                       <span>אחראי: <strong>{ownerName}</strong></span>
                   </div>
                   <div className="flex items-center gap-2 text-gray-600">
                       <Calendar size={16} className="text-blue-500"/>
                       <span>פורסם: {new Date(item.publishDate).toLocaleDateString()}</span>
                   </div>
                   {item.location && (
                       <div className="col-span-1 md:col-span-2 flex items-center justify-between bg-white p-2 rounded border">
                           <div className="flex items-center gap-2">
                               <MapPin size={16} className="text-red-500"/>
                               <span>{item.location.address}</span>
                           </div>
                           {item.location.link && (
                               <a href={item.location.link} target="_blank" rel="noreferrer" className="text-xs bg-blue-600 text-white px-3 py-1 rounded-full">
                                   Waze
                               </a>
                           )}
                       </div>
                   )}
                   {item.customNotes && (
                       <div className="col-span-1 md:col-span-2 bg-yellow-50 text-yellow-800 p-2 rounded border border-yellow-100">
                           <strong>הערות חשובות:</strong> {item.customNotes}
                       </div>
                   )}
               </div>
           </div>
       </div>

       {/* Chat Section */}
       <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
           <div className="bg-gray-50 p-3 border-b flex justify-between items-center">
               <h3 className="font-bold flex items-center gap-2 text-gray-700">
                   <MessageSquare size={18}/> דיון על המשימה
               </h3>
               <span className="text-xs text-gray-400">{comments.length} תגובות</span>
           </div>
           
           <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto">
               {comments.length === 0 && <p className="text-center text-gray-400 text-sm py-4">אין תגובות עדיין. היה הראשון להגיב.</p>}
               {comments.map(c => (
                   <div key={c.id} className={`flex gap-3 ${c.userId === currentUser.id ? 'flex-row' : 'flex-row'}`}>
                       <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-xs">
                           {c.userName.charAt(0)}
                       </div>
                       <div>
                           <div className="bg-gray-100 rounded-xl rounded-tr-none p-3 max-w-[80%]">
                               {c.context !== 'כללי' && <div className="text-[10px] text-blue-600 font-bold mb-1">בהקשר ל: {c.context}</div>}
                               <p className="text-sm text-gray-800">{c.content}</p>
                           </div>
                           <span className="text-[10px] text-gray-400 mr-1">{new Date(c.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                       </div>
                   </div>
               ))}
           </div>

           <form onSubmit={handleSendComment} className="p-3 border-t bg-gray-50">
               <div className="flex gap-2 mb-2 overflow-x-auto pb-1">
                   {['כללי', 'מיקום', 'תוכן', 'דחיפות'].map(ctx => (
                       <button 
                         key={ctx} 
                         type="button" 
                         onClick={() => setContext(ctx)}
                         className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${context === ctx ? 'bg-blue-600 text-white' : 'bg-white border text-gray-600'}`}
                       >
                           {ctx}
                       </button>
                   ))}
               </div>
               <div className="flex gap-2">
                   <input 
                     type="text" 
                     value={newComment} 
                     onChange={e => setNewComment(e.target.value)} 
                     className="flex-1 p-2 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none" 
                     placeholder={`הגב בהקשר ל${context}...`}
                   />
                   <button type="submit" disabled={!newComment} className="bg-blue-600 text-white p-2 rounded-lg disabled:opacity-50">
                       <Send size={18} />
                   </button>
               </div>
           </form>
       </div>
    </div>
  );
};