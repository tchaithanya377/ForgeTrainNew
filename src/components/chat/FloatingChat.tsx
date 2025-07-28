import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChatBubbleLeftRightIcon, 
  XMarkIcon, 
  MicrophoneIcon, 
  SpeakerWaveIcon, 
  Cog6ToothIcon, 
  MagnifyingGlassIcon,
  PlusIcon,
  DocumentTextIcon,
  TrashIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { useChatStore } from '../../stores/chatStore';
import { ChatMessage } from './ChatMessage';

// TypeScript declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export function FloatingChat() {
  const { 
    sessions, 
    currentSessionId, 
    sendMessage, 
    createNewSession, 
    setCurrentSession,
    deleteSession,
    isLoading 
  } = useChatStore();
  
  const currentSession = sessions.find(s => s.id === currentSessionId);
  const messages = currentSession?.messages || [];
  
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showSessions, setShowSessions] = useState(false);
  const [chatSize, setChatSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStartY, setResizeStartY] = useState(0);
  const [resizeStartHeight, setResizeStartHeight] = useState(0);

  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatWindowRef = useRef<HTMLDivElement>(null);

  // Chat size configurations
  const chatSizes = {
    small: { width: 'w-80', height: 'h-96' },
    medium: { width: 'w-96', height: 'h-[500px]' },
    large: { width: 'w-[500px]', height: 'h-[600px]' }
  };

  const currentSize = chatSizes[chatSize];

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event: any) => {
          let finalTranscript = '';
          let interimTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }

          setTranscript(finalTranscript + interimTranscript);
        };

        recognitionRef.current.onend = () => {
          if (isListening) {
            recognitionRef.current.start();
          }
        };
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isListening]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    setShowSettings(false);
    setShowSessions(false);
  };

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      sendMessage(inputValue);
      setInputValue('');
      setTranscript('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickAction = (action: string) => {
    sendMessage(action);
  };

  const startListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      if (transcript.trim()) {
        setInputValue(transcript);
        setTranscript('');
      }
    }
  };

  const speakText = (text: string) => {
    if (window.speechSynthesis && voiceEnabled) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onpause = () => setIsPaused(true);
      utterance.onresume = () => setIsPaused(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
    }
  };

  const pauseSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  const resumeSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  };

  const toggleVoice = () => {
    setVoiceEnabled(!voiceEnabled);
    if (!voiceEnabled) {
      stopSpeaking();
    }
  };

  const handleNewChat = () => {
    createNewSession();
    setShowSessions(false);
  };

  const handleSessionSelect = (sessionId: string) => {
    setCurrentSession(sessionId);
    setShowSessions(false);
  };

  const handleDeleteSession = (sessionId: string) => {
    deleteSession(sessionId);
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    setIsResizing(true);
    setResizeStartY(e.clientY);
    setResizeStartHeight(chatWindowRef.current?.offsetHeight || 0);
  };

  const handleResizeMove = (e: MouseEvent) => {
    if (!isResizing) return;
    
    const deltaY = e.clientY - resizeStartY;
    const newHeight = Math.max(300, Math.min(800, resizeStartHeight + deltaY));
    
    if (chatWindowRef.current) {
      chatWindowRef.current.style.height = `${newHeight}px`;
    }
  };

  const handleResizeEnd = () => {
    setIsResizing(false);
  };

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleResizeMove);
      document.addEventListener('mouseup', handleResizeEnd);
      return () => {
        document.removeEventListener('mousemove', handleResizeMove);
        document.removeEventListener('mouseup', handleResizeEnd);
      };
    }
  }, [isResizing, resizeStartY, resizeStartHeight]);

  // Auto-speak AI responses when voice is enabled
  useEffect(() => {
    if (voiceEnabled && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'assistant' && !isSpeaking) {
        speakText(lastMessage.content);
      }
    }
  }, [messages, voiceEnabled]);

  const quickActions = [
    { text: "Help me with coding", icon: "💻" },
    { text: "Explain a concept", icon: "📚" },
    { text: "Debug my code", icon: "🐛" },
    { text: "Practice problems", icon: "🎯" }
  ];

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-[#094d57] to-[#f1872c] text-white rounded-3xl shadow-2xl z-50 flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, #094d57 0%, #f1872c 100%)',
          boxShadow: '0 20px 40px rgba(9, 77, 87, 0.3), 0 10px 20px rgba(241, 135, 44, 0.2)'
        }}
        whileHover={{ 
          scale: 1.1, 
          rotate: 5,
          boxShadow: '0 25px 50px rgba(9, 77, 87, 0.4), 0 15px 30px rgba(241, 135, 44, 0.3)'
        }}
        whileTap={{ scale: 0.95, rotate: -5 }}
        animate={!isOpen ? { 
          scale: [1, 1.05, 1],
          transition: { 
            duration: 2, 
            repeat: Infinity,
            ease: "easeInOut"
          }
        } : {}}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <XMarkIcon className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChatBubbleLeftRightIcon className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Pulse effect when closed */}
      {!isOpen && (
        <motion.div
          className="fixed bottom-6 right-6 w-16 h-16 bg-white rounded-3xl opacity-20 z-40"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.1, 0.2],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}

      {/* Notification badge */}
      {messages.length > 0 && !isOpen && (
        <motion.div
          className="fixed -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-[#f1872c] to-[#e67e22] text-white text-xs font-bold rounded-full flex items-center justify-center z-50 shadow-lg border-2 border-white"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            type: "spring",
            stiffness: 300,
            damping: 20
          }}
        >
          {messages.length}
        </motion.div>
      )}

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={chatWindowRef}
            className={`fixed bottom-24 right-6 ${currentSize.width} ${currentSize.height} bg-white rounded-3xl shadow-2xl border border-gray-100 backdrop-blur-sm z-40 flex flex-col overflow-hidden`}
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
              boxShadow: '0 25px 50px rgba(9, 77, 87, 0.15), 0 10px 20px rgba(241, 135, 44, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
            }}
            initial={{ 
              opacity: 0, 
              y: 50, 
              scale: 0.8,
              rotateX: -15
            }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              rotateX: 0
            }}
            exit={{ 
              opacity: 0, 
              y: 50, 
              scale: 0.8,
              rotateX: 15
            }}
            transition={{ 
              type: "spring",
              stiffness: 300,
              damping: 30
            }}
          >
            {/* Header */}
            <div 
              className="p-4 bg-gradient-to-r from-[#094d57] to-[#f1872c] text-white rounded-t-3xl relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #094d57 0%, #f1872c 100%)'
              }}
            >
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-grid-white/[0.05] bg-grid" />
              </div>
              
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30 flex items-center justify-center">
                      <ChatBubbleLeftRightIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">AI Assistant</h3>
                    <p className="text-xs text-white/80">Ready to help you learn</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {/* Voice Toggle */}
                  <motion.button
                    onClick={toggleVoice}
                    className={`p-2.5 rounded-xl backdrop-blur-sm border border-white/20 transition-all duration-200 ${
                      voiceEnabled ? 'bg-white/30 text-white' : 'bg-white/20 text-white/70'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <SpeakerWaveIcon className="w-4 h-4" />
                  </motion.button>

                  {/* Sessions Button */}
                  <motion.button
                    onClick={() => setShowSessions(!showSessions)}
                    className="p-2.5 rounded-xl bg-white/20 backdrop-blur-sm border border-white/20 text-white transition-all duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <DocumentTextIcon className="w-4 h-4" />
                  </motion.button>

                  {/* Settings Button */}
                  <motion.button
                    onClick={() => setShowSettings(!showSettings)}
                    className="p-2.5 rounded-xl bg-white/20 backdrop-blur-sm border border-white/20 text-white transition-all duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Cog6ToothIcon className="w-4 h-4" />
                  </motion.button>

                  {/* Close Button */}
                  <motion.button
                    onClick={toggleChat}
                    className="p-2.5 rounded-xl bg-white/20 backdrop-blur-sm border border-white/20 text-white transition-all duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Settings Panel */}
            <AnimatePresence>
              {showSettings && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 overflow-hidden"
                >
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Voice Controls</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <motion.button
                        onClick={stopSpeaking}
                        className="p-2 bg-white rounded-lg shadow-sm border border-gray-200 text-gray-600 hover:text-gray-800 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </motion.button>
                      {isPaused ? (
                        <motion.button
                          onClick={resumeSpeaking}
                          className="p-2 bg-white rounded-lg shadow-sm border border-gray-200 text-[#094d57] hover:text-[#0c5a66] transition-colors"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <SpeakerWaveIcon className="w-4 h-4" />
                        </motion.button>
                      ) : (
                        <motion.button
                          onClick={pauseSpeaking}
                          className="p-2 bg-white rounded-lg shadow-sm border border-gray-200 text-[#094d57] hover:text-[#0c5a66] transition-colors"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </motion.button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Sessions Panel */}
            <AnimatePresence>
              {showSessions && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 overflow-hidden"
                >
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Chat Sessions</span>
                      <motion.button
                        onClick={handleNewChat}
                        className="p-2 bg-gradient-to-r from-[#094d57] to-[#f1872c] text-white rounded-lg shadow-sm transition-all duration-200"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <PlusIcon className="w-4 h-4" />
                      </motion.button>
                    </div>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {sessions.map((session) => (
                        <div
                          key={session.id}
                          className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all duration-200 ${
                            currentSession?.id === session.id
                              ? 'bg-gradient-to-r from-[#094d57] to-[#f1872c] text-white'
                              : 'bg-white hover:bg-gray-50'
                          }`}
                          onClick={() => handleSessionSelect(session.id)}
                        >
                          <span className="text-sm truncate flex-1">
                            {session.title || 'New Chat'}
                          </span>
                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSession(session.id);
                            }}
                            className="p-1 text-red-500 hover:text-red-700 transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <TrashIcon className="w-3 h-3" />
                          </motion.button>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-center py-8"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-[#094d57] to-[#f1872c] rounded-3xl shadow-lg flex items-center justify-center mx-auto mb-4">
                    <ChatBubbleLeftRightIcon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Welcome to AI Assistant!</h3>
                  <p className="text-gray-600 mb-6">I'm here to help you with your learning journey.</p>
                  
                  {/* Quick Actions */}
                  <div className="grid grid-cols-2 gap-3">
                    {quickActions.map((action, index) => (
                      <motion.button
                        key={index}
                        onClick={() => handleQuickAction(action.text)}
                        className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 rounded-2xl shadow-sm border border-gray-200 transition-all duration-200 text-left group"
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{action.icon}</span>
                          <span className="text-sm font-medium text-gray-700 group-hover:text-[#094d57] transition-colors">
                            {action.text}
                          </span>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              ) : (
                messages.map((message: any, index: number) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <ChatMessage message={message} />
                  </motion.div>
                ))
              )}
              
              {/* Typing indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl border border-gray-200"
                >
                  <div className="flex space-x-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 bg-[#094d57] rounded-full"
                        animate={{ y: [0, -10, 0] }}
                        transition={{
                          duration: 0.6,
                          repeat: Infinity,
                          delay: i * 0.2,
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">AI is thinking...</span>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Voice Transcript Display */}
            <AnimatePresence>
              {isListening && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <motion.div
                      className="w-2 h-2 bg-red-500 rounded-full"
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                    <span className="text-sm font-medium text-blue-700">Listening...</span>
                  </div>
                  <p className="text-sm text-blue-600">{transcript || 'Start speaking...'}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input Section */}
            <div className="p-4 border-t border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-3">
                <motion.button
                  onClick={isListening ? stopListening : startListening}
                  className={`p-3 rounded-2xl shadow-lg border border-gray-200 transition-all duration-200 ${
                    isListening 
                      ? 'bg-red-500 text-white shadow-red-200' 
                      : 'bg-white text-gray-600 hover:text-[#094d57] shadow-sm'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <MicrophoneIcon className="w-5 h-5" />
                </motion.button>
                
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={isListening ? "Listening..." : "Type your message..."}
                    className="w-full px-4 py-3 pr-12 bg-white rounded-2xl border border-gray-200 focus:ring-2 focus:ring-[#094d57] focus:border-transparent outline-none transition-all duration-200 shadow-sm"
                  />
                  <motion.button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim()}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-[#094d57] hover:text-[#0c5a66] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <MagnifyingGlassIcon className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
              
              {/* Voice Status */}
              <div className="flex items-center justify-between mt-3 text-xs">
                <div className="flex items-center space-x-2">
                  {voiceEnabled && (
                    <motion.span
                      className="text-[#094d57] font-medium"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      Voice enabled
                    </motion.span>
                  )}
                  {isSpeaking && (
                    <motion.div
                      className="flex items-center gap-1 text-[#f1872c]"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <motion.div
                        className="w-2 h-2 bg-[#f1872c] rounded-full"
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      />
                      Speaking...
                    </motion.div>
                  )}
                </div>
              </div>
            </div>

            {/* Resize Handle */}
            <div
              className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-[#094d57] to-[#f1872c] cursor-ns-resize opacity-0 hover:opacity-100 transition-opacity duration-200"
              onMouseDown={handleResizeStart}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
} 