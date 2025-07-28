export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  id: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

class GeminiAPI {
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateResponse(messages: ChatMessage[]): Promise<string> {
    try {
      // Convert messages to Gemini format
      const contents = messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));

      console.log('Sending request to:', `${this.baseUrl}?key=${this.apiKey.substring(0, 10)}...`);
      console.log('Request body:', JSON.stringify({ contents, generationConfig: { temperature: 0.7, topK: 40, topP: 0.95, maxOutputTokens: 2048 } }, null, 2));

      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Response Error:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data: GeminiResponse = await response.json();
      console.log('API Response:', data);
      
      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('No response generated');
      }

      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Gemini API error:', error);
      throw new Error('Failed to generate response. Please try again.');
    }
  }

  async generateTitle(firstMessage: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            role: 'user',
            parts: [{ text: `Generate a short, descriptive title (max 50 characters) for this conversation: "${firstMessage}"` }]
          }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 100,
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Title generation error:', errorText);
        return 'New Chat';
      }

      const data: GeminiResponse = await response.json();
      
      if (!data.candidates || data.candidates.length === 0) {
        return 'New Chat';
      }

      return data.candidates[0].content.parts[0].text.trim().replace(/"/g, '');
    } catch (error) {
      console.error('Error generating title:', error);
      return 'New Chat';
    }
  }
}

// Create singleton instance
export const geminiAPI = new GeminiAPI('AIzaSyDw_9alloQpT0WN19BucY8E7frSyc4D974'); 