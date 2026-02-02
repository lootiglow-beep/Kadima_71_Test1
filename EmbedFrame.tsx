import React, { useState } from 'react';
import { Loader2, ExternalLink } from 'lucide-react';

interface EmbedFrameProps {
  title: string;
  url: string;
  className?: string;
}

export const EmbedFrame: React.FC<EmbedFrameProps> = ({ title, url, className }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  return (
    <div className={`relative bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col ${className}`}>
      {/* Header for the Frame */}
      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex justify-between items-center">
        <h3 className="font-medium text-gray-700 truncate">{title}</h3>
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
        >
          <span className="hidden sm:inline">פתח בחלון חדש</span>
          <ExternalLink size={14} />
        </a>
      </div>

      {/* Content */}
      <div className="relative flex-1 w-full min-h-[500px] bg-gray-100">
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 z-10">
            <Loader2 className="animate-spin mb-2" size={32} />
            <p>טוען תוכן...</p>
          </div>
        )}
        
        {hasError ? (
           <div className="absolute inset-0 flex flex-col items-center justify-center text-red-500 p-4 text-center">
             <p className="font-bold">שגיאה בטעינת התוכן</p>
             <p className="text-sm text-gray-600 mt-2">ייתכן שהאתר חוסם הטמעה (X-Frame-Options).</p>
             <a href={url} target="_blank" rel="noreferrer" className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md">
               מעבר לקישור המקורי
             </a>
           </div>
        ) : (
          <iframe 
            src={url} 
            title={title}
            className="w-full h-full border-0"
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setHasError(true);
            }}
            // Sandbox attributes for security, allowing scripts and forms
            sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
          />
        )}
      </div>
    </div>
  );
};