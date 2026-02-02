import React from 'react';
import { User } from '../types';
import { User as UserIcon, Mail, Shield, Calendar } from 'lucide-react';

interface ProfileProps {
  user: User;
}

export const Profile: React.FC<ProfileProps> = ({ user }) => {
  return (
    <div className="animate-fade-in max-w-lg mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="h-32 bg-blue-600 relative">
          <div className="absolute -bottom-10 right-1/2 transform translate-x-1/2">
             <div className="w-24 h-24 rounded-full bg-white p-1 shadow-lg">
                <div className="w-full h-full rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-3xl font-bold">
                  {user.name.charAt(0)}
                </div>
             </div>
          </div>
        </div>
        
        <div className="pt-12 pb-8 px-6 text-center">
          <h2 className="text-2xl font-bold text-gray-800">{user.name}</h2>
          <p className="text-gray-500">@{user.username}</p>
          
          <div className="flex justify-center gap-2 mt-3">
             <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium border border-blue-100">
               {user.role === 'admin' ? 'מנהל מערכת' : 'משתמש רגיל'}
             </span>
          </div>
        </div>

        <div className="border-t border-gray-100 p-6 space-y-4">
          <div className="flex items-center gap-3 text-gray-700">
            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
              <UserIcon size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-400">שם מלא</p>
              <p className="font-medium">{user.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-gray-700">
            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
              <Shield size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-400">רמת הרשאה</p>
              <p className="font-medium">{user.role}</p>
            </div>
          </div>

          {user.expiryDate && (
            <div className="flex items-center gap-3 text-gray-700">
              <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-400">
                <Calendar size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-400">תוקף חשבון</p>
                <p className="font-medium text-orange-600">{user.expiryDate}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};