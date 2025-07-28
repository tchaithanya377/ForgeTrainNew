import { executeChallengeTests } from './challengeTestCases'

// Test the improved code solving functionality
export async function testImprovedCodeSolving() {
  console.log('🧪 Testing Improved Code Solving Functionality')
  
  const challengeData = {
    title: 'Insert Element at Beginning of List',
    starter_code: {
      'Python': `def insert_at_beginning_of_list():
    my_list = [1, 2, 5, 6] # Assuming my_list after previous operations
    # Your code here
    # print(my_list)
    pass`
    },
    test_cases: [
      {
        input: 'None (my_list is pre-defined)',
        is_hidden: false,
        explanation: 'The list is initially [1, 2, 5, 6]. The number 0 is inserted at index 0 (the beginning of the list), shifting all existing elements to the right. The resulting list is [0, 1, 2, 5, 6]. This updated list should then be printed.',
        expected_output: '[0, 1, 2, 5, 6]'
      }
    ]
  }

  const testScenarios = [
    {
      name: 'Correct Solution - Using insert()',
      code: `def insert_at_beginning_of_list():
    my_list = [1, 2, 5, 6]
    my_list.insert(0, 0)
    print(my_list)
    return my_list`,
      shouldPass: true
    },
    {
      name: 'Correct Solution - Using list concatenation',
      code: `def insert_at_beginning_of_list():
    my_list = [1, 2, 5, 6]
    my_list = [0] + my_list
    print(my_list)
    return my_list`,
      shouldPass: true
    },
    {
      name: 'Correct Solution - Using list slicing',
      code: `def insert_at_beginning_of_list():
    my_list = [1, 2, 5, 6]
    my_list[:0] = [0]
    print(my_list)
    return my_list`,
      shouldPass: true
    },
    {
      name: 'Incorrect Solution - Wrong element',
      code: `def insert_at_beginning_of_list():
    my_list = [1, 2, 5, 6]
    my_list.insert(0, 1)
    print(my_list)
    return my_list`,
      shouldPass: false
    },
    {
      name: 'Incorrect Solution - No print statement',
      code: `def insert_at_beginning_of_list():
    my_list = [1, 2, 5, 6]
    my_list.insert(0, 0)
    return my_list`,
      shouldPass: false
    },
    {
      name: 'Incorrect Solution - Empty function',
      code: `def insert_at_beginning_of_list():
    pass`,
      shouldPass: false
    },
    {
      name: 'Incorrect Solution - Wrong function name',
      code: `def wrong_function():
    my_list = [1, 2, 5, 6]
    my_list.insert(0, 0)
    print(my_list)
    return my_list`,
      shouldPass: false
    }
  ]

  let totalTests = 0
  let passedTests = 0

  for (const scenario of testScenarios) {
    console.log(`\n📝 Testing: ${scenario.name}`)
    totalTests++
    
    try {
      const results = await executeChallengeTests(
        challengeData.starter_code,
        challengeData.test_cases,
        'python',
        challengeData.title,
        scenario.code
      )
      
      const testPassed = results.passed === results.total
      const expectedResult = scenario.shouldPass ? 'PASS' : 'FAIL'
      const actualResult = testPassed ? 'PASS' : 'FAIL'
      const status = testPassed === scenario.shouldPass ? '✅' : '❌'
      
      console.log(`${status} Expected: ${expectedResult}, Actual: ${actualResult}`)
      console.log(`📊 Results: ${results.passed}/${results.total} passed`)
      
      if (results.results.length > 0) {
        const result = results.results[0]
        console.log(`📤 Output: ${result.result.output}`)
        console.log(`⏱️  Time: ${result.result.executionTime}ms`)
        if (result.result.error) {
          console.log(`❌ Error: ${result.result.error}`)
        }
      }
      
      if (testPassed === scenario.shouldPass) {
        passedTests++
      }
    } catch (error) {
      console.error(`❌ Error testing ${scenario.name}:`, error)
    }
  }

  console.log(`\n📊 Overall Results: ${passedTests}/${totalTests} test scenarios passed`)
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! The improved code solving is working correctly.')
  } else {
    console.log('⚠️  Some tests failed. There may be issues with the implementation.')
  }
}

// Test function name extraction
export function testFunctionNameExtraction() {
  console.log('\n🧪 Testing Function Name Extraction')
  
  const testCases = [
    {
      name: 'Python function',
      code: `def insert_at_beginning_of_list():
    my_list = [1, 2, 5, 6]
    my_list.insert(0, 0)
    print(my_list)`,
      expected: ['insert_at_beginning_of_list']
    },
    {
      name: 'JavaScript function',
      code: `function add(a, b) {
    return a + b;
}`,
      expected: ['add']
    },
    {
      name: 'JavaScript arrow function',
      code: `const multiply = (a, b) => {
    return a * b;
}`,
      expected: ['multiply']
    },
    {
      name: 'Multiple functions',
      code: `def helper():
    pass

def main():
    helper()
    print("Hello")`,
      expected: ['helper', 'main']
    }
  ]

  // Note: This would require exposing the extractFunctionNames function
  // For now, we'll just log the test cases
  console.log('Function name extraction test cases prepared')
  testCases.forEach(testCase => {
    console.log(`- ${testCase.name}: Expected ${testCase.expected.join(', ')}`)
  })
}

// Run comprehensive tests
export async function runAllTests() {
  console.log('🚀 Running All Code Solving Tests')
  console.log('=' .repeat(50))
  
  await testImprovedCodeSolving()
  testFunctionNameExtraction()
  
  console.log('\n✅ All tests completed!')
}

// Expose functions for browser testing
if (typeof window !== 'undefined') {
  ;(window as any).testImprovedCodeSolving = testImprovedCodeSolving
  ;(window as any).testFunctionNameExtraction = testFunctionNameExtraction
  ;(window as any).runAllTests = runAllTests
} 