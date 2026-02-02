import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PlayCircle } from 'lucide-react';

interface LandingProps {
  onEnter: () => void;
}

export const Landing: React.FC<LandingProps> = ({ onEnter }) => {
  const navigate = useNavigate();

  const handleEnter = () => {
    onEnter(); // Triggers music start
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-800 flex flex-col items-center justify-center text-white p-4 relative overflow-hidden">
      
      {/* Decorative Circles */}
      <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
      <div className="absolute bottom-10 left-10 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"></div>

      <div className="z-10 text-center max-w-2xl animate-fade-in-up">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 font-heading tracking-tight">
          ברוכים הבאים
        </h1>
        <p className="text-xl md:text-2xl text-blue-100 mb-12 font-light">
          הפורטל האישי שלך לניהול, מדיה ותוכן.
        </p>

        <button
          onClick={handleEnter}
          className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-blue-600 font-lg rounded-full hover:bg-blue-500 hover:scale-105 shadow-2xl ring-4 ring-blue-600/30 focus:outline-none"
        >
          <span className="ml-3 text-lg">כניסה למערכת</span>
          <PlayCircle className="w-6 h-6 transition-transform group-hover:rotate-12" />
        </button>
      </div>
    </div>
  );
};