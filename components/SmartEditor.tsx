import React, { useRef } from 'react';
import { Bold, Italic, Underline, Strikethrough, List, ListOrdered, CheckSquare, Type, Minus, Palette, Heading } from 'lucide-react';

interface SmartEditorProps {
  value: string;
  onChange: (val: string) => void;
  className?: string;
}

export const SmartEditor: React.FC<SmartEditorProps> = ({ value, onChange, className = '' }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertText = (before: string, after: string = '') => {
    const el = textareaRef.current;
    if (!el) return;

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const text = el.value;
    const selectedText = text.substring(start, end);
    const replacement = before + selectedText + after;

    const newValue = text.substring(0, start) + replacement + text.substring(end);
    onChange(newValue);
    
    // Restore focus and cursor
    setTimeout(() => {
        el.focus();
        el.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  const insertColor = (color: string) => {
    insertText(`<span style="color:${color}">`, '</span>');
  };

  const insertBgColor = (color: string) => {
    insertText(`<span style="background-color:${color}">`, '</span>');
  };

  const insertHeader = (level: number) => {
      const hashes = '#'.repeat(level) + ' ';
      insertText(hashes);
  };

  return (
    <div className={`border border-gray-300 rounded-lg overflow-hidden bg-white ${className} flex flex-col`}>
      {/* Toolbar */}
      <div className="bg-gray-50 border-b p-2 flex flex-wrap gap-1 items-center">
        
        {/* Headings */}
        <div className="relative group mr-1">
            <button type="button" className="p-1.5 hover:bg-gray-200 rounded flex items-center gap-1" title="כותרות">
                <Heading size={16} />
                <span className="text-[10px]">▼</span>
            </button>
            <div className="absolute top-full right-0 bg-white shadow-lg border rounded p-1 hidden group-hover:flex flex-col gap-1 z-20 min-w-[120px]">
                {[1, 2, 3, 4, 5, 6].map(h => (
                    <button key={h} type="button" onClick={() => insertHeader(h)} className="text-right px-2 py-1 hover:bg-gray-100 text-sm">
                        כותרת H{h}
                    </button>
                ))}
            </div>
        </div>
        
        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* Styling */}
        <button type="button" onClick={() => insertText('**', '**')} className="p-1.5 hover:bg-gray-200 rounded" title="מודגש (Bold)">
           <Bold size={16} />
        </button>
        <button type="button" onClick={() => insertText('*', '*')} className="p-1.5 hover:bg-gray-200 rounded" title="נטוי (Italic)">
           <Italic size={16} />
        </button>
        <button type="button" onClick={() => insertText('<u>', '</u>')} className="p-1.5 hover:bg-gray-200 rounded" title="קו תחתון">
           <Underline size={16} />
        </button>
        <button type="button" onClick={() => insertText('<s>', '</s>')} className="p-1.5 hover:bg-gray-200 rounded" title="קו חוצה">
           <Strikethrough size={16} />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* Lists */}
        <button type="button" onClick={() => insertText('- ')} className="p-1.5 hover:bg-gray-200 rounded" title="רשימה">
           <List size={16} />
        </button>
        <button type="button" onClick={() => insertText('1. ')} className="p-1.5 hover:bg-gray-200 rounded" title="רשימה ממוספרת">
           <ListOrdered size={16} />
        </button>
        <button type="button" onClick={() => insertText('[ ] ')} className="p-1.5 hover:bg-gray-200 rounded" title="תיבת סימון">
           <CheckSquare size={16} />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        
        {/* Color Pickers */}
        <div className="flex items-center gap-1 mr-2 border-r pr-2">
            <div className="relative group">
                <button type="button" className="p-1.5 hover:bg-gray-200 rounded flex items-center gap-1" title="צבע טקסט">
                    <Palette size={16} className="text-blue-600"/>
                    <span className="text-[10px]">A</span>
                </button>
                <div className="absolute top-full right-0 bg-white shadow-lg border rounded p-1 hidden group-hover:flex gap-1 z-10 flex-wrap w-24">
                    {['#000000', '#555555', '#EF4444', '#DC2626', '#3B82F6', '#2563EB', '#10B981', '#059669', '#F59E0B', '#D97706', '#8B5CF6'].map(c => (
                        <button key={c} type="button" onClick={() => insertColor(c)} className="w-5 h-5 rounded-full border border-gray-200" style={{backgroundColor: c}} />
                    ))}
                </div>
            </div>
            <div className="relative group">
                <button type="button" className="p-1.5 hover:bg-gray-200 rounded flex items-center gap-1" title="מרקר / רקע">
                    <Type size={16} className="bg-yellow-200 px-0.5 rounded"/>
                </button>
                <div className="absolute top-full right-0 bg-white shadow-lg border rounded p-1 hidden group-hover:flex gap-1 z-10 flex-wrap w-24">
                    {['#FEF3C7', '#FEE2E2', '#DBEAFE', '#D1FAE5', '#F3E8FF', '#F4F4F5'].map(c => (
                        <button key={c} type="button" onClick={() => insertBgColor(c)} className="w-5 h-5 rounded border border-gray-200" style={{backgroundColor: c}} />
                    ))}
                </div>
            </div>
        </div>

        <button type="button" onClick={() => insertText('\n---\n')} className="p-1.5 hover:bg-gray-200 rounded" title="קו מפריד">
           <Minus size={16} />
        </button>
      </div>

      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 p-4 outline-none resize-none font-sans text-sm min-h-[300px] leading-relaxed"
        placeholder="התחל לכתוב כאן... סמן טקסט כדי לעצב אותו."
        dir="rtl"
      />
      <div className="bg-gray-50 text-[10px] text-gray-400 p-1 px-3 border-t flex justify-between">
          <span>תומך Markdown מורחב</span>
          <span>HTML עבור צבעים ועיצוב מתקדם</span>
      </div>
    </div>
  );
};