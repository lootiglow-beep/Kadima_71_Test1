import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, Square, Volume2, Volume1, VolumeX, Music, Upload, Link2, Plus, Mic, X, Save, RefreshCw, Trash, Settings, Check, AlertCircle, PlayCircle } from 'lucide-react';
import { AudioState } from '../types';
import { DEFAULT_TRACK } from '../constants';

interface AudioPlayerProps {
  audioState: AudioState;
  setAudioState: React.Dispatch<React.SetStateAction<AudioState>>;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioState, setAudioState }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Menu State
  const [showMenu, setShowMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);

  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (audioRef.current) {
      if (audioState.isPlaying && audioState.currentTrackUrl) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
                setAutoplayBlocked(false);
            })
            .catch(error => {
                if (error.name === 'NotAllowedError') {
                    // Browser blocked autoplay
                    console.warn("Autoplay blocked by browser. User interaction needed.");
                    setAutoplayBlocked(true);
                } else if (error.name !== 'AbortError') {
                    console.error("Audio Playback Error:", error);
                }
            });
        }
      } else {
        audioRef.current.pause();
        setAutoplayBlocked(false);
      }
    }
  }, [audioState.isPlaying, audioState.currentTrackUrl]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = audioState.volume;
    }
  }, [audioState.volume]);

  // --- Core Audio Controls ---
  const togglePlay = () => {
    if (!audioState.currentTrackUrl) {
        setShowMenu(true);
        return;
    }
    setAudioState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
    setAutoplayBlocked(false);
  };

  const stopMusic = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setAudioState(prev => ({ ...prev, isPlaying: false }));
    setAutoplayBlocked(false);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setAudioState(prev => ({ ...prev, volume: newVolume }));
  };

  // --- Handlers: Upload / Link / Record ---

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      playNewTrack(objectUrl);
      setShowMenu(false);
    }
  };

  const handleUrlInput = () => {
    const url = window.prompt("הדבק כאן קישור (Google Drive, YouTube, MP3):");
    if (url && url.trim() !== "") {
      const processedUrl = convertGoogleDriveLink(url.trim());
      playNewTrack(processedUrl);
      setShowMenu(false);
    }
  };

  const startRecording = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        chunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) chunksRef.current.push(e.data);
        };

        mediaRecorder.onstop = () => {
            const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
            const audioUrl = URL.createObjectURL(blob);
            playNewTrack(audioUrl);
            setShowMenu(false);
        };

        mediaRecorder.start();
        setIsRecording(true);
    } catch (err) {
        console.error("Microphone access denied", err);
        alert("לא ניתן לגשת למיקרופון. אנא בדוק הרשאות ונסה שוב.");
    }
  };

  const stopRecording = () => {
      if (mediaRecorderRef.current && isRecording) {
          mediaRecorderRef.current.stop();
          setIsRecording(false);
          mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
  };

  const playNewTrack = (url: string) => {
      setAudioState(prev => ({
        ...prev,
        currentTrackUrl: url,
        isPlaying: true
      }));
  };

  // --- Settings Management (Smart Save) ---
  const saveCurrentAsDefault = async () => {
      if (!audioState.currentTrackUrl) return;

      setSaveStatus('saving');

      try {
        // Case 1: If it's a blob URL (Local file or recording), we must convert it to Base64
        if (audioState.currentTrackUrl.startsWith('blob:')) {
            const response = await fetch(audioState.currentTrackUrl);
            const blob = await response.blob();
            
            // Check size (LocalStorage has limit around 5MB)
            if (blob.size > 4 * 1024 * 1024) {
                alert("הקובץ גדול מדי לשמירה מקומית (מקסימום 4MB). נסה להשתמש בקישור חיצוני.");
                setSaveStatus('error');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                const base64data = reader.result as string;
                localStorage.setItem('app_default_track', base64data);
                setSaveStatus('success');
                setTimeout(() => setSaveStatus('idle'), 2000);
            };
            reader.onerror = () => setSaveStatus('error');
            reader.readAsDataURL(blob);
        } 
        // Case 2: Regular URL
        else {
            localStorage.setItem('app_default_track', audioState.currentTrackUrl);
            setSaveStatus('success');
            setTimeout(() => setSaveStatus('idle'), 2000);
        }
      } catch (e) {
          console.error("Save failed", e);
          setSaveStatus('error');
      }
  };

  const resetDefault = () => {
      localStorage.removeItem('app_default_track');
      setAudioState(prev => ({ ...prev, currentTrackUrl: DEFAULT_TRACK, isPlaying: false }));
      alert('הגדרות המוזיקה אופסו לברירת המחדל.');
      setShowMenu(false);
  };

  const clearCurrentTrack = () => {
      setAudioState(prev => ({ ...prev, currentTrackUrl: '', isPlaying: false }));
      setShowMenu(false);
  };

  // --- Helpers ---
  const convertGoogleDriveLink = (url: string): string => {
    // If it's not a drive link, or already in download format
    if (!url.includes('drive.google.com') && !url.includes('docs.google.com')) return url;
    
    // Extract ID using multiple regex patterns
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

  const getVolumeIcon = () => {
    if (audioState.volume === 0) return <VolumeX size={16} />;
    if (audioState.volume < 0.5) return <Volume1 size={16} />;
    return <Volume2 size={16} />;
  };

  return (
    <>
        {/* Hidden File Input */}
        <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept="audio/*" 
            className="hidden" 
        />

        {/* Autoplay Blocked Warning */}
        {autoplayBlocked && (
            <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in-up">
                <button 
                  onClick={() => { audioRef.current?.play(); setAutoplayBlocked(false); }}
                  className="bg-red-500 text-white px-6 py-2 rounded-full shadow-lg font-bold flex items-center gap-2 hover:bg-red-600 transition-colors"
                >
                    <PlayCircle size={20} />
                    לחץ להפעלת המוזיקה
                </button>
            </div>
        )}

        {/* Main Audio Bar */}
        <div className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm transition-all duration-300 h-16 flex items-center">
        <audio 
            ref={audioRef} 
            src={audioState.currentTrackUrl} 
            loop 
            autoPlay
            playsInline
            preload="auto"
        />
        
        <div className="container mx-auto px-4 flex items-center justify-between">
            
            {/* Left: Plus Menu & Indicator */}
            <div className="flex items-center gap-3">
                <button 
                    onClick={() => { setShowMenu(!showMenu); setShowSettings(false); setSaveStatus('idle'); }}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${showMenu ? 'bg-blue-600 text-white rotate-45' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'}`}
                >
                    <Plus size={24} />
                </button>

                <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors ${audioState.isPlaying ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-50 text-gray-400 border border-gray-100'}`}>
                    <Music size={14} className={audioState.isPlaying ? 'animate-bounce' : ''} />
                    <span className="text-xs font-medium truncate max-w-[100px]">
                        {isRecording ? 'מקליט...' : (audioState.currentTrackUrl ? 'מתנגן כעת' : 'אין מוזיקה')}
                    </span>
                </div>
            </div>

            {/* Center: Play/Stop Controls */}
            <div className="flex items-center gap-4">
                <button 
                    onClick={stopMusic}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all active:scale-95"
                    title="עצור"
                >
                    <Square size={18} fill="currentColor" />
                </button>
                
                <button 
                    onClick={togglePlay}
                    className={`w-12 h-12 flex items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 ${audioState.isPlaying ? 'bg-white border-2 border-blue-600 text-blue-600' : 'bg-blue-600 text-white'}`}
                >
                    {audioState.isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
                </button>
            </div>

            {/* Right: Volume */}
            <div className="flex items-center gap-2 w-24 sm:w-32 group">
                <button 
                    onClick={() => setAudioState(p => ({...p, volume: p.volume === 0 ? 0.5 : 0}))}
                    className="text-gray-400 hover:text-blue-600 transition-colors"
                >
                    {getVolumeIcon()}
                </button>
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={audioState.volume}
                    onChange={handleVolumeChange}
                    className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600 dir-ltr hover:h-1.5 transition-all"
                    style={{ direction: 'ltr' }}
                />
            </div>
        </div>
        </div>

        {/* Plus Menu Overlay */}
        {showMenu && (
            <div className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm" onClick={() => setShowMenu(false)}>
                <div 
                    className="absolute top-20 right-4 sm:right-auto sm:left-4 bg-white rounded-2xl shadow-2xl p-4 w-72 border border-gray-100 animate-fade-in-up"
                    onClick={(e) => e.stopPropagation()} // Prevent close on menu click
                >
                    {!showSettings ? (
                        <>
                            <div className="flex justify-between items-center mb-4 pb-2 border-b">
                                <h3 className="font-bold text-gray-700">הוספת מדיה</h3>
                                <button onClick={() => setShowSettings(true)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-full" title="הגדרות נגן">
                                    <Settings size={18} />
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-3">
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex flex-col items-center gap-2 p-3 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                                >
                                    <Upload size={24} />
                                    <span className="text-xs font-bold">קובץ</span>
                                </button>

                                <button 
                                    onClick={handleUrlInput}
                                    className="flex flex-col items-center gap-2 p-3 rounded-xl bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors"
                                >
                                    <Link2 size={24} />
                                    <span className="text-xs font-bold">קישור</span>
                                </button>

                                <button 
                                    onClick={isRecording ? stopRecording : startRecording}
                                    className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${isRecording ? 'bg-red-100 text-red-600 animate-pulse ring-2 ring-red-500' : 'bg-red-50 text-red-500 hover:bg-red-100'}`}
                                >
                                    {isRecording ? <Square size={24} fill="currentColor"/> : <Mic size={24} />}
                                    <span className="text-xs font-bold">{isRecording ? 'עצור' : 'הקלט'}</span>
                                </button>
                            </div>

                            <p className="text-[10px] text-gray-400 mt-4 text-center bg-gray-50 p-2 rounded">
                                טיפ: כדי שהשיר יישמר גם בכניסה הבאה, כנס להגדרות (גלגל השיניים) ולחץ על "קבע כברירת מחדל".
                            </p>
                        </>
                    ) : (
                        // Settings View
                        <>
                            <div className="flex justify-between items-center mb-4 pb-2 border-b">
                                <h3 className="font-bold text-gray-700 flex items-center gap-2"><Settings size={16}/> הגדרות נגן</h3>
                                <button onClick={() => setShowSettings(false)} className="text-sm text-blue-600 hover:underline">חזרה</button>
                            </div>

                            <div className="space-y-2">
                                <button 
                                    onClick={saveCurrentAsDefault}
                                    disabled={!audioState.currentTrackUrl || saveStatus === 'saving'}
                                    className={`w-full flex items-center gap-3 p-3 text-right hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50
                                        ${saveStatus === 'success' ? 'bg-green-50 ring-1 ring-green-200' : ''}
                                        ${saveStatus === 'error' ? 'bg-red-50 ring-1 ring-red-200' : ''}
                                    `}
                                >
                                    <div className={`p-2 rounded-full transition-all ${saveStatus === 'success' ? 'bg-green-500 text-white' : 'bg-green-100 text-green-600'}`}>
                                        {saveStatus === 'saving' ? <RefreshCw size={16} className="animate-spin"/> : 
                                         saveStatus === 'success' ? <Check size={16}/> : 
                                         saveStatus === 'error' ? <AlertCircle size={16}/> : <Save size={16}/>}
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm text-gray-800">
                                            {saveStatus === 'success' ? 'נשמר בהצלחה!' : 
                                             saveStatus === 'error' ? 'שגיאה בשמירה' : 'קבע כברירת מחדל'}
                                        </div>
                                        <div className="text-[10px] text-gray-500">
                                            {saveStatus === 'success' ? 'השיר יתנגן בפעם הבאה' : 'שמור את השיר הנוכחי לכניסה הבאה'}
                                        </div>
                                    </div>
                                </button>

                                <button 
                                    onClick={resetDefault}
                                    className="w-full flex items-center gap-3 p-3 text-right hover:bg-gray-50 rounded-lg"
                                >
                                    <div className="p-2 bg-orange-100 text-orange-600 rounded-full"><RefreshCw size={16}/></div>
                                    <div>
                                        <div className="font-bold text-sm text-gray-800">אפס הגדרות</div>
                                        <div className="text-[10px] text-gray-500">חזור למוזיקת המערכת המקורית</div>
                                    </div>
                                </button>

                                <button 
                                    onClick={clearCurrentTrack}
                                    className="w-full flex items-center gap-3 p-3 text-right hover:bg-red-50 rounded-lg group"
                                >
                                    <div className="p-2 bg-gray-100 text-gray-500 group-hover:bg-white group-hover:text-red-500 rounded-full"><Trash size={16}/></div>
                                    <div>
                                        <div className="font-bold text-sm text-gray-800 group-hover:text-red-600">הסר שיר נוכחי</div>
                                        <div className="text-[10px] text-gray-500">הפסק את המוזיקה לגמרי</div>
                                    </div>
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        )}
    </>
  );
};