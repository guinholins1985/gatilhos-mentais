
import React, { useState } from 'react';
import { ClipboardIcon } from './icons/ClipboardIcon';

interface CopyCardProps {
  triggerName: string;
  copyText: string;
}

const CopyCard: React.FC<CopyCardProps> = ({ triggerName, copyText }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(copyText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

  return (
    <div className="bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-700 relative">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 pr-16">
          {triggerName}
        </h3>
        <button 
            onClick={handleCopy}
            className="absolute top-4 right-4 bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold py-2 px-3 rounded-lg flex items-center transition-colors duration-200"
        >
            <ClipboardIcon />
            <span className="ml-2 text-sm">{copied ? 'Copiado!' : 'Copiar'}</span>
        </button>
      </div>
      <p className="text-slate-300 whitespace-pre-wrap">{copyText}</p>
    </div>
  );
};

export default CopyCard;
