import React from 'react';
import { AudioPlayer } from './AudioPlayer';
import { AudioState, User } from '../types';
import { Link, useLocation } from 'react-router-dom';
import { Home, Menu, MessageSquare, Star, BookOpen } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  audioState: AudioState;
  setAudioState: React.Dispatch<React.SetStateAction<AudioState>>;
  user: User;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, audioState, setAudioState, user, onLogout }) => {
  const location = useLocation();

  const NavItem = ({ to, icon: Icon, label, isCenter = false }: { to: string, icon: any, label: string, isCenter?: boolean }) => {
    const isActive = location.pathname === to || (to === '/dashboard' && location.pathname.startsWith('/resource'));
    
    // Standard button style
    const baseClasses = `flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${isActive ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`;
    
    // Center button (Home) style with pop-out effect
    if (isCenter) {
      return (
        <div className="flex justify-center items-end pb-2">
            <Link 
              to={to} 
              className={`flex flex-col items-center justify-center w-14 h-14 rounded-full shadow-lg transition-transform hover:scale-105 transform -translate-y-4 ${
                isActive ? 'bg-blue-600 text-white ring-4 ring-blue-50' : 'bg-white text-gray-500 border border-gray-200'
              }`}
            >
              <Icon size={24} strokeWidth={2.5} />
            </Link>
            <span className="absolute bottom-1 text-[10px] font-medium text-gray-500">{label}</span>
        </div>
      );
    }

    return (
      <Link to={to} className={baseClasses}>
        <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
        <span className="text-[10px] font-medium">{label}</span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/50">
      <AudioPlayer audioState={audioState} setAudioState={setAudioState} />
      
      {/* Top Bar removed as per request */}

      <div className="flex flex-1 overflow-hidden">
        {/* Main Content Area */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 mb-20 md:mb-24 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Modern Bottom Navigation - 5 Buttons */}
      <nav className="fixed bottom-0 w-full bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] z-40 h-16">
        <div className="container mx-auto max-w-lg h-full grid grid-cols-5 items-center">
          
          <NavItem to="/menu" icon={Menu} label="תפריט" />
          <NavItem to="/messages" icon={MessageSquare} label="צ'אט" />
          
          {/* Main Home Button Area (Center) */}
          <div className="relative h-full">
             <NavItem to="/dashboard" icon={Home} label="ראשי" isCenter={true} />
          </div>
          
          <NavItem to="/important" icon={Star} label="חשוב" />
          <NavItem to="/wiki" icon={BookOpen} label="ויקי" />
          
        </div>
      </nav>
    </div>
  );
};