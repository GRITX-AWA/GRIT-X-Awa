import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '6xl';
  flexLayout?: boolean;
  fullscreen?: boolean;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, maxWidth = '2xl', flexLayout = false, fullscreen = false }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    'sm': 'max-w-sm',
    'md': 'max-w-md',
    'lg': 'max-w-lg',
    'xl': 'max-w-xl',
    '2xl': 'max-w-2xl',
    '6xl': 'max-w-6xl'
  };

  return createPortal(
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-2 sm:p-4 md:p-6 overscroll-contain"
      onClick={onClose}
    >
      <div
        className={`bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-2xl ${fullscreen ? 'w-full h-full max-w-none max-h-none' : `${maxWidthClasses[maxWidth]} w-full max-h-[95vh] sm:max-h-[90vh]`} ${flexLayout ? 'overflow-hidden flex flex-col' : 'overflow-y-auto'} themed-scrollbar touch-manipulation`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  );
};

export default Modal;
