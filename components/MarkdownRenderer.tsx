import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  // A simple formatting for the demo. In a real app, use react-markdown.
  // Here we interpret line breaks and basic headers for visual structure.
  
  const formatText = (text: string) => {
    return text.split('\n').map((line, index) => {
      if (line.startsWith('# ')) {
        return <h1 key={index} className="text-3xl font-bold text-slate-900 mt-8 mb-4 serif border-b pb-2">{line.replace('# ', '')}</h1>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={index} className="text-xl font-bold text-indigo-900 mt-6 mb-3 serif">{line.replace('## ', '')}</h2>;
      }
      if (line.startsWith('### ')) {
        return <h3 key={index} className="text-lg font-semibold text-slate-800 mt-4 mb-2">{line.replace('### ', '')}</h3>;
      }
      if (line.startsWith('*') && line.endsWith('*')) {
        return <p key={index} className="italic text-slate-600 my-2 bg-slate-50 p-2 rounded border-l-4 border-slate-300">{line.replace(/\*/g, '')}</p>;
      }
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
         return <li key={index} className="ml-4 list-disc text-slate-700 leading-relaxed my-1">{line.replace(/^[-*] /, '')}</li>;
      }
      if (line.trim().length === 0) {
        return <br key={index} />;
      }
      // Bold handling (simple)
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <p key={index} className="text-slate-700 leading-relaxed mb-2">
          {parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={i} className="font-semibold text-slate-900">{part.slice(2, -2)}</strong>;
            }
            return part;
          })}
        </p>
      );
    });
  };

  return (
    <div className="prose prose-indigo max-w-none bg-white p-8 rounded-xl shadow-sm border border-slate-200">
      {formatText(content)}
    </div>
  );
};

export default MarkdownRenderer;