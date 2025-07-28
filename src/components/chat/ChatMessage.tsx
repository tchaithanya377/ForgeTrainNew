import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChatMessage as ChatMessageType } from '../../lib/gemini';
import { format } from 'date-fns';
import { UserIcon, SparklesIcon, ClipboardDocumentIcon, SpeakerWaveIcon } from '@heroicons/react/24/outline';

interface ChatMessageProps {
  message: ChatMessageType;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(message.content);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`group relative ${isUser ? 'bg-white' : 'bg-gradient-to-r from-gray-50 to-white'}`}
    >
      <div className="flex gap-4 p-4 max-w-4xl mx-auto">
        {/* Enhanced Avatar */}
        <div className="flex-shrink-0">
          {isUser ? (
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg border-2 border-white">
              <UserIcon className="w-5 h-5 text-white" />
            </div>
          ) : (
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg border-2 border-white">
              <SparklesIcon className="w-5 h-5 text-white" />
            </div>
          )}
        </div>
        
        {/* Message Content */}
        <div className="flex-1 min-w-0">
          {/* Enhanced Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className="font-bold text-gray-900">
                {isUser ? 'You' : 'AI Assistant'}
              </span>
              <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full font-medium">
                {format(message.timestamp, 'HH:mm')}
              </span>
            </div>
            
            {/* Enhanced Action Buttons */}
            {!isUser && (
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCopy}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  title={copied ? 'Copied!' : 'Copy message'}
                >
                  <ClipboardDocumentIcon className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSpeak}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  title="Read aloud"
                >
                  <SpeakerWaveIcon className="w-4 h-4" />
                </motion.button>
              </div>
            )}
          </div>
          
          {/* Enhanced Message Text */}
          <div className="prose prose-sm max-w-none">
            <div className="text-gray-800 leading-relaxed whitespace-pre-wrap text-sm font-medium">
              {message.content}
            </div>
          </div>

          {/* Enhanced Copy Success Indicator */}
          {copied && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-3 flex items-center gap-2 text-sm text-green-600"
            >
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1 }}
                className="w-2 h-2 bg-green-500 rounded-full"
              />
              <span className="font-medium">Copied to clipboard!</span>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}; 