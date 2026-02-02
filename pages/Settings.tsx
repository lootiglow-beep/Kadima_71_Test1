import React, { useState, useEffect } from 'react';
import { Save, RefreshCw, Music, Check, PlayCircle, Settings as SettingsIcon } from 'lucide-react';
import { AudioState } from '../types';
import { DEFAULT_TRACK } from '../constants';

interface SettingsProps {
  setAudioState: React.Dispatch<React.SetStateAction<AudioState>>;
}

export const Settings: React.FC<SettingsProps> = ({ setAudioState }) => {
  const [defaultTrackUrl, setDefaultTrackUrl] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('app_default_track');
    setDefaultTrackUrl(saved || DEFAULT_TRACK);
  }, []);

  const handleSave = () => {
    if (!defaultTrackUrl.trim()) return;
    
    // Convert drive link if pasted raw
    const processedUrl = convertGoogleDriveLink(defaultTrackUrl.trim());
    
    localStorage.setItem('app_default_track', processedUrl);
    setDefaultTrackUrl(processedUrl); // Update state to show processed URL
    
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleReset = () => {
    localStorage.removeItem('app_default_track');
    setDefaultTrackUrl(DEFAULT_TRACK);
    alert('ההגדרות אופסו למוזיקת המערכת המקורית');
  };

  const handleTestPlay = () => {
     setAudioState(prev => ({
         ...prev,
         currentTrackUrl: defaultTrackUrl,
         isPlaying: true
     }));
  };

  const convertGoogleDriveLink = (url: string): string => {
    // If it's not a drive link, or already in download format
    if (!url.includes('drive.google.com') && !url.includes('docs.google.com')) return url;

    // Try to extract ID from various patterns
    // 1. /file/d/ID/view
    // 2. id=ID
    let id = '';
    
    const fileDMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileDMatch && fileDMatch[1]) {
        id = fileDMatch[1];
    } else {
        const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
        if (idMatch && idMatch[1]) {
            id = idMatch[1];
        }
    }

    if (id) {
      return `https://docs.google.com/uc?export=download&id=${id}`;
    }
    
    return url;
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in pb-20">
      <div className="mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-gray-100 rounded-full text-gray-600">
              <SettingsIcon size={32} />
          </div>
          <div>
              <h1 className="text-2xl font-bold text-gray-800">הגדרות מערכת</h1>
              <p className="text-gray-500">ניהול העדפות אישיות והגדרות אפליקציה</p>
          </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="bg-gray-50 p-4 border-b border-gray-100 flex items-center gap-2">
              <Music className="text-blue-600" size={20} />
              <h2 className="font-bold text-gray-700">מוזיקת כניסה (ברירת מחדל)</h2>
          </div>
          
          <div className="p-6 space-y-4">
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">קישור לשיר ברירת המחדל</label>
                  <p className="text-xs text-gray-500 mb-2">שיר זה יתנגן אוטומטית בכל פעם שתיכנס לאפליקציה (אלא אם תשנה אותו כאן).</p>
                  
                  <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={defaultTrackUrl}
                        onChange={(e) => setDefaultTrackUrl(e.target.value)}
                        className="flex-1 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-left"
                        placeholder="https://..."
                        dir="ltr"
                      />
                  </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                  <button 
                    onClick={handleSave}
                    className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold transition-all ${isSaved ? 'bg-green-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                  >
                      {isSaved ? <Check size={18}/> : <Save size={18}/>}
                      {isSaved ? 'נשמר!' : 'שמור שינויים'}
                  </button>

                  <button 
                    onClick={handleTestPlay}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 font-medium"
                  >
                      <PlayCircle size={18} /> בדוק שיר
                  </button>

                  <button 
                    onClick={handleReset}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 font-medium mr-auto"
                  >
                      <RefreshCw size={18} /> אפס לברירת המחדל המקורית
                  </button>
              </div>
          </div>
      </div>

      {/* Placeholder for other settings */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden opacity-60">
          <div className="bg-gray-50 p-4 border-b border-gray-100 flex items-center gap-2">
              <SettingsIcon className="text-gray-400" size={20} />
              <h2 className="font-bold text-gray-500">הגדרות כלליות (בקרוב)</h2>
          </div>
          <div className="p-6">
              <p className="text-gray-400 text-center">אפשרויות נוספות לניהול תצוגה והתראות יתווספו בעתיד.</p>
          </div>
      </div>
    </div>
  );
};