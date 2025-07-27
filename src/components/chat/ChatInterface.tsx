import React, { useRef, useEffect, useState } from 'react';
import { ChatSidebar } from './ChatSidebar';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { ChatWelcome } from './ChatWelcome';
import { ChatSettings } from './ChatSettings';
import { useChatStore } from '../../stores/chatStore';
import { SparklesIcon, Cog6ToothIcon, WrenchScrewdriverIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { testGeminiAPI, testAvailableModels } from '../../lib/gemini-test';

export const ChatInterface: React.FC = () => {
  const { sessions, currentSessionId, isLoading } = useChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [testingAPI, setTestingAPI] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const currentSession = sessions.find(s => s.id === currentSessionId);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentSession?.messages]);

  return (
    <div className="flex h-full bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-80 bg-white border-r border-gray-200 shadow-lg lg:shadow-none lg:translate-x-0 lg:static lg:inset-0
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <ChatSidebar onClose={() => setSidebarOpen(false)} />
      </div>
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="border-b border-gray-200 p-4 lg:p-6 bg-white/80 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 lg:gap-4">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#094d57]"
              >
                <Bars3Icon className="w-5 h-5" />
              </button>

              <div className="relative">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-[#094d57] via-[#0c5a66] to-[#f1872c] rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg">
                  <SparklesIcon className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 lg:w-4 lg:h-4 bg-[#f1872c] rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h1 className="text-lg lg:text-xl font-bold text-gray-900">
                  {currentSession?.title || 'AI Learning Assistant'}
                </h1>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#f1872c] rounded-full animate-pulse"></div>
                  <p className="text-sm text-gray-500">
                    Ready to help you learn
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={async () => {
                  setTestingAPI(true);
                  console.log('Testing API...');
                  await testGeminiAPI();
                  await testAvailableModels();
                  setTestingAPI(false);
                }}
                disabled={testingAPI}
                className="p-2 lg:p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg lg:rounded-xl transition-all duration-200 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#094d57]"
                title="Test API Connection"
              >
                <WrenchScrewdriverIcon className="w-4 h-4 lg:w-5 lg:h-5" />
              </button>
              <button
                onClick={() => setSettingsOpen(true)}
                className="p-2 lg:p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg lg:rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#094d57]"
                title="Settings"
              >
                <Cog6ToothIcon className="w-4 h-4 lg:w-5 lg:h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto">
          {!currentSession ? (
            <ChatWelcome />
          ) : currentSession.messages.length === 0 ? (
            <div className="h-full flex items-center justify-center p-4 lg:p-6">
              <div className="text-center max-w-md">
                <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-r from-[#094d57]/10 to-[#f1872c]/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <SparklesIcon className="w-8 h-8 lg:w-10 lg:h-10 text-[#094d57]" />
                </div>
                <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-3">
                  Ready to learn?
                </h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Start your conversation below. Ask anything, learn everything, and discover new possibilities with AI.
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <div className="w-2 h-2 bg-[#f1872c] rounded-full animate-pulse"></div>
                  <span>AI Assistant is ready to help</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              {currentSession.messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              
              {/* Loading indicator */}
              {isLoading && (
                <div className="flex gap-3 lg:gap-4 p-4 lg:p-6 bg-gradient-to-r from-gray-50 to-white">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-r from-[#094d57] via-[#0c5a66] to-[#f1872c] rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg">
                      <SparklesIcon className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 lg:gap-3 mb-2 lg:mb-3">
                      <span className="font-semibold text-gray-900">
                        AI Assistant
                      </span>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        Thinking...
                      </span>
                    </div>
                    <div className="flex items-center gap-1 lg:gap-2">
                      <div className="w-2 h-2 lg:w-3 lg:h-3 bg-[#094d57] rounded-full animate-pulse" />
                      <div className="w-2 h-2 lg:w-3 lg:h-3 bg-[#0c5a66] rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                      <div className="w-2 h-2 lg:w-3 lg:h-3 bg-[#f1872c] rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <ChatInput />
      </div>
      
      {/* Settings Modal */}
      <ChatSettings isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}; 