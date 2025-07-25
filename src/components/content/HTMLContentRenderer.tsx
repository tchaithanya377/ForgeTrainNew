import React from 'react'
import { motion } from 'framer-motion'
import { 
  BookOpenIcon, 
  LightBulbIcon, 
  CodeBracketIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'

interface HTMLContentRendererProps {
  content: string
  className?: string
}

export function HTMLContentRenderer({ content, className = '' }: HTMLContentRendererProps) {
  // Clean and sanitize the HTML content
  const cleanContent = React.useMemo(() => {
    if (!content) return ''
    
    // Enhanced HTML sanitization for React Quill content
    let cleanedContent = content
      // Remove script tags and dangerous attributes
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+="[^"]*"/g, '')
      .replace(/javascript:/gi, '')
      // Clean up React Quill specific formatting
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
    
    return cleanedContent
  }, [content])

  // Custom styles for React Quill content
  const contentStyles = `
    .ql-editor h1, .quill-content h1 {
      font-size: 2.5rem;
      font-weight: 800;
      color: #1f2937;
      margin: 2rem 0 1.5rem 0;
      line-height: 1.2;
      border-bottom: 3px solid #094d57;
      padding-bottom: 0.5rem;
    }
    
    .ql-editor h2, .quill-content h2 {
      font-size: 2rem;
      font-weight: 700;
      color: #1f2937;
      margin: 1.5rem 0 1rem 0;
      line-height: 1.3;
      border-left: 4px solid #f1872c;
      padding-left: 1rem;
      background: linear-gradient(135deg, #f1872c10, transparent);
      padding: 0.75rem 0 0.75rem 1rem;
      border-radius: 0 0.5rem 0.5rem 0;
    }
    
    .ql-editor h3, .quill-content h3 {
      font-size: 1.5rem;
      font-weight: 600;
      color: #374151;
      margin: 1.25rem 0 0.75rem 0;
      line-height: 1.4;
      position: relative;
      padding-left: 1.5rem;
    }
    
    .ql-editor h3::before, .quill-content h3::before {
      content: '▶';
      position: absolute;
      left: 0;
      color: #094d57;
      font-size: 0.875rem;
    }
    
    .ql-editor h4, .quill-content h4 {
      font-size: 1.25rem;
      font-weight: 600;
      color: #4b5563;
      margin: 1rem 0 0.5rem 0;
      line-height: 1.4;
      background: linear-gradient(135deg, #094d5710, transparent);
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      border-left: 3px solid #094d57;
    }
    
    .ql-editor h5, .quill-content h5 {
      font-size: 1.125rem;
      font-weight: 600;
      color: #6b7280;
      margin: 0.75rem 0 0.5rem 0;
      line-height: 1.4;
    }
    
    .ql-editor h6, .quill-content h6 {
      font-size: 1rem;
      font-weight: 600;
      color: #9ca3af;
      margin: 0.5rem 0 0.25rem 0;
      line-height: 1.4;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    
    .ql-editor p, .quill-content p {
      font-size: 1.125rem;
      line-height: 1.75;
      color: #374151;
      margin: 1rem 0;
      text-align: left;
    }
    
    .ql-editor strong, .quill-content strong {
      font-weight: 700;
      color: #1f2937;
      background: linear-gradient(135deg, #f1872c20, transparent);
      padding: 0.125rem 0.25rem;
      border-radius: 0.25rem;
    }
    
    .ql-editor em, .quill-content em {
      font-style: italic;
      color: #6b7280;
      background: #f9fafb;
      padding: 0.125rem 0.25rem;
      border-radius: 0.25rem;
    }
    
    .ql-editor ul, .quill-content ul {
      margin: 1.5rem 0;
      padding-left: 0;
      list-style: none;
    }
    
    .ql-editor ul li, .quill-content ul li {
      position: relative;
      padding: 0.75rem 0 0.75rem 2rem;
      margin: 0.5rem 0;
      font-size: 1.125rem;
      line-height: 1.6;
      color: #374151;
      background: linear-gradient(135deg, #f8fafc, #f1f5f9);
      border-radius: 0.75rem;
      border-left: 4px solid #094d57;
      transition: all 0.3s ease;
    }
    
    .ql-editor ul li:hover, .quill-content ul li:hover {
      background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
      transform: translateX(0.25rem);
    }
    
    .ql-editor ul li::before, .quill-content ul li::before {
      content: '●';
      position: absolute;
      left: 0.75rem;
      top: 0.75rem;
      color: #094d57;
      font-size: 1.25rem;
      line-height: 1.6;
    }
    
    .ql-editor ol, .quill-content ol {
      margin: 1.5rem 0;
      padding-left: 0;
      counter-reset: list-counter;
    }
    
    .ql-editor ol li, .quill-content ol li {
      position: relative;
      padding: 0.75rem 0 0.75rem 3rem;
      margin: 0.5rem 0;
      font-size: 1.125rem;
      line-height: 1.6;
      color: #374151;
      background: linear-gradient(135deg, #fef7ed, #fed7aa);
      border-radius: 0.75rem;
      border-left: 4px solid #f1872c;
      counter-increment: list-counter;
      transition: all 0.3s ease;
    }
    
    .ql-editor ol li:hover, .quill-content ol li:hover {
      background: linear-gradient(135deg, #fed7aa, #fdba74);
      transform: translateX(0.25rem);
    }
    
    .ql-editor ol li::before, .quill-content ol li::before {
      content: counter(list-counter);
      position: absolute;
      left: 0.75rem;
      top: 0.75rem;
      background: #f1872c;
      color: white;
      width: 1.5rem;
      height: 1.5rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.875rem;
      font-weight: 600;
      line-height: 1;
    }
    
    .ql-editor blockquote, .quill-content blockquote {
      margin: 2rem 0;
      padding: 1.5rem 2rem;
      background: linear-gradient(135deg, #eff6ff, #dbeafe);
      border-left: 6px solid #3b82f6;
      border-radius: 0 1rem 1rem 0;
      font-style: italic;
      font-size: 1.125rem;
      line-height: 1.7;
      color: #1e40af;
      position: relative;
    }
    
    .ql-editor blockquote::before, .quill-content blockquote::before {
      content: '"';
      position: absolute;
      top: -0.5rem;
      left: 1rem;
      font-size: 4rem;
      color: #3b82f6;
      opacity: 0.3;
      font-family: serif;
    }
    
    .ql-editor code, .quill-content code {
      background: linear-gradient(135deg, #1f2937, #374151);
      color: #f9fafb;
      padding: 0.25rem 0.5rem;
      border-radius: 0.375rem;
      font-family: 'JetBrains Mono', 'Courier New', monospace;
      font-size: 0.875rem;
      font-weight: 500;
      border: 1px solid #4b5563;
    }
    
    .ql-editor pre, .quill-content pre {
      background: linear-gradient(135deg, #1f2937, #111827);
      color: #f9fafb;
      padding: 1.5rem;
      border-radius: 1rem;
      margin: 1.5rem 0;
      overflow-x: auto;
      font-family: 'JetBrains Mono', 'Courier New', monospace;
      font-size: 0.875rem;
      line-height: 1.6;
      border: 1px solid #374151;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    }
    
    .ql-editor pre code, .quill-content pre code {
      background: none;
      color: inherit;
      padding: 0;
      border-radius: 0;
      border: none;
    }
    
    .ql-editor a, .quill-content a {
      color: #094d57;
      text-decoration: none;
      font-weight: 600;
      border-bottom: 2px solid transparent;
      transition: all 0.3s ease;
    }
    
    .ql-editor a:hover, .quill-content a:hover {
      color: #f1872c;
      border-bottom-color: #f1872c;
    }
    
    .ql-editor table, .quill-content table {
      width: 100%;
      margin: 2rem 0;
      border-collapse: collapse;
      background: white;
      border-radius: 1rem;
      overflow: hidden;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
    }
    
    .ql-editor th, .quill-content th {
      background: linear-gradient(135deg, #094d57, #0c5a66);
      color: white;
      padding: 1rem;
      text-align: left;
      font-weight: 600;
      font-size: 1rem;
    }
    
    .ql-editor td, .quill-content td {
      padding: 1rem;
      border-bottom: 1px solid #e5e7eb;
      font-size: 1rem;
      line-height: 1.6;
    }
    
    .ql-editor tr:nth-child(even), .quill-content tr:nth-child(even) {
      background: #f9fafb;
    }
    
    .ql-editor tr:hover, .quill-content tr:hover {
      background: #f3f4f6;
    }
    
    .ql-editor img, .quill-content img {
      max-width: 100%;
      height: auto;
      border-radius: 1rem;
      margin: 1.5rem 0;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
    }
    
    .ql-editor hr, .quill-content hr {
      border: none;
      height: 2px;
      background: linear-gradient(135deg, #094d57, #f1872c);
      margin: 2rem 0;
      border-radius: 1px;
    }
    
    /* React Quill specific styles */
    .ql-editor .ql-align-center, .quill-content .ql-align-center {
      text-align: center;
    }
    
    .ql-editor .ql-align-right, .quill-content .ql-align-right {
      text-align: right;
    }
    
    .ql-editor .ql-align-justify, .quill-content .ql-align-justify {
      text-align: justify;
    }
    
    .ql-editor .ql-indent-1, .quill-content .ql-indent-1 {
      padding-left: 3rem;
    }
    
    .ql-editor .ql-indent-2, .quill-content .ql-indent-2 {
      padding-left: 6rem;
    }
    
    /* Special content boxes */
    .ql-editor .info-box, .quill-content .info-box {
      background: linear-gradient(135deg, #eff6ff, #dbeafe);
      border: 1px solid #93c5fd;
      border-radius: 1rem;
      padding: 1.5rem;
      margin: 1.5rem 0;
      position: relative;
    }
    
    .ql-editor .warning-box, .quill-content .warning-box {
      background: linear-gradient(135deg, #fffbeb, #fef3c7);
      border: 1px solid #fcd34d;
      border-radius: 1rem;
      padding: 1.5rem;
      margin: 1.5rem 0;
      position: relative;
    }
    
    .ql-editor .success-box, .quill-content .success-box {
      background: linear-gradient(135deg, #f0fdf4, #dcfce7);
      border: 1px solid #86efac;
      border-radius: 1rem;
      padding: 1.5rem;
      margin: 1.5rem 0;
      position: relative;
    }
    
    /* Remove default Quill margins and padding */
    .ql-editor {
      padding: 0 !important;
      margin: 0 !important;
    }
    
    /* Responsive design */
    @media (max-width: 768px) {
      .ql-editor h1, .quill-content h1 { font-size: 2rem; }
      .ql-editor h2, .quill-content h2 { font-size: 1.5rem; }
      .ql-editor h3, .quill-content h3 { font-size: 1.25rem; }
      .ql-editor h4, .quill-content h4 { font-size: 1.125rem; }
      .ql-editor p, .quill-content p { font-size: 1rem; }
      .ql-editor ul li, .quill-content ul li { font-size: 1rem; padding-left: 1.5rem; }
      .ql-editor ol li, .quill-content ol li { font-size: 1rem; padding-left: 2.5rem; }
    }
  `

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`relative ${className}`}
    >
      {/* Inject custom styles */}
      <style dangerouslySetInnerHTML={{ __html: contentStyles }} />
      
      {/* Content container with modern design */}
      <div className="bg-white/70 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden">
        {/* Content header with gradient */}
        <div className="bg-gradient-to-r from-[#094d57] via-[#0c5a66] to-[#f1872c] p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl">
              <BookOpenIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Lesson Content</h2>
              <p className="text-white/80 text-sm">Enhanced for better learning experience</p>
            </div>
          </div>
        </div>

        {/* Main content area */}
        <div className="p-8">
          {content ? (
            <div 
              className="ql-editor quill-content prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: cleanContent }}
            />
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <InformationCircleIcon className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Content Available</h3>
              <p className="text-gray-600">This lesson doesn't have any content yet.</p>
            </div>
          )}
        </div>

        {/* Content footer with reading progress */}
        <div className="bg-gray-50/50 backdrop-blur-md border-t border-gray-200/50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <CheckCircleIcon className="h-4 w-4 text-green-500" />
              <span>Content loaded successfully</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <LightBulbIcon className="h-4 w-4 text-yellow-500" />
              <span>Enhanced for readability</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Hook for reading time estimation
export function useReadingTime(content: string) {
  return React.useMemo(() => {
    if (!content) return 0
    
    // Remove HTML tags and count words
    const textContent = content.replace(/<[^>]*>/g, ' ')
    const wordCount = textContent.split(/\s+/).filter(word => word.length > 0).length
    
    // Average reading speed: 200 words per minute
    const readingTimeMinutes = Math.ceil(wordCount / 200)
    
    return readingTimeMinutes
  }, [content])
}

// Component for content metadata
export function ContentMetadata({ 
  content, 
  difficulty, 
  timeMinutes 
}: { 
  content: string
  difficulty?: string
  timeMinutes?: number 
}) {
  const estimatedReadingTime = useReadingTime(content)
  
  return (
    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-6">
      {difficulty && (
        <div className="flex items-center space-x-1">
          <div className={`w-2 h-2 rounded-full ${
            difficulty === 'beginner' ? 'bg-green-500' :
            difficulty === 'intermediate' ? 'bg-yellow-500' : 'bg-red-500'
          }`} />
          <span className="capitalize">{difficulty}</span>
        </div>
      )}
      
      {timeMinutes && (
        <div className="flex items-center space-x-1">
          <ClockIcon className="h-4 w-4" />
          <span>{timeMinutes} min</span>
        </div>
      )}
      
      <div className="flex items-center space-x-1">
        <BookOpenIcon className="h-4 w-4" />
        <span>~{estimatedReadingTime} min read</span>
      </div>
    </div>
  )
}