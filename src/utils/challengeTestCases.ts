import { Judge0Service } from '../lib/judge0'

interface SupabaseTestCase {
  input: string
  is_hidden: boolean
  explanation: string
  expected_output: string
}

interface Judge0TestCase {
  input: string
  expected_output: string
  explanation: string
}

// Convert Supabase test cases to Judge0 format
export function convertSupabaseTestCases(
  testCases: SupabaseTestCase[],
  language: string
): Judge0TestCase[] {
  return testCases.map(testCase => {
    // Clean up expected output (remove trailing quotes, fix formatting)
    let expectedOutput = testCase.expected_output.trim()
    
    // Fix common formatting issues
    if (expectedOutput.endsWith('"')) {
      expectedOutput = expectedOutput.slice(0, -1)
    }
    if (expectedOutput.startsWith('"')) {
      expectedOutput = expectedOutput.slice(1)
    }
    
    // For Python, ensure proper formatting
    if (language.toLowerCase() === 'python') {
      // If it's a list output, ensure it's properly formatted
      if (expectedOutput.startsWith('[') && expectedOutput.endsWith(']')) {
        // Keep as is - it's already a valid Python list format
        // But ensure it matches Python's print output format
        expectedOutput = expectedOutput.replace(/\s+/g, ' ') // Normalize spaces
      } else {
        // Wrap in quotes if it's a string
        expectedOutput = `"${expectedOutput}"`
      }
    }
    
    return {
      input: testCase.input || '',
      expected_output: expectedOutput,
      explanation: testCase.explanation
    }
  })
}

// Create Judge0-compatible code from starter code
export function createJudge0CompatibleCode(
  starterCode: Record<string, string>,
  language: string,
  challengeTitle: string
): string {
  const code = starterCode[language] || starterCode[Object.keys(starterCode)[0]] || ''
  
  // Extract function names from the code
  const functionNames = extractFunctionNames(code, language)
  
  switch (language.toLowerCase()) {
    case 'python':
      return `${code}

# Test runner for Judge0
if __name__ == "__main__":
    try:
        ${functionNames.map(name => `
        if '${name}' in globals() and callable(${name}):
            result = ${name}()
            # The function should print the result as per the problem statement
            # If it doesn't print, we'll print the return value
            if result is not None:
                print(result)`).join('')}
        
        # If no function found, try direct execution
        if not any(name in globals() and callable(globals()[name]) for name in ${JSON.stringify(functionNames)}):
            exec(code)
    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        import sys
        sys.exit(1)`

    case 'javascript':
    case 'js':
      return `${code}

// Test runner for Judge0
try {
    ${functionNames.map(name => `
    if (typeof ${name} === 'function') {
        const result = ${name}();
        // The function should console.log the result as per the problem statement
        // If it doesn't log, we'll log the return value
        if (result !== undefined) {
            console.log(JSON.stringify(result));
        }
        return;`).join('')}
    
    // If no function found, try direct execution
    eval(code);
} catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
}`

    case 'java':
      return `${code}

// Test runner for Judge0
public class Main {
    public static void main(String[] args) {
        try {
            ${functionNames.map(name => `
            try {
                Object result = ${name}();
                if (result != null) {
                    System.out.println(result);
                }
                return;`).join('')}
            
            // If no function found, try direct execution
            System.out.println("No main function found");
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
            System.exit(1);
        }
    }
}`

    default:
      return code
  }
}

// Extract function names from code
function extractFunctionNames(code: string, language: string): string[] {
  const functionNames: string[] = []
  let match: RegExpExecArray | null
  
  switch (language.toLowerCase()) {
    case 'python':
      // Match Python function definitions
      const pythonRegex = /def\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g
      while ((match = pythonRegex.exec(code)) !== null) {
        functionNames.push(match[1])
      }
      break
      
    case 'javascript':
    case 'js':
      // Match JavaScript function definitions
      const jsRegex = /(?:function\s+([a-zA-Z_][a-zA-Z0-9_]*)|const\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*\(|let\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*\(|var\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*\()/g
      while ((match = jsRegex.exec(code)) !== null) {
        const name = match[1] || match[2] || match[3] || match[4]
        if (name) functionNames.push(name)
      }
      break
      
    case 'java':
      // Match Java method definitions
      const javaRegex = /(?:public\s+)?(?:static\s+)?(?:final\s+)?(?:[a-zA-Z_][a-zA-Z0-9_]*\s+)?([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g
      while ((match = javaRegex.exec(code)) !== null) {
        functionNames.push(match[1])
      }
      break
  }
  
  // If no functions found, return common function names
  if (functionNames.length === 0) {
    return ['main', 'solution', 'solve']
  }
  
  return functionNames
}

// Execute challenge test cases using Judge0
export async function executeChallengeTests(
  starterCode: Record<string, string>,
  testCases: SupabaseTestCase[],
  language: string,
  challengeTitle: string,
  userCode?: string // Add user code parameter
): Promise<{
  passed: number
  total: number
  results: Array<{
    testCase: Judge0TestCase
    result: {
      success: boolean
      output: string
      error: string | null
      executionTime: number
      memory: number | null
      status: string
    }
  }>
}> {
  const judge0TestCases = convertSupabaseTestCases(testCases, language)
  
  // Use user code if provided, otherwise use starter code
  const codeToExecute = userCode || starterCode[language] || starterCode[Object.keys(starterCode)[0]] || ''
  const compatibleCode = createJudge0CompatibleCode(
    { [language]: codeToExecute }, // Pass as object with language key
    language,
    challengeTitle
  )
  
  const results = []
  let passed = 0
  
  for (const testCase of judge0TestCases) {
    try {
      const result = await Judge0Service.executeCode(
        compatibleCode,
        language,
        testCase.input,
        testCase.expected_output
      )
      
      // Custom output comparison for better accuracy
      let success = result.success
      if (result.success && language.toLowerCase() === 'python') {
        // For Python, do custom comparison to handle list formatting
        const actualOutput = result.output.trim()
        const expectedOutput = testCase.expected_output.trim()
        
        // Try to parse as Python lists and compare
        try {
          // Remove any extra text and extract just the list
          const actualListMatch = actualOutput.match(/\[.*\]/)
          const expectedListMatch = expectedOutput.match(/\[.*\]/)
          
          if (actualListMatch && expectedListMatch) {
            const actualList = eval(actualListMatch[0]) // Safe since it's from our controlled output
            const expectedList = eval(expectedListMatch[0])
            success = JSON.stringify(actualList) === JSON.stringify(expectedList)
          } else {
            // Fallback to string comparison
            success = actualOutput === expectedOutput
          }
        } catch {
          // If parsing fails, fallback to string comparison
          success = actualOutput === expectedOutput
        }
      }
      
      if (success) {
        passed++
      }
      
      results.push({
        testCase,
        result: {
          ...result,
          success
        }
      })
    } catch (error) {
      results.push({
        testCase,
        result: {
          success: false,
          output: '',
          error: error instanceof Error ? error.message : 'Unknown error',
          executionTime: 0,
          memory: null,
          status: 'Error'
        }
      })
    }
  }
  
  return {
    passed,
    total: judge0TestCases.length,
    results
  }
} 