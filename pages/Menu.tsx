import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../types';
import { Shield, LogOut, FileText, Settings, HelpCircle, ExternalLink, User as UserIcon } from 'lucide-react';

interface MenuProps {
  user: User;
  onLogout: () => void;
}

export const Menu: React.FC<MenuProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const menuItems = [
    {
      title: 'ניהול מערכת',
      description: 'הוספת תכנים, ניהול משתמשים',
      icon: Shield,
      path: '/admin',
      role: ['admin', 'manager'],
      color: 'bg-purple-100 text-purple-600'
    },
    {
      title: 'נהלי עבודה',
      description: 'מסמכי חברה ונהלים',
      icon: FileText,
      path: '/resource/3', // Example link to a doc
      role: ['admin', 'manager', 'user'],
      color: 'bg-blue-100 text-blue-600'
    },
    {
      title: 'תמיכה ועזרה',
      description: 'פתיחת קריאת שירות',
      icon: HelpCircle,
      path: '#',
      role: ['admin', 'manager', 'user'],
      color: 'bg-green-100 text-green-600'
    },
    {
      title: 'הגדרות',
      description: 'הגדרות אפליקציה ותצוגה',
      icon: Settings,
      path: '/settings',
      role: ['admin', 'manager', 'user'],
      color: 'bg-gray-100 text-gray-600'
    }
  ];

  return (
    <div className="animate-fade-in space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">תפריט נוסף</h2>

      {/* Personal Area Button - Prominent at Top */}
      <button
        onClick={() => navigate('/profile')}
        className="w-full flex items-center p-4 bg-gradient-to-l from-blue-500 to-blue-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all text-right"
      >
        <div className="p-3 rounded-full bg-white/20 ml-4">
          <UserIcon size={24} className="text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-lg">אזור אישי</h3>
          <p className="text-sm text-blue-100">צפייה בפרטים והגדרות חשבון</p>
        </div>
        <div className="text-white/70">
          <ExternalLink size={18} className="transform rotate-180" /> 
        </div>
      </button>

      {/* Other Menu Items */}
      <div className="grid grid-cols-1 gap-4">
        {menuItems.map((item, index) => {
          if (!item.role.includes(user.role)) return null;
          
          return (
            <button
              key={index}
              onClick={() => item.path !== '#' && navigate(item.path)}
              className="flex items-center p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all text-right"
            >
              <div className={`p-3 rounded-full ${item.color} ml-4`}>
                <item.icon size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-800">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.description}</p>
              </div>
              <div className="text-gray-300">
                <ExternalLink size={18} className="transform rotate-180" /> 
              </div>
            </button>
          );
        })}
      </div>

      <div className="pt-6 border-t border-gray-200 mt-6">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 p-4 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-colors"
        >
          <LogOut size={20} />
          יציאה מהמערכת
        </button>
      </div>
    </div>
  );
};