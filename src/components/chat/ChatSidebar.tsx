import React from 'react';
import { PlusIcon, TrashIcon, ChatBubbleLeftIcon, SparklesIcon, ClockIcon, FireIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { useChatStore } from '../../stores/chatStore';

interface ChatSidebarProps {
  onClose?: () => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({ onClose }) => {
  const { 
    sessions, 
    currentSessionId, 
    createNewSession, 
    setCurrentSession, 
    deleteSession 
  } = useChatStore();

  const handleNewChat = () => {
    createNewSession();
    onClose?.();
  };

  const handleSessionClick = (sessionId: string) => {
    setCurrentSession(sessionId);
    onClose?.();
  };

  const handleDeleteSession = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    deleteSession(sessionId);
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return format(date, 'MMM d');
  };

  return (
    <div className="w-full bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 lg:p-6 border-b border-gray-200 bg-white/50 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[#094d57]">Chat History</h2>
          <button
            onClick={onClose}
            className="lg:hidden p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#094d57]"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        <button
          onClick={handleNewChat}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-gradient-to-r from-[#094d57] to-[#f1872c] text-white rounded-xl hover:from-[#073e47] hover:to-[#e07820] transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <PlusIcon className="w-5 h-5" />
          <span className="font-semibold">New Chat</span>
        </button>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto p-4">
        {sessions.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-r from-[#094d57]/10 to-[#f1872c]/10 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <ChatBubbleLeftIcon className="w-8 h-8 text-[#094d57]" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No conversations yet</h3>
            <p className="text-gray-500 text-sm">Start your first chat to begin learning</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sessions.map((session) => {
              const isActive = currentSessionId === session.id;
              const isRecent = new Date().getTime() - session.updatedAt.getTime() < 24 * 60 * 60 * 1000; // Last 24 hours
              
              return (
                <div
                  key={session.id}
                  onClick={() => handleSessionClick(session.id)}
                  className={`group relative p-3 lg:p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-[#094d57]/10 to-[#f1872c]/10 border-2 border-[#094d57]/20 shadow-lg'
                      : 'hover:bg-gray-50 border-2 border-transparent hover:border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className={`font-semibold truncate ${
                          isActive ? 'text-[#094d57]' : 'text-gray-900'
                        }`}>
                          {session.title}
                        </h3>
                        {isRecent && (
                          <FireIcon className="w-4 h-4 text-[#f1872c]" />
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 mb-2">
                        <ClockIcon className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          {getTimeAgo(session.updatedAt)}
                        </span>
                      </div>
                      
                      {session.messages.length > 0 && (
                        <p className="text-xs text-gray-600 truncate leading-relaxed">
                          {session.messages[session.messages.length - 1].content}
                        </p>
                      )}
                    </div>
                    
                    <button
                      onClick={(e) => handleDeleteSession(e, session.id)}
                      className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                      title="Delete conversation"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute top-2 right-2 w-2 h-2 bg-[#f1872c] rounded-full"></div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-white/50 backdrop-blur-sm">
        <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
          <SparklesIcon className="w-3 h-3" />
          <span>Powered by Gemini AI</span>
        </div>
      </div>
    </div>
  );
}; 