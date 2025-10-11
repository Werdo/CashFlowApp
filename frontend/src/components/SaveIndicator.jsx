import React from 'react';
import { Check, RefreshCw, AlertCircle } from 'lucide-react';

const SaveIndicator = ({ status }) => {
  // status: 'idle', 'saving', 'saved', 'error'

  if (status === 'idle') return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className={`
        px-4 py-2 rounded-lg shadow-lg flex items-center gap-2
        transition-all duration-300 transform
        ${status === 'saving' ? 'bg-blue-500 text-white' : ''}
        ${status === 'saved' ? 'bg-green-500 text-white' : ''}
        ${status === 'error' ? 'bg-red-500 text-white' : ''}
      `}>
        {status === 'saving' && (
          <>
            <RefreshCw size={16} className="animate-spin" />
            <span className="text-sm font-medium">Guardando...</span>
          </>
        )}
        {status === 'saved' && (
          <>
            <Check size={16} />
            <span className="text-sm font-medium">Guardado ✓</span>
          </>
        )}
        {status === 'error' && (
          <>
            <AlertCircle size={16} />
            <span className="text-sm font-medium">Error al guardar</span>
          </>
        )}
      </div>
    </div>
  );
};

export default SaveIndicator;
