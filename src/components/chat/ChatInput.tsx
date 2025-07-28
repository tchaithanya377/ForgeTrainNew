import React, { useState, useRef, useEffect } from 'react';
import { PaperAirplaneIcon, MicrophoneIcon, StopIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { useChatStore } from '../../stores/chatStore';

const quickPrompts = [
  "Explain this in simple terms",
  "Give me examples",
  "Help me understand",
  "What are the key points?",
  "Can you elaborate?",
  "Show me how to do this"
];

export const ChatInput: React.FC = () => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showQuickPrompts, setShowQuickPrompts] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { sendMessage, isLoading, error } = useChatStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    const trimmedMessage = message.trim();
    setMessage('');
    setShowQuickPrompts(false);
    await sendMessage(trimmedMessage);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    setMessage(prev => prev + (prev ? ' ' : '') + prompt);
    setShowQuickPrompts(false);
    textareaRef.current?.focus();
  };

  const startVoiceRecording = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => {
        setIsRecording(true);
      };
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setMessage(prev => prev + (prev ? ' ' : '') + transcript);
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };
      
      recognition.onend = () => {
        setIsRecording(false);
      };
      
      recognition.start();
    } else {
      alert('Speech recognition is not supported in this browser.');
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  return (
    <div className="border-t border-gray-200 bg-white/80 backdrop-blur-sm">
      {error && (
        <div className="mx-4 mt-4 p-3 lg:p-4 bg-red-50 border border-red-200 rounded-xl lg:rounded-2xl">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="p-4">
        {/* Quick Prompts */}
        {showQuickPrompts && (
          <div className="mb-4 flex flex-wrap gap-2">
            {quickPrompts.map((prompt, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleQuickPrompt(prompt)}
                className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#094d57]"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-2 lg:gap-3 items-end">
          {/* Input Area */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setShowQuickPrompts(true)}
              onBlur={() => setTimeout(() => setShowQuickPrompts(false), 200)}
              placeholder="Ask me anything... (Shift+Enter for new line)"
              className="w-full px-3 lg:px-4 py-2 lg:py-3 pr-10 lg:pr-12 border border-gray-300 rounded-xl lg:rounded-2xl resize-none focus:ring-2 focus:ring-[#094d57] focus:border-transparent outline-none transition-all duration-200 bg-white/50 backdrop-blur-sm"
              rows={1}
              disabled={isLoading}
            />
            
            {/* Character Count */}
            {message.length > 0 && (
              <div className="absolute bottom-2 right-3 text-xs text-gray-400">
                {message.length}
              </div>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2">
            {/* Voice Input Button */}
            <button
              type="button"
              onClick={startVoiceRecording}
              disabled={isLoading || isRecording}
              className={`p-2 lg:p-3 rounded-xl lg:rounded-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#094d57] ${
                isRecording 
                  ? 'bg-red-500 text-white animate-pulse' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800'
              }`}
              title={isRecording ? 'Recording...' : 'Voice input'}
            >
              {isRecording ? (
                <StopIcon className="w-4 h-4 lg:w-5 lg:h-5" />
              ) : (
                <MicrophoneIcon className="w-4 h-4 lg:w-5 lg:h-5" />
              )}
            </button>

            {/* Send Button */}
            <button
              type="submit"
              disabled={!message.trim() || isLoading}
              className="p-2 lg:p-3 bg-gradient-to-r from-[#094d57] to-[#f1872c] text-white rounded-xl lg:rounded-2xl hover:from-[#073e47] hover:to-[#e07820] disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none focus:outline-none focus:ring-2 focus:ring-[#094d57]"
            >
              {isLoading ? (
                <div className="w-4 h-4 lg:w-5 lg:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <PaperAirplaneIcon className="w-4 h-4 lg:w-5 lg:h-5" />
              )}
            </button>
          </div>
        </div>
        
        {/* Help Text */}
        <div className="mt-3 flex flex-col lg:flex-row lg:items-center lg:justify-between text-xs text-gray-500 gap-2">
          <div className="flex items-center gap-2 lg:gap-4">
            <span>Press Enter to send</span>
            <span className="hidden lg:inline">•</span>
            <span>Shift+Enter for new line</span>
            <span className="hidden lg:inline">•</span>
            <span>Click microphone for voice</span>
          </div>
          <div className="flex items-center gap-2">
            <SparklesIcon className="w-3 h-3" />
            <span>AI Assistant ready</span>
          </div>
        </div>
      </form>
    </div>
  );
}; 