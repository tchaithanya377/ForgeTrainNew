interface Judge0Submission {
  source_code: string
  language_id: number
  stdin?: string
  expected_output?: string
}

interface Judge0Response {
  token: string
}

interface Judge0Result {
  stdout: string | null
  time: string | null
  memory: number | null
  stderr: string | null
  compile_output: string | null
  message: string | null
  status: {
    id: number
    description: string
  }
}

// Language ID mappings for Judge0
const LANGUAGE_IDS: Record<string, number> = {
  'javascript': 63, // Node.js
  'js': 63,
  'python': 71, // Python 3
  'py': 71,
  'java': 62, // Java
  'cpp': 54, // C++
  'c++': 54,
  'c': 50, // C
  'csharp': 51, // C#
  'cs': 51,
  'php': 68, // PHP
  'ruby': 72, // Ruby
  'go': 60, // Go
  'rust': 73, // Rust
  'swift': 83, // Swift
  'kotlin': 78, // Kotlin
  'scala': 81, // Scala
  'r': 80, // R
  'dart': 87, // Dart
  'elixir': 57, // Elixir
  'erlang': 58, // Erlang
  'haskell': 61, // Haskell
  'lua': 64, // Lua
  'perl': 85, // Perl
  'bash': 46, // Bash
  'sql': 82, // SQL
  'typescript': 74, // TypeScript
  'ts': 74,
}

// Language extensions mapping (since the API doesn't provide them)
const LANGUAGE_EXTENSIONS: Record<number, string> = {
  63: 'js',    // JavaScript (Node.js 12.14.0)
  71: 'py',    // Python (3.8.1)
  62: 'java',  // Java (OpenJDK 13.0.1)
  54: 'cpp',   // C++ (GCC 9.2.0)
  50: 'c',     // C (GCC 9.2.0)
  51: 'cs',    // C# (Mono 6.6.0.161)
  68: 'php',   // PHP (7.4.1)
  72: 'rb',    // Ruby (2.7.0)
  60: 'go',    // Go (1.13.5)
  73: 'rs',    // Rust (1.40.0)
  83: 'swift', // Swift (5.2.3)
  78: 'kt',    // Kotlin (1.3.70)
  81: 'scala', // Scala (2.13.2)
  80: 'r',     // R (4.0.0)
  57: 'ex',    // Elixir (1.9.4)
  58: 'erl',   // Erlang (OTP 22.2)
  61: 'hs',    // Haskell (GHC 8.8.1)
  64: 'lua',   // Lua (5.3.5)
  85: 'pl',    // Perl (5.28.1)
  46: 'sh',    // Bash (5.0.0)
  82: 'sql',   // SQL (SQLite 3.27.2)
  74: 'ts',    // TypeScript (3.7.4)
  70: 'py',    // Python (2.7.17)
  84: 'vb',    // Visual Basic.Net
  87: 'dart',  // Dart
  86: 'clj',   // Clojure (1.10.1)
  77: 'cob',   // COBOL (GnuCOBOL 2.2)
  55: 'lisp',  // Common Lisp (SBCL 2.0.0)
  56: 'd',     // D (DMD 2.089.1)
  44: 'exe',   // Executable
  90: 'fs',    // F# (.NET Core SDK 3.1.202)
  59: 'f90',   // Fortran (GFortran 9.2.0)
  88: 'groovy', // Groovy (3.0.3)
  89: 'multi', // Multi-file program
  79: 'm',     // Objective-C (Clang 7.0.1)
  65: 'ml',    // OCaml (4.09.0)
  66: 'm',     // Octave (5.1.0)
  67: 'pas',   // Pascal (FPC 3.0.4)
  69: 'pl',    // Prolog (GNU Prolog 1.4.5)
  45: 'asm',   // Assembly (NASM 2.14.02)
  47: 'bas',   // Basic (FBC 1.07.1)
  75: 'c',     // C (Clang 7.0.1)
  76: 'cpp',   // C++ (Clang 7.0.1)
  48: 'c',     // C (GCC 7.4.0)
  52: 'cpp',   // C++ (GCC 7.4.0)
  49: 'c',     // C (GCC 8.3.0)
  53: 'cpp',   // C++ (GCC 8.3.0)
}

// Get API key from environment or use fallback
const JUDGE0_API_KEY = import.meta.env.VITE_JUDGE0_API_KEY || ''
const JUDGE0_HOST = 'http://3.85.134.155:2358'

// Alternative Judge0 instances
const JUDGE0_INSTANCES = {
  aws: {
    host: 'http://3.85.134.155:2358',
    name: 'AWS EC2 Instance',
    requiresAuth: false,
    headers: {}
  },
  rapidapi: {
    host: 'https://judge0-ce.p.rapidapi.com',
    name: 'RapidAPI',
    requiresAuth: true,
    headers: {
      'X-RapidAPI-Key': '74328e168emsh588c9081fc4f4b8p132647jsn12c6313d0b4f',
      'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
    }
  }
}

export class Judge0Service {
  private static languageCache: Array<{ id: number; name: string; extension: string }> | null = null
  private static currentInstance: keyof typeof JUDGE0_INSTANCES = 'rapidapi'

  static setInstance(instance: keyof typeof JUDGE0_INSTANCES) {
    this.currentInstance = instance
    this.languageCache = null // Clear cache when switching instances
    console.log(`🔄 Switched to Judge0 instance: ${JUDGE0_INSTANCES[instance].name}`)
  }

  static getCurrentInstance() {
    return JUDGE0_INSTANCES[this.currentInstance]
  }

  private static async makeRequest(endpoint: string, options: RequestInit = {}) {
    const instance = this.getCurrentInstance()
    const url = `${instance.host}${endpoint}`
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    
    // Add instance-specific headers
    if (instance.requiresAuth && instance.headers) {
      Object.assign(headers, instance.headers)
    } else if (JUDGE0_API_KEY) {
      headers['X-Auth-Token'] = JUDGE0_API_KEY
    }
    
    // Merge with any additional headers from options
    if (options.headers) {
      Object.assign(headers, options.headers)
    }
    
    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Judge0 API Error Details:', {
        status: response.status,
        statusText: response.statusText,
        url: url,
        errorText: errorText
      })
      
      if (response.status === 401) {
        throw new Error(`Judge0 API authentication failed (401). Please check your API key.`)
      } else if (response.status === 403) {
        throw new Error(`Judge0 API access denied (403). Please check your authorization.`)
      } else if (response.status === 429) {
        throw new Error('Judge0 API rate limit exceeded. Please wait a moment and try again.')
      } else {
        throw new Error(`Judge0 API error: ${response.status} ${response.statusText}. ${errorText}`)
      }
    }

    return response.json()
  }

  static async submitCode(code: string, language: string, input?: string): Promise<string> {
    // Try to get language ID from our mapping first
    let languageId = LANGUAGE_IDS[language.toLowerCase()]
    
    // If not found in mapping, try to find it dynamically
    if (!languageId) {
      console.log(`🔍 Language ${language} not found in mapping, searching dynamically...`)
      const foundId = await this.findLanguageId(language)
      if (foundId) {
        languageId = foundId
      }
    }
    
    if (!languageId) {
      throw new Error(`Unsupported language: ${language}. Please check available languages.`)
    }

    // Ensure code is properly formatted
    const cleanCode = code.trim()
    const cleanInput = input ? input.trim() : undefined

    const submission: Judge0Submission = {
      source_code: cleanCode,
      language_id: languageId,
    }

    if (cleanInput) {
      submission.stdin = cleanInput
    }

    console.log('📤 Submitting code:', {
      language_id: languageId,
      code_length: cleanCode.length,
      has_input: !!cleanInput,
      instance: this.getCurrentInstance().name
    })

    try {
      const response = await this.makeRequest('/submissions', {
        method: 'POST',
        body: JSON.stringify(submission),
      }) as Judge0Response

      console.log('✅ Submission created with token:', response.token)
      return response.token
    } catch (error) {
      console.error('❌ Submission failed:', error)
      console.error('📋 Submission data:', submission)
      throw error
    }
  }

  static async getResult(token: string): Promise<Judge0Result> {
    const response = await this.makeRequest(`/submissions/${token}`)
    return response as Judge0Result
  }

  static async waitForResult(token: string, maxWaitTime: number = 30000): Promise<Judge0Result> {
    const startTime = Date.now()
    const pollInterval = 1000 // 1 second

    while (Date.now() - startTime < maxWaitTime) {
      const result = await this.getResult(token)
      
      // Check if execution is complete
      if (result.status.id >= 3) { // 3 = Accepted, 4 = Wrong Answer, 5 = Time Limit Exceeded, etc.
        return result
      }

      // Wait before polling again
      await new Promise(resolve => setTimeout(resolve, pollInterval))
    }

    throw new Error('Execution timeout')
  }

  static async executeCode(
    code: string,
    language: string,
    input?: string,
    expectedOutput?: string
  ): Promise<{
    success: boolean
    output: string
    error: string | null
    executionTime: number
    memory: number | null
    status: string
  }> {
    try {
      const startTime = Date.now()
      
      // Submit code
      const token = await this.submitCode(code, language, input)
      
      // Wait for result
      const result = await this.waitForResult(token)
      
      const executionTime = Date.now() - startTime
      
      // Determine success based on status and output
      let success = false
      let output = ''
      let error = null
      
      switch (result.status.id) {
        case 3: // Accepted
          success = true
          output = result.stdout || ''
          break
        case 4: // Wrong Answer
          success = false
          output = result.stdout || ''
          error = 'Wrong Answer'
          break
        case 5: // Time Limit Exceeded
          success = false
          error = 'Time Limit Exceeded'
          break
        case 6: // Compilation Error
          success = false
          error = result.compile_output || 'Compilation Error'
          break
        case 7: // Runtime Error
          success = false
          error = result.stderr || 'Runtime Error'
          break
        default:
          success = false
          error = result.message || 'Unknown Error'
      }
      
      // If expected output is provided, compare with actual output
      if (expectedOutput && success) {
        const actualOutput = (result.stdout || '').trim()
        const expectedOutputTrimmed = expectedOutput.trim()
        success = actualOutput === expectedOutputTrimmed
        if (!success) {
          error = `Expected: ${expectedOutputTrimmed}, Got: ${actualOutput}`
        }
      }
      
      return {
        success,
        output: result.stdout || '',
        error,
        executionTime,
        memory: result.memory,
        status: result.status.description
      }
      
    } catch (error) {
      // Check if it's an API key error
      if (error instanceof Error && error.message.includes('403')) {
        return {
          success: false,
          output: '',
          error: 'API Key Error: Please check your Judge0 API key configuration. See API_KEY_SETUP.md for instructions.',
          executionTime: 0,
          memory: null,
          status: 'API Key Error'
        }
      }
      
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

  static async getSupportedLanguages(): Promise<Array<{ id: number; name: string; extension: string }>> {
    if (this.languageCache) {
      return this.languageCache
    }

    try {
      const response = await this.makeRequest('/languages')
      // Add extensions to the languages since the API doesn't provide them
      const languagesWithExtensions = (response as Array<{ id: number; name: string }>).map(lang => ({
        ...lang,
        extension: LANGUAGE_EXTENSIONS[lang.id] || 'txt'
      }))
      this.languageCache = languagesWithExtensions
      return this.languageCache
    } catch (error) {
      console.error('Failed to fetch supported languages:', error)
      // Return a subset of supported languages as fallback
      this.languageCache = [
        { id: 63, name: 'JavaScript (Node.js 12.14.0)', extension: 'js' },
        { id: 71, name: 'Python (3.8.1)', extension: 'py' },
        { id: 62, name: 'Java (OpenJDK 13.0.1)', extension: 'java' },
        { id: 54, name: 'C++ (GCC 9.2.0)', extension: 'cpp' },
        { id: 50, name: 'C (GCC 9.2.0)', extension: 'c' },
      ]
      return this.languageCache
    }
  }

  static async debugLanguages(): Promise<void> {
    try {
      console.log('🔍 Debugging Judge0 languages...')
      
      // Get all languages
      const languages = await this.getSupportedLanguages()
      console.log('📋 All supported languages:')
      languages.forEach(lang => {
        console.log(`  ID: ${lang.id}, Name: ${lang.name}, Extension: ${lang.extension}`)
      })
      
      // Test specific language IDs we're using
      const testIds = [63, 71, 62, 54, 50] // js, python, java, cpp, c
      console.log('🧪 Testing specific language IDs:')
      
      for (const id of testIds) {
        try {
          const lang = languages.find(l => l.id === id)
          if (lang) {
            console.log(`  ✅ ID ${id}: ${lang.name}`)
          } else {
            console.log(`  ❌ ID ${id}: Not found`)
          }
        } catch (error) {
          console.log(`  ❌ ID ${id}: Error - ${error}`)
        }
      }
      
    } catch (error) {
      console.error('❌ Debug failed:', error)
    }
  }

  static async testBasicConnection(): Promise<void> {
    try {
      console.log('🔍 Testing basic Judge0 connection...')
      
      // Test 1: About endpoint
      console.log('📡 Testing /about endpoint...')
      const aboutResponse = await this.makeRequest('/about')
      console.log('✅ About response:', aboutResponse)
      
      // Test 2: Languages endpoint
      console.log('📡 Testing /languages endpoint...')
      const languagesResponse = await this.makeRequest('/languages')
      console.log('✅ Languages response (first 5):', languagesResponse.slice(0, 5))
      
      // Test 3: Configuration endpoint
      console.log('📡 Testing /config_info endpoint...')
      const configResponse = await this.makeRequest('/config_info')
      console.log('✅ Config response:', configResponse)
      
    } catch (error) {
      console.error('❌ Basic connection test failed:', error)
    }
  }

  static async findCorrectLanguageIds(): Promise<Record<string, number>> {
    try {
      console.log('🔍 Finding correct language IDs for your Judge0 instance...')
      
      const languages = await this.getSupportedLanguages()
      const correctIds: Record<string, number> = {}
      
      // Look for JavaScript/Node.js
      const jsLanguages = languages.filter(lang => 
        lang.name.toLowerCase().includes('javascript') ||
        lang.name.toLowerCase().includes('node') ||
        lang.name.toLowerCase().includes('js') ||
        lang.extension === 'js'
      )
      
      if (jsLanguages.length > 0) {
        correctIds['javascript'] = jsLanguages[0].id
        correctIds['js'] = jsLanguages[0].id
        console.log(`✅ Found JavaScript: ID ${jsLanguages[0].id} - ${jsLanguages[0].name}`)
      } else {
        console.log('❌ No JavaScript language found')
      }
      
      // Look for Python
      const pythonLanguages = languages.filter(lang => 
        lang.name.toLowerCase().includes('python') ||
        lang.name.toLowerCase().includes('py') ||
        lang.extension === 'py'
      )
      
      if (pythonLanguages.length > 0) {
        correctIds['python'] = pythonLanguages[0].id
        correctIds['py'] = pythonLanguages[0].id
        console.log(`✅ Found Python: ID ${pythonLanguages[0].id} - ${pythonLanguages[0].name}`)
      } else {
        console.log('❌ No Python language found')
      }
      
      // Look for other common languages
      const commonLanguages = [
        { name: 'java', keywords: ['java'], ext: 'java' },
        { name: 'cpp', keywords: ['c++', 'cpp'], ext: 'cpp' },
        { name: 'c', keywords: ['c '], ext: 'c' },
        { name: 'csharp', keywords: ['c#', 'csharp'], ext: 'cs' },
        { name: 'php', keywords: ['php'], ext: 'php' },
        { name: 'ruby', keywords: ['ruby'], ext: 'rb' },
        { name: 'go', keywords: ['go'], ext: 'go' },
        { name: 'rust', keywords: ['rust'], ext: 'rs' },
        { name: 'swift', keywords: ['swift'], ext: 'swift' },
        { name: 'kotlin', keywords: ['kotlin'], ext: 'kt' },
        { name: 'typescript', keywords: ['typescript'], ext: 'ts' }
      ]
      
      for (const lang of commonLanguages) {
        const found = languages.find(l => 
          lang.keywords.some(keyword => l.name.toLowerCase().includes(keyword)) ||
          l.extension === lang.ext
        )
        
        if (found) {
          correctIds[lang.name] = found.id
          console.log(`✅ Found ${lang.name}: ID ${found.id} - ${found.name}`)
        }
      }
      
      console.log('📋 Corrected language IDs:', correctIds)
      return correctIds
      
    } catch (error) {
      console.error('❌ Error finding correct language IDs:', error)
      return {}
    }
  }

  static async testLanguageExecution(languageId: number, code: string, languageName: string): Promise<void> {
    try {
      console.log(`🧪 Testing language ID ${languageId} (${languageName})...`)
      
      const submission: Judge0Submission = {
        source_code: code,
        language_id: languageId,
      }
      
      const response = await this.makeRequest('/submissions', {
        method: 'POST',
        body: JSON.stringify(submission),
      }) as Judge0Response
      
      console.log(`✅ Submission created with token: ${response.token}`)
      
      // Wait for result
      const result = await this.waitForResult(response.token)
      console.log(`📊 Result for ${languageName}:`, {
        status: result.status.description,
        stdout: result.stdout,
        stderr: result.stderr,
        compile_output: result.compile_output,
        time: result.time,
        memory: result.memory
      })
      
    } catch (error) {
      console.error(`❌ Error testing ${languageName} (ID ${languageId}):`, error)
    }
  }

  static async debugAndFixLanguageIds(): Promise<void> {
    try {
      console.log('🔧 Starting comprehensive debug and fix process...')
      
      // Step 1: Test basic connection
      console.log('\n📡 Step 1: Testing basic connection...')
      await this.testBasicConnection()
      
      // Step 2: Find correct language IDs
      console.log('\n🔍 Step 2: Finding correct language IDs...')
      const correctIds = await this.findCorrectLanguageIds()
      
      // Step 3: Test each language with simple code
      console.log('\n🧪 Step 3: Testing language execution...')
      
      if (correctIds['javascript']) {
        await this.testLanguageExecution(
          correctIds['javascript'],
          'console.log("Hello from JavaScript!");',
          'JavaScript'
        )
      }
      
      if (correctIds['python']) {
        await this.testLanguageExecution(
          correctIds['python'],
          'print("Hello from Python!")',
          'Python'
        )
      }
      
      // Step 4: Update the language mappings if needed
      console.log('\n🔄 Step 4: Updating language mappings...')
      if (Object.keys(correctIds).length > 0) {
        console.log('📝 Current mappings:', LANGUAGE_IDS)
        console.log('📝 Corrected mappings:', correctIds)
        
        // Update the global LANGUAGE_IDS object
        Object.assign(LANGUAGE_IDS, correctIds)
        console.log('✅ Language mappings updated!')
      }
      
      console.log('\n🎉 Debug and fix process completed!')
      
    } catch (error) {
      console.error('❌ Debug and fix process failed:', error)
    }
  }

  static async testFixedLanguageIds(): Promise<void> {
    try {
      console.log('🧪 Testing fixed language IDs with original test cases...')
      
      // Test JavaScript with the original test case
      console.log('\n🔧 Testing JavaScript...')
      const jsCode = `function add(a, b) {
  return a + b;
}
console.log(add(5, 3));`
      
      const jsResult = await this.executeCode(jsCode, 'javascript')
      console.log('JavaScript result:', {
        success: jsResult.success,
        output: jsResult.output,
        error: jsResult.error,
        status: jsResult.status
      })
      
      // Test Python with the original test case
      console.log('\n🐍 Testing Python...')
      const pyCode = `def multiply(a, b):
    return a * b

print(multiply(4, 6))`
      
      const pyResult = await this.executeCode(pyCode, 'python')
      console.log('Python result:', {
        success: pyResult.success,
        output: pyResult.output,
        error: pyResult.error,
        status: pyResult.status
      })
      
      console.log('\n✅ Fixed language ID testing completed!')
      
    } catch (error) {
      console.error('❌ Fixed language ID testing failed:', error)
    }
  }

  // Simple manual debug function that can be run from browser console
  static async manualDebug(): Promise<void> {
    console.log('🔧 Manual Debug Process Starting...')
    
    try {
      // Step 1: Test connection
      console.log('\n1️⃣ Testing connection...')
      const languages = await this.getSupportedLanguages()
      console.log(`✅ Found ${languages.length} languages`)
      
      // Step 2: Show all languages
      console.log('\n2️⃣ All available languages:')
      languages.forEach((lang, index) => {
        console.log(`${index + 1}. ID: ${lang.id}, Name: ${lang.name}, Extension: ${lang.extension}`)
      })
      
      // Step 3: Find JavaScript
      console.log('\n3️⃣ Looking for JavaScript...')
      const jsLang = languages.find(lang => 
        lang.name.toLowerCase().includes('javascript') ||
        lang.name.toLowerCase().includes('node') ||
        lang.name.toLowerCase().includes('js') ||
        lang.extension === 'js'
      )
      
      if (jsLang) {
        console.log(`✅ Found JavaScript: ID ${jsLang.id} - ${jsLang.name} (${jsLang.extension})`)
        
        // Test JavaScript
        console.log('\n4️⃣ Testing JavaScript execution...')
        const jsCode = 'console.log("Hello from JavaScript!");'
        const jsResult = await this.executeCode(jsCode, 'javascript')
        console.log('JavaScript test result:', jsResult)
      } else {
        console.log('❌ No JavaScript found')
      }
      
      // Step 4: Find Python
      console.log('\n5️⃣ Looking for Python...')
      const pyLang = languages.find(lang => 
        lang.name.toLowerCase().includes('python') ||
        lang.name.toLowerCase().includes('py') ||
        lang.extension === 'py'
      )
      
      if (pyLang) {
        console.log(`✅ Found Python: ID ${pyLang.id} - ${pyLang.name} (${pyLang.extension})`)
        
        // Test Python
        console.log('\n6️⃣ Testing Python execution...')
        const pyCode = 'print("Hello from Python!")'
        const pyResult = await this.executeCode(pyCode, 'python')
        console.log('Python test result:', pyResult)
      } else {
        console.log('❌ No Python found')
      }
      
      console.log('\n🎉 Manual debug completed!')
      
    } catch (error) {
      console.error('❌ Manual debug failed:', error)
    }
  }

  static async testFixedExtensions(): Promise<void> {
    try {
      console.log('🧪 Testing fixed language extensions...')
      
      // Clear the cache to force a fresh fetch
      this.languageCache = null
      
      // Get languages with extensions
      const languages = await this.getSupportedLanguages()
      
      // Find JavaScript and Python
      const jsLang = languages.find(lang => lang.id === 63)
      const pyLang = languages.find(lang => lang.id === 71)
      
      console.log('📋 Language extensions:')
      if (jsLang) {
        console.log(`✅ JavaScript: ID ${jsLang.id}, Extension: ${jsLang.extension}`)
      }
      if (pyLang) {
        console.log(`✅ Python: ID ${pyLang.id}, Extension: ${pyLang.extension}`)
      }
      
      // Test simple execution
      if (jsLang) {
        console.log('\n🔧 Testing JavaScript with fixed extension...')
        const jsResult = await this.executeCode('console.log("Test successful!");', 'javascript')
        console.log('JavaScript result:', jsResult)
      }
      
      if (pyLang) {
        console.log('\n🐍 Testing Python with fixed extension...')
        const pyResult = await this.executeCode('print("Test successful!")', 'python')
        console.log('Python result:', pyResult)
      }
      
      console.log('\n✅ Extension fix testing completed!')
      
    } catch (error) {
      console.error('❌ Extension fix testing failed:', error)
    }
  }

  static async testDifferentInstances(): Promise<void> {
    try {
      console.log('🧪 Testing different Judge0 instances...')
      
      // Test AWS instance
      console.log('\n1️⃣ Testing AWS EC2 instance...')
      this.setInstance('aws')
      const awsResult = await this.executeCode('console.log("Hello from AWS!");', 'javascript')
      console.log('AWS result:', awsResult)
      
      // Test RapidAPI instance
      console.log('\n2️⃣ Testing RapidAPI instance...')
      this.setInstance('rapidapi')
      const rapidapiResult = await this.executeCode('console.log("Hello from RapidAPI!");', 'javascript')
      console.log('RapidAPI result:', rapidapiResult)
      
      // Switch back to AWS
      this.setInstance('aws')
      console.log('\n✅ Instance testing completed!')
      
    } catch (error) {
      console.error('❌ Instance testing failed:', error)
      // Switch back to AWS on error
      this.setInstance('aws')
    }
  }

  static async testSimpleSubmission(): Promise<void> {
    try {
      console.log('🧪 Testing simple submission format...')
      
      // Test with minimal code
      const testCode = 'console.log("test");'
      const languageId = 63 // JavaScript
      
      const submission = {
        source_code: testCode,
        language_id: languageId
      }
      
      console.log('📤 Test submission:', submission)
      
      const response = await this.makeRequest('/submissions', {
        method: 'POST',
        body: JSON.stringify(submission),
      })
      
      console.log('✅ Test submission response:', response)
      
      if (response.token) {
        console.log('🎉 Submission successful! Token:', response.token)
        
        // Wait for result
        const result = await this.waitForResult(response.token)
        console.log('📊 Test result:', result)
      }
      
    } catch (error) {
      console.error('❌ Simple submission test failed:', error)
    }
  }

  static validateCode(code: string): { isValid: boolean; error?: string } {
    // Basic security validation
    const dangerousPatterns = [
      /eval\s*\(/i,
      /Function\s*\(/i,
      /setTimeout\s*\(/i,
      /setInterval\s*\(/i,
      /fetch\s*\(/i,
      /XMLHttpRequest/i,
      /WebSocket/i,
      /localStorage/i,
      /sessionStorage/i,
      /document\./i,
      /window\./i,
      /process\./i,
      /require\s*\(/i,
      /import\s+/i,
      /export\s+/i,
      /__dirname/i,
      /__filename/i,
      /global\./i,
      /Buffer\./i,
      /exec\s*\(/i,
      /system\s*\(/i,
      /subprocess/i,
      /os\./i,
      /subprocess\./i,
    ]

    for (const pattern of dangerousPatterns) {
      if (pattern.test(code)) {
        return {
          isValid: false,
          error: `Code contains forbidden pattern: ${pattern.source}`
        }
      }
    }

    // Check for infinite loops (basic check)
    const loopPatterns = [
      /while\s*\(\s*true\s*\)/i,
      /for\s*\(\s*;\s*;\s*\)/i,
      /for\s*\(\s*.*\s*;\s*.*\s*;\s*\)/i,
    ]

    for (const pattern of loopPatterns) {
      if (pattern.test(code)) {
        return {
          isValid: false,
          error: 'Code may contain infinite loops'
        }
      }
    }

    return { isValid: true }
  }

  static async findLanguageId(languageName: string): Promise<number | null> {
    try {
      const languages = await this.getSupportedLanguages()
      
      // Try exact match first
      const exactMatch = languages.find(lang => 
        lang.name.toLowerCase().includes(languageName.toLowerCase()) ||
        lang.extension.toLowerCase() === languageName.toLowerCase()
      )
      
      if (exactMatch) {
        console.log(`✅ Found language ID ${exactMatch.id} for ${languageName}: ${exactMatch.name}`)
        return exactMatch.id
      }
      
      // Try partial matches
      const partialMatches = languages.filter(lang => 
        lang.name.toLowerCase().includes(languageName.toLowerCase()) ||
        lang.extension.toLowerCase().includes(languageName.toLowerCase())
      )
      
      if (partialMatches.length > 0) {
        console.log(`🔍 Found ${partialMatches.length} potential matches for ${languageName}:`)
        partialMatches.forEach(match => {
          console.log(`  - ID ${match.id}: ${match.name} (${match.extension})`)
        })
        return partialMatches[0].id
      }
      
      console.log(`❌ No language found for ${languageName}`)
      return null
      
    } catch (error) {
      console.error(`❌ Error finding language ID for ${languageName}:`, error)
      return null
    }
  }
} 