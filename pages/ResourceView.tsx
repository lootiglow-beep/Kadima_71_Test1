import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Resource } from '../types';
import { ArrowRight, Box } from 'lucide-react';
import { NativeExpenseForm } from '../components/NativeExpenseForm';
import { EmbedFrame } from '../components/EmbedFrame';

interface ResourceViewProps {
  resources: Resource[];
}

export const ResourceView: React.FC<ResourceViewProps> = ({ resources }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const resource = resources.find(r => r.id === id);

  if (!resource) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-gray-500">
        <Box size={48} className="mb-4 opacity-20" />
        <p className="text-xl font-medium">הפריט לא נמצא</p>
        <button 
          onClick={() => navigate('/dashboard')}
          className="mt-4 text-blue-600 hover:underline"
        >
          חזור ללוח הבקרה
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto animate-fade-in pb-12">
      {/* Header / Nav Back */}
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center text-gray-500 hover:text-blue-600 mb-6 transition-colors group"
      >
        <div className="p-2 bg-white border border-gray-200 rounded-full shadow-sm group-hover:border-blue-300 ml-2">
           <ArrowRight size={20} />
        </div>
        <span className="font-medium">חזרה ללוח הבקרה</span>
      </button>

      {/* Content Area */}
      <div className="w-full">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{resource.title}</h1>
        <p className="text-gray-500 mb-6">{resource.description}</p>

        {resource.type === 'native' ? (
          <NativeExpenseForm />
        ) : (
          <div className="h-[75vh] w-full shadow-md rounded-xl overflow-hidden border border-gray-200 bg-white">
            <EmbedFrame 
              title={resource.title} 
              url={resource.url} 
              className="w-full h-full border-0"
            />
          </div>
        )}
      </div>
    </div>
  );
};