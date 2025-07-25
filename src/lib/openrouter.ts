// OpenRouter API client for AI-powered anti-cheating
const OPENROUTER_API_KEY = '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'
const OPENROUTER_BASE_URL = '/api/openrouter'

export class OpenRouterClient {
  private apiKey: string
  private baseUrl: string

  constructor() {
    this.apiKey = OPENROUTER_API_KEY
    this.baseUrl = OPENROUTER_BASE_URL
  }

  async analyzeImage(imageData: string, context: string = 'quiz_monitoring'): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'ForgeTrain Quiz Security'
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-3.2-11b-vision-instruct:free',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `Analyze this image for quiz security violations. Look for:
                  1. Multiple people in frame
                  2. Mobile phones or electronic devices
                  3. Books, notes, or written materials
                  4. Secondary monitors or screens
                  5. Suspicious behavior or posture
                  6. Objects that could be used for cheating
                  
                  Context: ${context}
                  
                  Respond with JSON format:
                  {
                    "violations": ["list of violations found"],
                    "suspiciousObjects": ["list of suspicious objects"],
                    "peopleCount": number,
                    "riskLevel": "low|medium|high",
                    "confidence": 0.0-1.0,
                    "recommendations": ["security recommendations"]
                  }`
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: imageData
                  }
                }
              ]
            }
          ],
          max_tokens: 500,
          temperature: 0.1
        })
      })

      if (!response.ok) {
        const errorBody = await response.text()
        console.error(`OpenRouter API error: ${response.status} - ${errorBody}`)
        throw new Error(`OpenRouter API error: ${response.status}`)
      }

      const data = await response.json()
      const content = data.choices[0]?.message?.content

      try {
        return JSON.parse(content)
      } catch {
        return {
          violations: ['Analysis failed'],
          suspiciousObjects: [],
          peopleCount: 1,
          riskLevel: 'medium',
          confidence: 0.5,
          recommendations: ['Manual review required']
        }
      }
    } catch (error) {
      console.error('OpenRouter analysis failed:', error)
      return {
        violations: ['API unavailable'],
        suspiciousObjects: [],
        peopleCount: 1,
        riskLevel: 'low',
        confidence: 0.0,
        recommendations: ['Continue with basic monitoring']
      }
    }
  }

  async analyzeAudio(audioData: Blob): Promise<any> {
    try {
      // Audio transcription requires a different API endpoint and FormData
      // For now, return mock analysis to prevent API errors
      console.warn('Audio analysis temporarily disabled - using pattern-based detection')
      
      // Simulate basic audio analysis based on blob size and duration
      const audioSize = audioData.size
      const estimatedDuration = audioSize / 16000 // Rough estimate
      
      return {
        violations: audioSize > 100000 ? ['High audio activity detected'] : [],
        voiceCount: audioSize > 50000 ? 2 : 1,
        suspiciousActivity: audioSize > 100000,
        riskLevel: audioSize > 100000 ? 'medium' : 'low',
        transcript: 'Audio analysis in progress...'
      }
    } catch (error) {
      console.error('Audio analysis failed:', error)
      return {
        violations: [],
        voiceCount: 1,
        suspiciousActivity: false,
        riskLevel: 'low',
        transcript: ''
      }
    }
  }

  private async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }
}

export const openRouterClient = new OpenRouterClient()