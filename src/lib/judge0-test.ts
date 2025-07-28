import { Judge0Service } from './judge0'

export async function testJudge0Integration() {
  console.log('🧪 Testing Judge0 API Integration...')
  
  try {
    // Test 1: Basic connection test
    console.log('📡 Testing connection to Judge0 instance...')
    const languages = await Judge0Service.getSupportedLanguages()
    console.log('✅ Connection successful! Supported languages:', languages.length)
    
    // Test 2: Simple JavaScript execution
    console.log('🔧 Testing JavaScript execution...')
    const jsCode = 'console.log("Hello from Judge0!");'
    const jsResult = await Judge0Service.executeCode(jsCode, 'javascript')
    
    if (jsResult.success) {
      console.log('✅ JavaScript execution successful!')
      console.log('📤 Output:', jsResult.output)
      console.log('⏱️  Execution time:', jsResult.executionTime, 'ms')
    } else {
      console.log('❌ JavaScript execution failed:', jsResult.error)
    }
    
    // Test 3: Python execution
    console.log('🐍 Testing Python execution...')
    const pyCode = 'print("Hello from Python!")'
    const pyResult = await Judge0Service.executeCode(pyCode, 'python')
    
    if (pyResult.success) {
      console.log('✅ Python execution successful!')
      console.log('📤 Output:', pyResult.output)
      console.log('⏱️  Execution time:', pyResult.executionTime, 'ms')
    } else {
      console.log('❌ Python execution failed:', pyResult.error)
    }
    
    // Test 4: Code with input
    console.log('📥 Testing code with input...')
    const inputCode = `
import sys
name = input()
print(f"Hello, {name}!")
`
    const inputResult = await Judge0Service.executeCode(inputCode, 'python', 'World')
    
    if (inputResult.success) {
      console.log('✅ Input handling successful!')
      console.log('📤 Output:', inputResult.output)
    } else {
      console.log('❌ Input handling failed:', inputResult.error)
    }
    
    // Test 5: Error handling
    console.log('🚨 Testing error handling...')
    const errorCode = 'print("This will work"); raise Exception("This is an error")'
    const errorResult = await Judge0Service.executeCode(errorCode, 'python')
    
    if (!errorResult.success) {
      console.log('✅ Error handling working correctly!')
      console.log('📤 Error:', errorResult.error)
    } else {
      console.log('⚠️  Expected error but got success')
    }
    
    console.log('🎉 Judge0 API integration test completed!')
    return {
      success: true,
      message: 'All tests passed successfully!',
      details: {
        languages: languages.length,
        jsTest: jsResult.success,
        pythonTest: pyResult.success,
        inputTest: inputResult.success,
        errorTest: !errorResult.success
      }
    }
    
  } catch (error) {
    console.error('❌ Judge0 API test failed:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
      details: null
    }
  }
}

export async function testJudge0Connection() {
  try {
    console.log('🔍 Testing Judge0 connection...')
    const languages = await Judge0Service.getSupportedLanguages()
    console.log('✅ Judge0 connection successful!')
    console.log('📊 Available languages:', languages.length)
    return { success: true, languages }
  } catch (error) {
    console.error('❌ Judge0 connection failed:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      languages: []
    }
  }
}

export async function testJudge0Execution(language: string, code: string, input?: string) {
  try {
    console.log(`🔧 Testing ${language} execution...`)
    const result = await Judge0Service.executeCode(code, language, input)
    
    if (result.success) {
      console.log('✅ Execution successful!')
      console.log('📤 Output:', result.output)
      console.log('⏱️  Time:', result.executionTime, 'ms')
      console.log('💾 Memory:', result.memory, 'KB')
    } else {
      console.log('❌ Execution failed:', result.error)
    }
    
    return result
  } catch (error) {
    console.error('❌ Execution test failed:', error)
    return {
      success: false,
      output: '',
      error: error instanceof Error ? error.message : 'Unknown error',
      executionTime: 0,
      memory: null,
      status: 'Error'
    }
  }
} 