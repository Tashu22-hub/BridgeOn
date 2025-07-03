import React from 'react';

export const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-purple-400 focus:ring-purple-500 rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-50">{title}</h2> 
          <button
            onClick={onClose}
            className="text-white hover:text-gray-150"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};
