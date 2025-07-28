import React, { useState, useRef, useEffect } from 'react';
import { ChatWidgetInterface } from './ChatWidgetInterface';
import { ChatBubbleLeftRightIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatWidgetProps {
  isVisible?: boolean;
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({ isVisible = true }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const widgetRef = useRef<HTMLDivElement>(null);

  // Close widget when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (widgetRef.current && !widgetRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  if (!isVisible) return null;

  return (
    <div ref={widgetRef} className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ type: 'spring', damping: 30, stiffness: 400 }}
            className="absolute bottom-16 right-0 w-80 h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden backdrop-blur-sm"
          >
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 bg-white border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-[#094d57] to-[#f1872c] rounded-lg flex items-center justify-center">
                  <ChatBubbleLeftRightIcon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">AI Assistant</h3>
                  <p className="text-xs text-gray-500">Ready to help</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                  title={isMinimized ? 'Expand' : 'Minimize'}
                >
                  <div className="w-3 h-3 border border-current rounded-sm"></div>
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                  title="Close"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chat Content */}
            {!isMinimized && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 'calc(500px - 4rem)' }}
                exit={{ height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <ChatWidgetInterface />
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 bg-white text-[#094d57] rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center border border-gray-200"
        title="Open AI Assistant"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <XMarkIcon className="w-5 h-5" />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <ChatBubbleLeftRightIcon className="w-5 h-5" />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Subtle pulse animation when closed */}
        {!isOpen && (
          <div className="absolute inset-0 bg-[#094d57] rounded-full animate-ping opacity-10"></div>
        )}
      </motion.button>
    </div>
  );
}; 