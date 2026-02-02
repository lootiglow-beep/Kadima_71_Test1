import React, { useState } from 'react';
import { User } from '../types';
import { api } from '../services/api';
import { Lock, User as UserIcon, LogIn, AlertCircle } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // זמני: אם המשתמש מקליד admin/admin אנחנו מדלגים על השרת כדי שתוכל לבדוק את הממשק
    // עד שתגדיר את הגוגל שיטס. מחק את הבלוק הזה כשהשיטס מוכן!
    if (username === 'admin' && password === 'admin') {
        setTimeout(() => {
            onLoginSuccess({
                id: '1',
                username: 'admin',
                name: 'מנהל מערכת',
                role: 'admin',
                avatar: 'https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff'
            });
        }, 1000);
        return;
    }

    const result = await api.login(username, password);

    if ('user' in result) {
      onLoginSuccess(result.user);
    } else {
      setError(result.error);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 animate-fade-in">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-blue-600 p-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-2">התחברות</h2>
          <p className="text-blue-100">הכנס לאזור האישי שלך</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg flex items-center gap-2 text-sm">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">שם משתמש</label>
            <div className="relative">
              <div className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-400">
                <UserIcon size={20} />
              </div>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="הכנס שם משתמש"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">סיסמה</label>
            <div className="relative">
              <div className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-400">
                <Lock size={20} />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="********"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <LogIn size={20} />
                כניסה
              </>
            )}
          </button>
          
          <div className="text-center text-xs text-gray-400 mt-4">
             <p>משתמש זמני לבדיקה: admin / admin</p>
          </div>
        </form>
      </div>
    </div>
  );
};