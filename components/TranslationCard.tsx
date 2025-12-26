
import React from 'react';
import { TranslationRecord } from '../types';

interface TranslationCardProps {
  record: TranslationRecord;
  onDelete: (id: string) => void;
  onCopy: (text: string) => void;
}

const TranslationCard: React.FC<TranslationCardProps> = ({ record, onDelete, onCopy }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 transition-all hover:shadow-md group">
      <div className="flex justify-between items-start mb-4">
        <span className="text-xs font-medium text-slate-400">
          {new Date(record.timestamp).toLocaleString()}
        </span>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={() => onCopy(record.translated)}
            className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-md hover:bg-indigo-50"
            title="Copy English"
          >
            <i className="fa-regular fa-copy"></i>
          </button>
          <button 
            onClick={() => onDelete(record.id)}
            className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50"
            title="Delete"
          >
            <i className="fa-regular fa-trash-can"></i>
          </button>
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Original</h4>
          <p className="text-slate-700 urdu-font text-lg leading-relaxed">{record.original}</p>
        </div>
        
        <div className="pt-3 border-t border-slate-100">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 mb-1">Professional English</h4>
          <p className="text-slate-800 font-medium leading-relaxed">{record.translated}</p>
        </div>
      </div>
    </div>
  );
};

export default TranslationCard;
