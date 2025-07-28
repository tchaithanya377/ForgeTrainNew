import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ChatMessage, ChatSession, geminiAPI } from '../lib/gemini';

interface ChatState {
  sessions: ChatSession[];
  currentSessionId: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  createNewSession: () => void;
  setCurrentSession: (sessionId: string) => void;
  addMessage: (content: string, role: 'user' | 'assistant') => void;
  sendMessage: (content: string) => Promise<void>;
  deleteSession: (sessionId: string) => void;
  clearError: () => void;
  updateSessionTitle: (sessionId: string, title: string) => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      sessions: [],
      currentSessionId: null,
      isLoading: false,
      error: null,

      createNewSession: () => {
        const newSession: ChatSession = {
          id: Date.now().toString(),
          title: 'New Chat',
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        set((state) => ({
          sessions: [newSession, ...state.sessions],
          currentSessionId: newSession.id,
          error: null,
        }));
      },

      setCurrentSession: (sessionId: string) => {
        set({ currentSessionId: sessionId, error: null });
      },

      addMessage: (content: string, role: 'user' | 'assistant') => {
        const { currentSessionId, sessions } = get();
        if (!currentSessionId) return;

        const newMessage: ChatMessage = {
          id: Date.now().toString(),
          content,
          role,
          timestamp: new Date(),
        };

        const updatedSessions = sessions.map((session) =>
          session.id === currentSessionId
            ? {
                ...session,
                messages: [...session.messages, newMessage],
                updatedAt: new Date(),
              }
            : session
        );

        set({ sessions: updatedSessions });
      },

      sendMessage: async (content: string) => {
        const { currentSessionId, sessions, addMessage } = get();
        
        if (!currentSessionId) {
          get().createNewSession();
          // Wait for the session to be created
          await new Promise(resolve => setTimeout(resolve, 0));
        }

        set({ isLoading: true, error: null });

        try {
          // Add user message
          addMessage(content, 'user');

          // Get current session messages
          const currentSession = get().sessions.find(
            (s) => s.id === get().currentSessionId
          );

          if (!currentSession) {
            throw new Error('Session not found');
          }

          // Generate AI response
          const response = await geminiAPI.generateResponse(currentSession.messages);

          // Add AI response
          addMessage(response, 'assistant');

          // Generate title for new conversations
          if (currentSession.messages.length === 1) {
            const title = await geminiAPI.generateTitle(content);
            get().updateSessionTitle(currentSession.id, title);
          }

        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'An error occurred' 
          });
        } finally {
          set({ isLoading: false });
        }
      },

      deleteSession: (sessionId: string) => {
        const { sessions, currentSessionId } = get();
        const updatedSessions = sessions.filter((s) => s.id !== sessionId);
        
        set({
          sessions: updatedSessions,
          currentSessionId: currentSessionId === sessionId 
            ? (updatedSessions[0]?.id || null) 
            : currentSessionId,
        });
      },

      clearError: () => {
        set({ error: null });
      },

      updateSessionTitle: (sessionId: string, title: string) => {
        const { sessions } = get();
        const updatedSessions = sessions.map((session) =>
          session.id === sessionId
            ? { ...session, title }
            : session
        );
        set({ sessions: updatedSessions });
      },
    }),
    {
      name: 'chat-storage',
      partialize: (state) => ({
        sessions: state.sessions,
        currentSessionId: state.currentSessionId,
      }),
    }
  )
); 