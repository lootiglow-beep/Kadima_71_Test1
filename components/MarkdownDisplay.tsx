import React from 'react';

interface MarkdownDisplayProps {
  content: string;
  className?: string;
}

export const MarkdownDisplay: React.FC<MarkdownDisplayProps> = ({ content, className = '' }) => {
  if (!content) return null;

  const renderLine = (line: string, index: number) => {
    // Headers (H1 - H6)
    if (line.startsWith('# ')) return <h1 key={index} className="text-3xl font-bold mb-3 mt-4 text-gray-900 border-b pb-1">{parseInline(line.replace('# ', ''))}</h1>;
    if (line.startsWith('## ')) return <h2 key={index} className="text-2xl font-bold mb-3 mt-3 text-gray-800">{parseInline(line.replace('## ', ''))}</h2>;
    if (line.startsWith('### ')) return <h3 key={index} className="text-xl font-bold mb-2 mt-2 text-gray-800">{parseInline(line.replace('### ', ''))}</h3>;
    if (line.startsWith('#### ')) return <h4 key={index} className="text-lg font-bold mb-2 mt-2 text-gray-700">{parseInline(line.replace('#### ', ''))}</h4>;
    if (line.startsWith('##### ')) return <h5 key={index} className="text-base font-bold mb-1 mt-1 text-gray-700 uppercase">{parseInline(line.replace('##### ', ''))}</h5>;
    if (line.startsWith('###### ')) return <h6 key={index} className="text-sm font-bold mb-1 mt-1 text-gray-500 uppercase tracking-wider">{parseInline(line.replace('###### ', ''))}</h6>;

    // Divider
    if (line.trim() === '---' || line.trim() === '***' || line.trim() === '___') {
        return <hr key={index} className="my-4 border-t-2 border-gray-100" />;
    }

    // List Items (Bullet)
    if (line.startsWith('- ') || line.startsWith('* ')) {
      return (
        <li key={index} className="mr-5 list-disc marker:text-blue-400 pl-2">
          {parseInline(line.substring(2))}
        </li>
      );
    }
    
    // List Items (Numbered - simple detection)
    if (/^\d+\.\s/.test(line)) {
        return (
            <li key={index} className="mr-5 list-decimal marker:text-gray-500 pl-2">
                {parseInline(line.replace(/^\d+\.\s/, ''))}
            </li>
        );
    }

    // Checkbox (Task list)
    if (line.startsWith('[ ] ')) {
      return (
        <div key={index} className="flex items-start gap-2 my-1.5">
          <div className="w-4 h-4 border-2 border-gray-300 rounded mt-1 flex-shrink-0"></div>
          <span className="text-gray-700">{parseInline(line.replace('[ ] ', ''))}</span>
        </div>
      );
    }
    if (line.startsWith('[x] ')) {
      return (
        <div key={index} className="flex items-start gap-2 my-1.5 text-gray-500 opacity-70">
           <div className="w-4 h-4 bg-blue-500 border-2 border-blue-500 rounded mt-1 flex-shrink-0 flex items-center justify-center">
               <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
           </div>
          <span className="line-through decoration-gray-400">{parseInline(line.replace('[x] ', ''))}</span>
        </div>
      );
    }

    // Empty line
    if (line.trim() === '') return <div key={index} className="h-2"></div>;

    // Regular paragraph
    return <p key={index} className="mb-1 leading-relaxed text-gray-700">{parseInline(line)}</p>;
  };

  // Helper to handle inline styling
  const parseInline = (text: string) => {
    // Regex explanation:
    // \*\*.*?\*\* -> Bold
    // \*.*?\* -> Italic
    // <u>.*?</u> -> Underline
    // <s>.*?</s> -> Strikethrough
    // <span.*?>.*?</span> -> Color/Background
    const regex = /(\*\*.*?\*\*|\*.*?\*|<u>.*?<\/u>|<s>.*?<\/s>|<span.*?>.*?<\/span>)/g;
    const parts = text.split(regex);
    
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-bold">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={i} className="italic">{part.slice(1, -1)}</em>;
      }
      if (part.startsWith('<u>') && part.endsWith('</u>')) {
        return <u key={i} className="underline decoration-2 underline-offset-2">{part.slice(3, -4)}</u>;
      }
      if (part.startsWith('<s>') && part.endsWith('</s>')) {
        return <s key={i} className="line-through text-gray-400">{part.slice(3, -4)}</s>;
      }
      if (part.startsWith('<span') && part.endsWith('</span>')) {
          return <span key={i} dangerouslySetInnerHTML={{__html: part}} />;
      }
      return part;
    });
  };

  return (
    <div className={`markdown-content ${className} dir-rtl text-right break-words`}>
      {content.split('\n').map((line, i) => renderLine(line, i))}
    </div>
  );
};