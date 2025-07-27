// Simple test utility for Gemini API
const API_KEY = 'AIzaSyDw_9alloQpT0WN19BucY8E7frSyc4D974';

export async function testGeminiAPI() {
  console.log('Testing Gemini API connection...');
  
  const testUrl = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent';
  
  try {
    const response = await fetch(`${testUrl}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          role: 'user',
          parts: [{ text: 'Hello, can you respond with "API is working"?' }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 100,
        }
      })
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      return false;
    }

    const data = await response.json();
    console.log('Success response:', data);
    return true;
  } catch (error) {
    console.error('Test failed:', error);
    return false;
  }
}

// Test different models
export async function testAvailableModels() {
  const models = [
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'gemini-1.0-pro',
    'gemini-pro'
  ];

  for (const model of models) {
    console.log(`\nTesting model: ${model}`);
    const testUrl = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent`;
    
    try {
      const response = await fetch(`${testUrl}?key=${API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            role: 'user',
            parts: [{ text: 'Test' }]
          }],
          generationConfig: {
            maxOutputTokens: 10,
          }
        })
      });

      console.log(`  Status: ${response.status}`);
      if (!response.ok) {
        const errorText = await response.text();
        console.log(`  Error: ${errorText.substring(0, 100)}...`);
      } else {
        console.log(`  ✅ Model ${model} is available`);
      }
    } catch (error) {
      console.log(`  ❌ Error: ${error}`);
    }
  }
} 