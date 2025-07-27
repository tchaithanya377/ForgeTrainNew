# AI Chatbot Feature Documentation

## Overview

The AI Chatbot feature provides a ChatGPT-like interface powered by Google's Gemini AI API. Users can have natural conversations with the AI assistant, ask questions, get explanations, and receive help with various topics.

## Features

### 🚀 Core Features
- **Real-time Chat Interface**: Modern, responsive chat UI similar to ChatGPT
- **Multiple Chat Sessions**: Create and manage multiple conversation threads
- **Persistent Storage**: Chat history is saved locally and persists between sessions
- **Auto-generated Titles**: AI automatically generates descriptive titles for conversations
- **Loading States**: Visual feedback during AI response generation
- **Error Handling**: Graceful error handling with user-friendly messages

### 🎨 User Experience
- **Welcome Screen**: Interactive welcome page with suggested prompts
- **Suggested Prompts**: Quick-start buttons for common use cases
- **Auto-scroll**: Messages automatically scroll to the latest message
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Modern UI**: Clean, professional interface with smooth animations

### ⚙️ Customization
- **AI Personalities**: Choose from different AI personalities (Default, Teacher, Programmer, Creative)
- **Response Styles**: Configure response detail level (Detailed, Concise, Conversational)
- **Language Support**: Multiple language options for responses
- **Settings Modal**: Easy access to customization options

## Architecture

### File Structure
```
src/
├── components/chat/
│   ├── ChatInterface.tsx      # Main chat interface component
│   ├── ChatSidebar.tsx        # Session management sidebar
│   ├── ChatMessage.tsx        # Individual message component
│   ├── ChatInput.tsx          # Message input component
│   ├── ChatWelcome.tsx        # Welcome screen with suggestions
│   └── ChatSettings.tsx       # Settings modal
├── lib/
│   └── gemini.ts              # Gemini API integration
├── stores/
│   └── chatStore.ts           # Zustand state management
└── pages/
    └── ChatPage.tsx           # Chat page component
```

### Key Components

#### ChatInterface.tsx
The main container component that orchestrates the entire chat experience:
- Manages layout (sidebar + main chat area)
- Handles session switching
- Displays welcome screen or messages
- Shows loading states
- Integrates settings modal

#### ChatSidebar.tsx
Manages chat sessions:
- Lists all chat sessions
- Allows creating new sessions
- Enables session switching
- Provides session deletion
- Shows session previews

#### ChatMessage.tsx
Renders individual messages:
- Different styling for user vs AI messages
- Timestamp display
- Avatar icons
- Message content formatting

#### ChatInput.tsx
Handles message input:
- Auto-resizing textarea
- Enter/Shift+Enter handling
- Loading state integration
- Error display
- Form validation

#### ChatWelcome.tsx
Welcome screen with suggested prompts:
- Interactive prompt buttons
- Feature overview
- Quick-start suggestions
- Professional onboarding

#### ChatSettings.tsx
Settings modal for customization:
- AI personality selection
- Response style configuration
- Language options
- Modal interface

### State Management

#### chatStore.ts (Zustand)
Manages all chat-related state:
```typescript
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
```

### API Integration

#### gemini.ts
Handles communication with Google's Gemini AI API:
- Message formatting for Gemini API
- Response parsing
- Error handling
- Title generation
- Safety settings configuration

## Usage

### Getting Started
1. Navigate to `/chat` in the application
2. Click "New Chat" or use a suggested prompt
3. Start typing your message
4. Press Enter to send or Shift+Enter for new line

### Managing Sessions
- **Create New Chat**: Click "New Chat" button in sidebar
- **Switch Sessions**: Click on any session in the sidebar
- **Delete Session**: Hover over session and click trash icon
- **Auto-titles**: Sessions get automatic titles based on first message

### Customization
1. Click the settings icon (gear) in the chat header
2. Choose AI personality (Default, Teacher, Programmer, Creative)
3. Select response style (Detailed, Concise, Conversational)
4. Choose preferred language
5. Click "Save Settings"

## Technical Details

### Dependencies
- **React 18**: UI framework
- **TypeScript**: Type safety
- **Zustand**: State management
- **Tailwind CSS**: Styling
- **Heroicons**: Icons
- **date-fns**: Date formatting
- **Framer Motion**: Animations

### API Configuration
- **Gemini API Key**: Configured in `src/lib/gemini.ts`
- **Model**: gemini-pro
- **Safety Settings**: Configured for appropriate content filtering
- **Generation Config**: Optimized for chat responses

### Performance Features
- **Lazy Loading**: Components load on demand
- **Persistent Storage**: Local storage for chat history
- **Optimistic Updates**: Immediate UI feedback
- **Error Boundaries**: Graceful error handling

## Security & Privacy

### Data Handling
- Chat messages stored locally in browser
- No server-side message storage
- API calls made directly to Gemini
- No message logging or analytics

### API Security
- API key stored in client-side code (consider environment variables for production)
- Safety filters enabled for content moderation
- Rate limiting handled by Gemini API

## Future Enhancements

### Planned Features
- [ ] Message search functionality
- [ ] Export chat history
- [ ] Voice input/output
- [ ] File upload support
- [ ] Code syntax highlighting
- [ ] Markdown rendering
- [ ] Chat templates
- [ ] User preferences sync

### Technical Improvements
- [ ] Environment variable configuration
- [ ] API key management
- [ ] Offline support
- [ ] Message encryption
- [ ] Performance optimizations
- [ ] Accessibility improvements

## Troubleshooting

### Common Issues
1. **API Errors**: Check API key configuration
2. **Loading Issues**: Verify network connectivity
3. **Storage Issues**: Clear browser storage if needed
4. **UI Problems**: Check browser compatibility

### Debug Mode
Enable debug logging by setting `localStorage.debug = 'chat:*'` in browser console.

## Contributing

When contributing to the chatbot feature:
1. Follow existing code patterns
2. Add TypeScript types for new features
3. Include error handling
4. Test on multiple devices
5. Update documentation

## License

This feature is part of the ForgeTrain application and follows the same licensing terms. 