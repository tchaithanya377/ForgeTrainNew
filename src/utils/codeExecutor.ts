// Function name mappings for different challenges
const functionMappings: Record<string, string[]> = {
  'two-sum': ['twoSum', 'two_sum', 'solution'],
  'valid-parentheses': ['isValid', 'is_valid', 'validParentheses', 'solution'],
  'maximum-subarray': ['maxSubArray', 'max_sub_array', 'solution'],
  'reverse-string': ['reverseString', 'reverse_string', 'solution'],
  'palindrome-number': ['isPalindrome', 'is_palindrome', 'solution'],
  'roman-to-integer': ['romanToInt', 'roman_to_int', 'solution'],
  'longest-common-prefix': ['longestCommonPrefix', 'longest_common_prefix', 'solution'],
  'merge-two-sorted-lists': ['mergeTwoLists', 'merge_two_lists', 'solution'],
  'remove-duplicates-from-sorted-array': ['removeDuplicates', 'remove_duplicates', 'solution'],
  'remove-element': ['removeElement', 'remove_element', 'solution'],
}

// Get function names based on challenge title
function getFunctionNames(challengeTitle: string): string[] {
  const normalizedTitle = challengeTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')
  
  for (const [key, functions] of Object.entries(functionMappings)) {
    if (normalizedTitle.includes(key)) {
      return functions
    }
  }
  
  // Default function names
  return ['solution', 'main', 'solve']
}

// Create a safe execution environment
function createSafeEnvironment(code: string, language: string): Function {
  // Create a sandboxed environment
  const sandbox = {
    console: {
      log: () => {},
      error: () => {},
      warn: () => {},
      info: () => {}
    },
    setTimeout: () => {},
    setInterval: () => {},
    clearTimeout: () => {},
    clearInterval: () => {},
    fetch: () => {},
    XMLHttpRequest: () => {},
    WebSocket: () => {},
    localStorage: {},
    sessionStorage: {},
    document: {},
    window: {},
    global: {},
    process: {},
    Buffer: {},
    require: () => {},
    module: {},
    exports: {},
    __dirname: '',
    __filename: '',
  }

  // Add language-specific globals
  if (language === 'javascript') {
    Object.assign(sandbox, {
      Array, Object, String, Number, Boolean, Date, Math, JSON, RegExp,
      Map, Set, WeakMap, WeakSet, Promise, Symbol, Proxy, Reflect,
      parseInt, parseFloat, isNaN, isFinite, encodeURI, decodeURI,
      encodeURIComponent, decodeURIComponent, escape, unescape,
      eval: () => { throw new Error('eval is not allowed') },
      Function: () => { throw new Error('Function constructor is not allowed') }
    })
  }

  return new Function('sandbox', `
    with (sandbox) {
      ${code}
    }
  `)
}

interface TestCase {
  input: any
  expected_output: any
}

interface ExecutionResult {
  passed: boolean
  input: any
  expected: any
  actual: any
  executionTime: number
  error?: string
}

export function executeCode(
  code: string,
  language: string,
  testCase: TestCase,
  challengeTitle: string
): ExecutionResult {
  const startTime = performance.now()
  
  try {
    const functionNames = getFunctionNames(challengeTitle)
    const safeEval = createSafeEnvironment(code, language)
    
    // Create sandbox
    const sandbox = {
      console: {
        log: () => {},
        error: () => {},
        warn: () => {},
        info: () => {}
      },
      Array, Object, String, Number, Boolean, Date, Math, JSON, RegExp,
      Map, Set, WeakMap, WeakSet, Promise, Symbol, Proxy, Reflect,
      parseInt, parseFloat, isNaN, isFinite, encodeURI, decodeURI,
      encodeURIComponent, decodeURIComponent, escape, unescape,
    }

    // Execute the code in sandbox
    safeEval(sandbox)
    
    // Try to find and execute the main function
    let actual: any = undefined
    let error: string | undefined = undefined
    
    for (const funcName of functionNames) {
      try {
        if (typeof sandbox[funcName] === 'function') {
          // Handle different input formats
          if (testCase.input.nums !== undefined && testCase.input.target !== undefined) {
            // Two Sum format
            actual = sandbox[funcName](testCase.input.nums, testCase.input.target)
          } else if (testCase.input.s !== undefined) {
            // String format (like valid parentheses)
            actual = sandbox[funcName](testCase.input.s)
          } else if (testCase.input.nums !== undefined) {
            // Array format (like max subarray)
            actual = sandbox[funcName](testCase.input.nums)
          } else {
            // Generic format
            actual = sandbox[funcName](testCase.input)
          }
          break
        }
      } catch (e) {
        error = e instanceof Error ? e.message : 'Unknown error'
        continue
      }
    }
    
    if (actual === undefined) {
      error = `No valid function found. Expected one of: ${functionNames.join(', ')}`
    }
    
    const executionTime = performance.now() - startTime
    
    return {
      passed: error === undefined && JSON.stringify(actual) === JSON.stringify(testCase.expected_output),
      input: testCase.input,
      expected: testCase.expected_output,
      actual: error ? `Error: ${error}` : actual,
      executionTime,
      error
    }
    
  } catch (error) {
    const executionTime = performance.now() - startTime
    
    return {
      passed: false,
      input: testCase.input,
      expected: testCase.expected_output,
      actual: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      executionTime,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

export function executeAllTests(
  code: string,
  language: string,
  testCases: TestCase[],
  challengeTitle: string
): ExecutionResult[] {
  return testCases.map(testCase => 
    executeCode(code, language, testCase, challengeTitle)
  )
}

export function validateCode(code: string): { isValid: boolean; error?: string } {
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