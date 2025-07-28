# ForgeTrain - Modern Coding Practice Platform

A comprehensive coding education platform that combines interactive tutorials, coding challenges, quizzes, and AI-powered learning features. Built with modern web technologies and designed for students, colleges, and coding enthusiasts.

## 🚀 Features

### Core Learning Features
- **Interactive Tutorials**: Text and video-based learning with hands-on coding examples
- **Coding Challenges**: LeetCode-style problems with real-time code execution
- **Quizzes & Assessments**: Interactive quizzes with instant feedback
- **Progress Tracking**: Detailed analytics and progress monitoring
- **AI-Powered Learning**: Personalized hints and recommendations

### Student Features
- **Personal Dashboard**: Track progress, streaks, and achievements
- **Course Catalog**: Browse and enroll in structured learning paths
- **Challenge Arena**: Practice coding problems with varying difficulty levels
- **Achievement System**: Earn badges and certificates
- **Study Goals**: Set and track daily/weekly learning goals

### College Integration
- **Student Management**: Track student progress across the institution
- **Placement Preparation**: Specialized tracks for job interview preparation
- **Analytics Dashboard**: Institutional-level analytics and reporting
- **Role-Based Access**: Different access levels for students, coordinators, and administrators

### Modern UI/UX
- **2025 Design Trends**: Modern, clean interface with smooth animations
- **Responsive Design**: Optimized for mobile, tablet, and desktop
- **Dark/Light Theme**: User preference-based theming
- **Multi-language Support**: Including Indian languages
- **Accessibility**: WCAG-compliant design

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling with custom design system
- **Framer Motion** for animations and micro-interactions
- **React Router DOM** for routing
- **Zustand** for state management
- **TanStack Query** for data fetching and caching
- **React Hook Form** with Zod validation
- **Headless UI** for accessible components

### Backend & Services
- **Supabase** for authentication, database, and real-time features
- **Judge0 API** for code execution and testing (AWS EC2 instance)
- **OpenAI API** for AI-powered features
- **Supabase Edge Functions** for serverless API endpoints

### Database Schema
Comprehensive schema including:
- User management (students, instructors, administrators)
- Course content (modules, tutorials, challenges, quizzes)
- Progress tracking and analytics
- Achievement and certification system
- College-level management features

## 🎨 Design System

### Colors
- **Primary**: `#094d57` (Deep Teal)
- **Secondary**: `#f1872c` (Orange)
- **Success**: `#059669` (Green)
- **Warning**: `#d97706` (Amber)
- **Error**: `#dc2626` (Red)
- **Info**: `#2563eb` (Blue)

### Typography
- **Headings**: Inter font family with font weights 600-700
- **Body**: Inter font family with font weight 400
- **Line Height**: 150% for body text, 120% for headings

### Components
- Consistent 8px spacing system
- Rounded corners (8px-12px radius)
- Subtle shadows and hover effects
- Smooth transitions and animations

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- Judge0 API access (AWS EC2 instance)
- OpenAI API key (optional, for AI features)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd forgetrain-portal
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Configure your environment variables in `.env`:
```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_JUDGE0_URL=http://3.85.134.155:2358
VITE_JUDGE0_API_KEY=your-judge0-auth-token
VITE_OPENAI_API_KEY=your-openai-api-key
```

5. Start the development server:
```bash
npm run dev
```

### Database Setup

1. Create a new Supabase project
2. Run the provided SQL migrations to set up the database schema
3. Configure Row Level Security (RLS) policies
4. Set up authentication settings

## 📱 Features Overview

### For Students
- **Learning Paths**: Structured courses from beginner to advanced
- **Interactive Coding**: In-browser code editor with real-time execution
- **Progress Tracking**: Visual progress indicators and analytics
- **Gamification**: Points, badges, streaks, and leaderboards
- **AI Assistance**: Smart hints and personalized recommendations

### For Educators
- **Content Management**: Create and manage courses, tutorials, and assessments
- **Student Analytics**: Track individual and class progress
- **Assessment Tools**: Create quizzes and coding challenges
- **Performance Reports**: Generate detailed progress reports

### For Institutions
- **Student Management**: Bulk user management and enrollment
- **Placement Tracking**: Monitor student preparation for job placements
- **Institutional Analytics**: Department and college-level insights
- **Custom Branding**: Institutional branding and customization

## 🔐 Security Features

- **Supabase Authentication**: Secure email/password authentication
- **Row Level Security**: Database-level security policies
- **Input Validation**: Comprehensive input validation with Zod
- **XSS Protection**: Content sanitization and secure rendering
- **CSRF Protection**: Built-in CSRF protection mechanisms

## 📊 Analytics & Tracking

- **Learning Analytics**: Track time spent, progress, and performance
- **Engagement Metrics**: Monitor user interaction and retention
- **Performance Insights**: Identify learning patterns and difficulties
- **Institutional Reports**: Generate comprehensive progress reports

## 🌐 Internationalization

- **Multi-language Support**: English and major Indian languages
- **RTL Support**: Right-to-left language support
- **Localized Content**: Region-specific examples and use cases
- **Cultural Adaptation**: Indian educational context and examples

## 🚀 Deployment

### Netlify Deployment
1. Build the project: `npm run build`
2. Deploy the `dist` folder to Netlify
3. Configure environment variables in Netlify dashboard
4. Set up redirects for SPA routing

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Configure environment variables
3. Deploy with automatic CI/CD

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- 📧 Email: support@forgetrain.com
- 📚 Documentation: [docs.forgetrain.com](https://docs.forgetrain.com)
- 💬 Discord: [Join our community](https://discord.gg/forgetrain)

## 🎯 Roadmap

### Phase 1 (Current)
- ✅ Basic user authentication and profiles
- ✅ Course catalog and enrollment
- ✅ Text tutorials and video content
- ✅ Progress tracking system

### Phase 2 (Next)
- 🔄 Coding challenges with Judge0 integration
- 🔄 Interactive quiz system
- 🔄 AI-powered learning recommendations
- 🔄 Real-time collaboration features

### Phase 3 (Future)
- 📋 Mobile app development
- 📋 Advanced analytics dashboard
- 📋 Peer-to-peer learning features
- 📋 Corporate training modules

---

Built with ❤️ for the coding community in India 🇮🇳