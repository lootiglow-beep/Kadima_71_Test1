import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Resource } from '../types';
import { DEFAULT_SHORTCUTS } from '../constants';
import * as LucideIcons from 'lucide-react';
import { User } from '../types';

interface DashboardProps {
  resources: Resource[];
  // In a real app, user would come from context, passing as prop for now if needed, 
  // but assuming we might not have it in props, so using a mock or requiring App.tsx update.
  // Ideally App.tsx passes user here.
}

export const Dashboard: React.FC<DashboardProps & { user: User }> = ({ resources, user }) => {
  const navigate = useNavigate();

  // Helper to render icon dynamically
  const renderIcon = (iconName: string, colorClass: string, size = 32) => {
    const Icon = (LucideIcons as any)[iconName] || LucideIcons.Box;
    return <Icon size={size} className={colorClass} />;
  };

  // 1. Filter shortcuts based on User Role
  const visibleShortcuts = DEFAULT_SHORTCUTS.filter(shortcut => 
    shortcut.roles.includes(user.role)
  );

  // Color mapping for backgrounds
  const getColorClasses = (theme: string) => {
    switch (theme) {
      case 'red': return { bg: 'bg-red-50 group-hover:bg-red-100', text: 'text-red-500 group-hover:text-red-700', border: 'border-red-100 hover:border-red-200' };
      case 'orange': return { bg: 'bg-orange-50 group-hover:bg-orange-100', text: 'text-orange-500 group-hover:text-orange-700', border: 'border-orange-100 hover:border-orange-200' };
      case 'blue': return { bg: 'bg-blue-50 group-hover:bg-blue-100', text: 'text-blue-500 group-hover:text-blue-700', border: 'border-blue-100 hover:border-blue-200' };
      case 'green': return { bg: 'bg-green-50 group-hover:bg-green-100', text: 'text-green-500 group-hover:text-green-700', border: 'border-green-100 hover:border-green-200' };
      case 'gray': return { bg: 'bg-gray-50 group-hover:bg-gray-100', text: 'text-gray-500 group-hover:text-gray-700', border: 'border-gray-100 hover:border-gray-200' };
      default: return { bg: 'bg-gray-50', text: 'text-gray-500', border: 'border-gray-100' };
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="text-center md:text-right py-4">
        <h2 className="text-3xl font-bold text-gray-800">שלום, {user.name}</h2>
      </header>

      {/* Grid of Shortcuts */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        
        {visibleShortcuts.map((shortcut) => {
          const colors = getColorClasses(shortcut.colorTheme);
          return (
            <button
              key={shortcut.id}
              onClick={() => navigate(shortcut.path)}
              className={`group flex flex-col items-center justify-center p-6 bg-white rounded-2xl border shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 ${colors.border}`}
            >
              <div className={`p-4 rounded-full mb-4 transition-colors ${colors.bg}`}>
                {renderIcon(shortcut.iconName, colors.text.split(' ')[0])}
              </div>
              <span className={`font-bold text-lg text-center mb-1 ${colors.text.split(' ')[1] || 'text-gray-700'}`}>
                {shortcut.title}
              </span>
              {shortcut.subtitle && (
                <span className="text-xs text-gray-400 text-center">
                  {shortcut.subtitle}
                </span>
              )}
            </button>
          );
        })}
        
        {/* Admin "Add New" Shortcut (Only for admins) */}
        {(user.role === 'admin') && (
            <button 
            onClick={() => navigate('/admin')}
            className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-gray-300 text-gray-400 hover:text-blue-500 hover:border-blue-500 hover:bg-blue-50/50 transition-all duration-300"
            >
            <div className="p-4 mb-2">
                <span className="text-4xl font-light">+</span>
            </div>
            <span className="font-medium">ערוך קיצורים</span>
            </button>
        )}
      </div>
    </div>
  );
};