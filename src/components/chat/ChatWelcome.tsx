import React from 'react';
import { SparklesIcon, LightBulbIcon, RocketLaunchIcon, AcademicCapIcon, CodeBracketIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { useChatStore } from '../../stores/chatStore';

const suggestedPrompts = [
  {
    title: '🚀 Quick Start',
    description: 'Get instant help with any topic',
    prompt: 'I want to learn something new today. Can you suggest an interesting topic and explain it in simple terms?',
    icon: RocketLaunchIcon,
    color: 'from-[#094d57] to-[#0c5a66]'
  },
  {
    title: '💡 Problem Solver',
    description: 'Get step-by-step solutions',
    prompt: 'I have a problem I need help solving. Can you guide me through it step by step?',
    icon: LightBulbIcon,
    color: 'from-[#f1872c] to-[#e07820]'
  },
  {
    title: '📚 Learning Assistant',
    description: 'Learn new concepts easily',
    prompt: 'Explain a complex topic in simple terms that anyone can understand',
    icon: AcademicCapIcon,
    color: 'from-[#094d57] to-[#f1872c]'
  },
  {
    title: '💻 Code Helper',
    description: 'Programming assistance',
    prompt: 'Help me write better code and explain programming concepts',
    icon: CodeBracketIcon,
    color: 'from-[#0c5a66] to-[#094d57]'
  },
  {
    title: '🎯 Creative Partner',
    description: 'Brainstorm and create',
    prompt: 'I need creative ideas and suggestions for a project I\'m working on',
    icon: ChatBubbleLeftRightIcon,
    color: 'from-[#f1872c] to-[#ff6b35]'
  },
  {
    title: '🔍 Research Assistant',
    description: 'Deep dive into topics',
    prompt: 'Help me research and understand a topic thoroughly',
    icon: SparklesIcon,
    color: 'from-[#094d57] via-[#0c5a66] to-[#f1872c]'
  }
];

export const ChatWelcome: React.FC = () => {
  const { sendMessage } = useChatStore();

  const handlePromptClick = (prompt: string) => {
    sendMessage(prompt);
  };

  return (
    <div className="h-full flex items-center justify-center p-4 lg:p-6 bg-gradient-to-br from-gray-50 to-white">
      <div className="text-center max-w-4xl w-full">
        {/* Hero Section */}
        <div className="mb-8 lg:mb-12">
          <div className="relative inline-block mb-4 lg:mb-6">
            <div className="w-16 h-16 lg:w-24 lg:h-24 bg-gradient-to-r from-[#094d57] via-[#0c5a66] to-[#f1872c] rounded-2xl lg:rounded-3xl flex items-center justify-center shadow-2xl animate-pulse">
              <SparklesIcon className="w-8 h-8 lg:w-12 lg:h-12 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 lg:-top-2 lg:-right-2 w-6 h-6 lg:w-8 lg:h-8 bg-[#f1872c] rounded-full flex items-center justify-center">
              <div className="w-2 h-2 lg:w-3 lg:h-3 bg-white rounded-full animate-ping"></div>
            </div>
          </div>
          
          <h1 className="text-2xl lg:text-4xl font-bold bg-gradient-to-r from-[#094d57] via-[#0c5a66] to-[#f1872c] bg-clip-text text-transparent mb-3 lg:mb-4">
            Your AI Learning Partner
          </h1>
          <p className="text-base lg:text-xl text-gray-600 mb-6 lg:mb-8 max-w-2xl mx-auto leading-relaxed">
            Experience the future of learning with AI-powered conversations. 
            Ask anything, learn everything, and discover new possibilities.
          </p>
        </div>

        {/* Quick Start Grid */}
        <div className="mb-8 lg:mb-12">
          <h2 className="text-xl lg:text-2xl font-semibold text-gray-900 mb-6 lg:mb-8">Quick Start</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {suggestedPrompts.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handlePromptClick(suggestion.prompt)}
                className="group relative p-4 lg:p-6 bg-white rounded-xl lg:rounded-2xl border border-gray-200 hover:border-gray-300 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-left"
              >
                <div className="flex items-start gap-3 lg:gap-4">
                  <div className={`w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-r ${suggestion.color} rounded-lg lg:rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
                    <suggestion.icon className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-[#094d57] transition-colors duration-200">
                      {suggestion.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                      {suggestion.description}
                    </p>
                    <div className="text-xs text-[#f1872c] font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      Click to start →
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-white/50 backdrop-blur-sm rounded-2xl lg:rounded-3xl p-6 lg:p-8 border border-gray-100">
          <h2 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4 lg:mb-6">Why Choose AI Assistant?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 text-sm">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 lg:w-8 lg:h-8 bg-[#094d57]/10 rounded-lg flex items-center justify-center">
                <SparklesIcon className="w-3 h-3 lg:w-4 lg:h-4 text-[#094d57]" />
              </div>
              <span className="text-gray-700">Instant responses</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 lg:w-8 lg:h-8 bg-[#f1872c]/10 rounded-lg flex items-center justify-center">
                <AcademicCapIcon className="w-3 h-3 lg:w-4 lg:h-4 text-[#f1872c]" />
              </div>
              <span className="text-gray-700">Personalized learning</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 lg:w-8 lg:h-8 bg-[#094d57]/10 rounded-lg flex items-center justify-center">
                <LightBulbIcon className="w-3 h-3 lg:w-4 lg:h-4 text-[#094d57]" />
              </div>
              <span className="text-gray-700">Smart suggestions</span>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-6 lg:mt-8 text-center">
          <p className="text-gray-500 text-sm mb-4">
            Or simply type your question below to get started
          </p>
          <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
            <div className="w-2 h-2 bg-[#f1872c] rounded-full animate-pulse"></div>
            AI Assistant is ready to help
          </div>
        </div>
      </div>
    </div>
  );
}; 