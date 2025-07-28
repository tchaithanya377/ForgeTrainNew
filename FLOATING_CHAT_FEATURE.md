# Floating AI Chat Feature

## Overview
A modern, feature-rich floating AI chatbot that provides an intuitive and engaging user experience for learning assistance. The chat interface is positioned in the bottom-right corner with a beautiful, animated design that enhances user interaction and integrates seamlessly with the ForgeTrain website's design system.

## Features

### 🎨 **Website Color Integration**
- **ForgeTrain Brand Colors**: Uses the official website color scheme:
  - Primary: `#094d57` (Deep Teal)
  - Secondary: `#f1872c` (Orange)
  - Gradients: `from-[#094d57] via-[#0c5a66] to-[#f1872c]`
- **Consistent Design Language**: All UI elements follow the website's design patterns
- **Branded Animations**: Color-coordinated animations and transitions
- **Visual Harmony**: Seamless integration with the overall website aesthetic

### 📏 **Chat Resize Functionality**
- **Dynamic Resizing**: Drag the bottom handle to resize the chat window
- **Size Constraints**: Minimum 300px, maximum 800px height
- **Smooth Resizing**: Real-time resize with mouse drag
- **Size Presets**: Three predefined sizes (small, medium, large)
- **Responsive Design**: Adapts to different screen sizes

### 💬 **New Chat Options**
- **Session Management**: Create, switch, and delete chat sessions
- **New Chat Button**: Quick creation of new conversation threads
- **Session List**: Dropdown panel showing all active sessions
- **Session Titles**: Auto-generated titles for better organization
- **Delete Sessions**: Remove unwanted conversations
- **Session Persistence**: All sessions saved locally

### 🎭 **Advanced Animations**
- **Spring Physics**: Natural-feeling animations using Framer Motion
- **3D Transforms**: Subtle rotateX effects for depth perception
- **Micro-interactions**: Hover effects, scale animations, and smooth transitions
- **Loading States**: Animated typing indicators with bouncing dots
- **Icon Transitions**: Smooth icon rotations and state changes
- **Notification Badge**: Animated message count indicator

### 🎵 **Voice Features**
- **Speech Recognition**: Real-time voice input with visual feedback
- **Text-to-Speech**: AI responses automatically spoken when enabled
- **Voice Controls**: Play, pause, stop, and resume functionality
- **Status Indicators**: Clear visual feedback for voice states
- **Transcript Display**: Live display of voice input
- **Auto-Speak**: AI responses automatically spoken when voice is enabled

### ⚙️ **Settings Panel**
- **Collapsible Settings**: Expandable settings panel for voice controls
- **Voice Management**: Stop, pause, and resume speaking
- **Quick Access**: Easy toggle for voice features
- **Visual Feedback**: Clear status indicators for all voice states

### 🎯 **Enhanced User Experience**
- **Larger Interface**: Increased size for better readability
- **Better Spacing**: Improved padding, margins, and component spacing
- **Visual Hierarchy**: Clear distinction between different UI elements
- **Accessibility**: Better contrast ratios and focus states
- **Responsive Design**: Optimized for various screen sizes

## Technical Implementation

### State Management
```typescript
// Chat session management
const { 
  sessions, 
  currentSessionId, 
  sendMessage, 
  createNewSession, 
  setCurrentSession,
  deleteSession,
  isLoading 
} = useChatStore();

// Local state for UI
const [isOpen, setIsOpen] = useState(false);
const [showSessions, setShowSessions] = useState(false);
const [chatSize, setChatSize] = useState<'small' | 'medium' | 'large'>('medium');
const [isResizing, setIsResizing] = useState(false);
```

### Resize Functionality
```typescript
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
```

### Session Management
```typescript
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
```

### Website Color Integration
```typescript
// Primary gradient using website colors
style={{
  background: 'linear-gradient(135deg, #094d57 0%, #f1872c 100%)',
  boxShadow: '0 20px 40px rgba(9, 77, 87, 0.3), 0 10px 20px rgba(241, 135, 44, 0.2)'
}}

// Button styling with brand colors
className="bg-gradient-to-r from-[#094d57] to-[#f1872c] text-white"
```

## Usage

### Basic Interaction
1. **Open Chat**: Click the floating button in the bottom-right corner
2. **Send Message**: Type and press Enter or click the send button
3. **Voice Input**: Click the microphone button for voice input
4. **Quick Actions**: Use the suggested action buttons for common queries

### Chat Resizing
1. **Resize Handle**: Hover over the bottom edge of the chat window
2. **Drag to Resize**: Click and drag up/down to adjust height
3. **Size Constraints**: Minimum 300px, maximum 800px height
4. **Smooth Experience**: Real-time resize with visual feedback

### Session Management
1. **New Chat**: Click the document icon to open sessions panel
2. **Create Session**: Click the plus button to start a new conversation
3. **Switch Sessions**: Click on any session in the list to switch
4. **Delete Sessions**: Click the trash icon next to unwanted sessions

### Voice Features
1. **Enable Voice**: Toggle voice features in the header
2. **Voice Input**: Click microphone to start voice recognition
3. **Auto-Speak**: AI responses automatically spoken when enabled
4. **Voice Controls**: Use settings panel for advanced voice controls

### Settings
1. **Access Settings**: Click the gear icon in the header
2. **Voice Controls**: Manage speaking, pausing, and stopping
3. **Close Settings**: Click the gear icon again to close

## Customization

### Colors and Themes
```typescript
// Website brand colors
primary: '#094d57'    // Deep Teal
secondary: '#f1872c'  // Orange
gradient: 'linear-gradient(135deg, #094d57 0%, #f1872c 100%)'

// Quick action button gradients
from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200
```

### Animation Timing
```typescript
// Spring animation configuration
transition={{ 
  type: "spring",
  stiffness: 300,
  damping: 30
}}
```

### Sizing and Layout
```typescript
// Chat size configurations
const chatSizes = {
  small: { width: 'w-80', height: 'h-96' },
  medium: { width: 'w-96', height: 'h-[500px]' },
  large: { width: 'w-[500px]', height: 'h-[600px]' }
};

// Resize constraints
const newHeight = Math.max(300, Math.min(800, resizeStartHeight + deltaY));
```

## Future Enhancements

### Planned Features
- **Chat Export**: Export conversations as PDF or text
- **Voice Customization**: Adjust speech rate and voice selection
- **Theme Switching**: Dark/light mode support
- **Keyboard Shortcuts**: Quick access via keyboard
- **File Upload**: Support for image and document uploads
- **Multi-language**: Support for different languages
- **Chat History**: Persistent chat history across sessions
- **Advanced Analytics**: Usage statistics and insights

### Performance Optimizations
- **Lazy Loading**: Load messages on demand
- **Virtual Scrolling**: Handle large message lists efficiently
- **Memory Management**: Optimize for long conversations
- **Caching**: Cache frequently used responses

## Browser Compatibility

### Supported Features
- **Modern Browsers**: Chrome, Firefox, Safari, Edge
- **Web Speech API**: Speech recognition and synthesis
- **CSS Grid/Flexbox**: Modern layout techniques
- **ES6+ Features**: Modern JavaScript capabilities

### Fallbacks
- **Voice Features**: Graceful degradation for unsupported browsers
- **Animations**: Reduced motion for accessibility
- **Error Handling**: Graceful fallbacks for unsupported features

## Accessibility

### Features
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader**: ARIA labels and descriptions
- **Focus Management**: Proper focus indicators
- **Color Contrast**: WCAG compliant color ratios
- **Reduced Motion**: Respects user motion preferences

### Best Practices
- **Semantic HTML**: Proper HTML structure
- **ARIA Labels**: Descriptive labels for screen readers
- **Focus Indicators**: Clear focus states
- **Error Messages**: Accessible error notifications

## Integration Notes

### Global Component
The `FloatingChat` component is integrated globally in `App.tsx` to ensure availability across all protected routes.

### State Management
Uses Zustand store (`useChatStore`) for session and message management, ensuring consistency with the main chat interface.

### Styling
Follows the website's design system using Tailwind CSS with custom gradients and animations that match the ForgeTrain brand.

### Performance
Optimized with React.memo, useCallback, and efficient re-rendering to maintain smooth performance during interactions. 