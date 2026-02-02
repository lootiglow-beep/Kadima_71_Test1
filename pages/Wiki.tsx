import React from 'react';
import { Resource } from '../types';
import { BookOpen, FileText, Table, Folder, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MOCK_RESOURCES } from '../constants';

export const Wiki: React.FC = () => {
  const navigate = useNavigate();
  // Filter for doc/sheet resources typically used in Wiki
  const wikiResources = MOCK_RESOURCES.filter(r => r.type === 'doc' || r.type === 'sheet');

  return (
    <div className="animate-fade-in pb-20">
      <div className="mb-8 bg-gradient-to-l from-indigo-600 to-blue-500 p-8 rounded-2xl text-white shadow-lg">
        <div className="flex items-center gap-3 mb-2">
           <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
             <BookOpen size={32} />
           </div>
           <h1 className="text-3xl font-bold">הויקיפדיה הארגונית</h1>
        </div>
        <p className="text-blue-100 max-w-xl">
          מרכז הידע של החברה. כאן תוכלו למצוא נהלים, מדריכים, טפסים ומסמכים חשובים המסודרים לנוחיותכם.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {/* Categories Mockup */}
         <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
             <div className="flex items-center justify-between mb-4">
                 <div className="p-3 bg-blue-50 rounded-full group-hover:bg-blue-100 transition-colors">
                     <Folder className="text-blue-500" size={24} />
                 </div>
                 <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-500">5 פריטים</span>
             </div>
             <h3 className="font-bold text-lg text-gray-800 mb-1">משאבי אנוש</h3>
             <p className="text-sm text-gray-500">טפסי קליטה, נוהלי חופשה, זכויות עובדים</p>
         </div>

         <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
             <div className="flex items-center justify-between mb-4">
                 <div className="p-3 bg-green-50 rounded-full group-hover:bg-green-100 transition-colors">
                     <Folder className="text-green-500" size={24} />
                 </div>
                 <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-500">12 פריטים</span>
             </div>
             <h3 className="font-bold text-lg text-gray-800 mb-1">כספים ורכש</h3>
             <p className="text-sm text-gray-500">דוחות הוצאות, ספקים, נהלי רכש</p>
         </div>

         {/* Individual Resources Listing */}
         {wikiResources.map(res => (
             <div 
               key={res.id}
               onClick={() => navigate(`/resource/${res.id}`)}
               className="bg-white p-4 rounded-xl border border-gray-200 hover:border-blue-300 transition-all cursor-pointer flex items-center gap-4"
             >
                 <div className={`p-3 rounded-lg ${res.type === 'sheet' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                     {res.type === 'sheet' ? <Table size={24}/> : <FileText size={24}/>}
                 </div>
                 <div className="flex-1">
                     <h4 className="font-bold text-gray-800">{res.title}</h4>
                     <p className="text-xs text-gray-500">עודכן לאחרונה: {new Date(res.createdAt).toLocaleDateString()}</p>
                 </div>
                 <ChevronLeft className="text-gray-300" size={20} />
             </div>
         ))}
      </div>
    </div>
  );
};