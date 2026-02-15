
import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center transition-opacity"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md m-4 transform transition-all"
        onClick={e => e.stopPropagation()}
      >
        {title && (
          <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 id="modal-title" className="text-xl font-bold text-neutral-dark dark:text-white">{title}</h2>
            <button onClick={onClose} className="text-neutral-medium dark:text-gray-400 hover:text-neutral-dark dark:hover:text-white">
              <X size={24} />
            </button>
          </div>
        )}
        <div className="p-6 text-neutral-dark dark:text-gray-200">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
