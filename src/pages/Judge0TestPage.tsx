import React, { useState } from 'react'
import { Judge0Service } from '../lib/judge0'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { ModernTechLoader } from '../components/ui/ModernTechLoader'
import toast from 'react-hot-toast'

interface TestResult {
  language: string
  code: string
  input?: string
  expectedOutput?: string
  result: {
    success: boolean
    output: string
    error: string | null
    executionTime: number
    memory: number | null
    status: string
  }
}

export function Judge0TestPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<TestResult[]>([])
  const [supportedLanguages, setSupportedLanguages] = useState<Array<{ id: number; name: string; extension: string }>>([])

  const testCases = [
    {
      language: 'javascript',
      code: `function add(a, b) {
  return a + b;
}
console.log(add(5, 3));`,
      input: '5\n3',
      expectedOutput: '8'
    },
    {
      language: 'python',
      code: `def multiply(a, b):
    return a * b

print(multiply(4, 6))`,
      input: '4\n6',
      expectedOutput: '24'
    },
         {
       language: 'javascript',
       code: `console.log("Hello, World!");`,
       input: '',
       expectedOutput: 'Hello, World!'
     },
         {
       language: 'python',
       code: `def fibonacci(n):
     if n <= 1:
         return n
     return fibonacci(n-1) + fibonacci(n-2)

 print(fibonacci(10))`,
       input: '',
       expectedOutput: '55'
     },
     {
       language: 'javascript',
       code: `console.log(undefinedVariable);`,
       input: '',
       expectedOutput: ''
     }
  ]

  const runAllTests = async () => {
    setIsLoading(true)
    setResults([])

    try {
      const testResults: TestResult[] = []

      for (const testCase of testCases) {
        toast.loading(`Testing ${testCase.language}...`)
        
        const result = await Judge0Service.executeCode(
          testCase.code,
          testCase.language,
          testCase.input,
          testCase.expectedOutput
        )

        testResults.push({
          language: testCase.language,
          code: testCase.code,
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
          result
        })

        toast.dismiss()
      }

      setResults(testResults)
      toast.success('All tests completed!')
      
    } catch (error) {
      toast.error('Test failed!')
      console.error('Test error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getSupportedLanguages = async () => {
    try {
      const languages = await Judge0Service.getSupportedLanguages()
      setSupportedLanguages(languages)
      toast.success(`Found ${languages.length} supported languages`)
    } catch (error) {
      toast.error('Failed to get supported languages')
      console.error('Language fetch error:', error)
    }
  }

  const testCodeValidation = () => {
    const testCodes = [
      { name: 'Valid code', code: 'function add(a, b) { return a + b; }', expected: true },
      { name: 'Code with eval', code: 'eval("console.log(\'hello\')")', expected: false },
      { name: 'Code with fetch', code: 'fetch("https://api.example.com")', expected: false },
      { name: 'Code with infinite loop', code: 'while(true) { console.log("loop"); }', expected: false }
    ]

    testCodes.forEach(testCase => {
      const result = Judge0Service.validateCode(testCase.code)
      const passed = result.isValid === testCase.expected
      console.log(`${passed ? '✅' : '❌'} ${testCase.name}: ${result.isValid ? 'Valid' : 'Invalid'}${result.error ? ` (${result.error})` : ''}`)
    })

    toast.success('Code validation test completed! Check console for results.')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Judge0 API Integration Test</h1>
          <p className="text-gray-600">
            Test the remote code execution functionality using the Judge0 API
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Control Panel */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Test Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={runAllTests}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <ModernTechLoader className="h-4 w-4 mr-2" />
                      Running Tests...
                    </>
                  ) : (
                    'Run All Tests'
                  )}
                </Button>

                <Button
                  onClick={getSupportedLanguages}
                  variant="outline"
                  className="w-full"
                >
                  Get Supported Languages
                </Button>

                <Button
                  onClick={testCodeValidation}
                  variant="outline"
                  className="w-full"
                >
                  Test Code Validation
                </Button>

                <Button
                  onClick={() => Judge0Service.debugLanguages()}
                  variant="outline"
                  className="w-full"
                >
                  Debug Languages
                </Button>

                <Button
                  onClick={() => Judge0Service.testBasicConnection()}
                  variant="outline"
                  className="w-full"
                >
                  Test Basic Connection
                </Button>

                <Button
                  onClick={() => Judge0Service.debugAndFixLanguageIds()}
                  variant="outline"
                  className="w-full"
                >
                  Debug & Fix Language IDs
                </Button>

                <Button
                  onClick={() => Judge0Service.testFixedLanguageIds()}
                  variant="outline"
                  className="w-full"
                >
                  Test Fixed Language IDs
                </Button>

                <Button
                  onClick={() => Judge0Service.manualDebug()}
                  variant="outline"
                  className="w-full"
                >
                  Manual Debug
                </Button>

                <Button
                  onClick={() => Judge0Service.testFixedExtensions()}
                  variant="outline"
                  className="w-full"
                >
                  Test Fixed Extensions
                </Button>

                <Button
                  onClick={() => Judge0Service.testDifferentInstances()}
                  variant="outline"
                  className="w-full"
                >
                  Test Different Instances
                </Button>

                <Button
                  onClick={() => Judge0Service.testSimpleSubmission()}
                  variant="outline"
                  className="w-full"
                >
                  Test Simple Submission
                </Button>

                <div className="pt-4 border-t">
                  <h3 className="font-semibold mb-2">API Status</h3>
                                     <div className="text-sm text-gray-600">
                     <div>Host: RapidAPI</div>
                     <div>Key: Configured</div>
                     <div>Status: {isLoading ? 'Testing...' : 'Ready'}</div>
                   </div>
                </div>
              </CardContent>
            </Card>

            {supportedLanguages.length > 0 && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Supported Languages ({supportedLanguages.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {supportedLanguages.slice(0, 10).map((lang, idx) => (
                      <div key={idx} className="text-sm">
                        <Badge variant="outline" className="mr-2">
                          {lang.extension}
                        </Badge>
                        {lang.name}
                      </div>
                    ))}
                    {supportedLanguages.length > 10 && (
                      <div className="text-sm text-gray-500">
                        ... and {supportedLanguages.length - 10} more
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Results */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Test Results</CardTitle>
              </CardHeader>
              <CardContent>
                {results.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No test results yet. Click "Run All Tests" to start testing.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {results.map((result, idx) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-lg border ${
                          result.result.success
                            ? 'bg-green-50 border-green-200'
                            : 'bg-red-50 border-red-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge className={result.result.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                              {result.language.toUpperCase()}
                            </Badge>
                            <span className="font-medium">
                              Test {idx + 1}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            {result.result.executionTime}ms
                            {result.result.memory && ` • ${result.result.memory}KB`}
                          </div>
                        </div>

                        <div className="text-sm space-y-1">
                          <div><span className="text-gray-600">Status:</span> {result.result.status}</div>
                          {result.input && (
                            <div><span className="text-gray-600">Input:</span> {result.input}</div>
                          )}
                          {result.expectedOutput && (
                            <div><span className="text-gray-600">Expected:</span> {result.expectedOutput}</div>
                          )}
                          <div><span className="text-gray-600">Output:</span> {result.result.output || '(no output)'}</div>
                          {result.result.error && (
                            <div><span className="text-gray-600">Error:</span> {result.result.error}</div>
                          )}
                        </div>

                        <details className="mt-2">
                          <summary className="text-sm text-gray-600 cursor-pointer">View Code</summary>
                          <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                            {result.code}
                          </pre>
                        </details>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 