import React, { useState } from 'react';
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
    <div className={`group relative ${isUser ? 'bg-white' : 'bg-gradient-to-r from-gray-50 to-white'}`}>
      <div className="flex gap-3 lg:gap-4 p-4 lg:p-6 max-w-4xl mx-auto">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {isUser ? (
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-r from-[#094d57] to-[#0c5a66] rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg">
              <UserIcon className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
            </div>
          ) : (
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-r from-[#094d57] via-[#0c5a66] to-[#f1872c] rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg">
              <SparklesIcon className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
            </div>
          )}
        </div>
        
        {/* Message Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-2 lg:mb-3">
            <div className="flex items-center gap-2 lg:gap-3">
              <span className="font-semibold text-gray-900">
                {isUser ? 'You' : 'AI Assistant'}
              </span>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {format(message.timestamp, 'HH:mm')}
              </span>
            </div>
            
            {/* Action Buttons */}
            {!isUser && (
              <div className="flex items-center gap-1 lg:gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                  onClick={handleCopy}
                  className="p-1.5 lg:p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#094d57]"
                  title={copied ? 'Copied!' : 'Copy message'}
                >
                  <ClipboardDocumentIcon className="w-3 h-3 lg:w-4 lg:h-4" />
                </button>
                <button
                  onClick={handleSpeak}
                  className="p-1.5 lg:p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#094d57]"
                  title="Read aloud"
                >
                  <SpeakerWaveIcon className="w-3 h-3 lg:w-4 lg:h-4" />
                </button>
              </div>
            )}
          </div>
          
          {/* Message Text */}
          <div className="prose prose-sm max-w-none">
            <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">
              {message.content}
            </div>
          </div>

          {/* Copy Success Indicator */}
          {copied && (
            <div className="mt-2 lg:mt-3 flex items-center gap-2 text-sm text-[#f1872c]">
              <div className="w-2 h-2 bg-[#f1872c] rounded-full"></div>
              Copied to clipboard!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 