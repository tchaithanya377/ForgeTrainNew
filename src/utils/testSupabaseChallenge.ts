import { executeChallengeTests } from './challengeTestCases'

// Test the specific Supabase challenge
export async function testSupabaseChallenge() {
  console.log('🧪 Testing Supabase Challenge: Insert Element at Beginning of List')
  
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

  try {
    // Test with the original starter code (should fail)
    console.log('\n1. Testing with original starter code (should fail)...')
    const originalResults = await executeChallengeTests(
      challengeData.starter_code,
      challengeData.test_cases,
      'python',
      challengeData.title
    )
    
    console.log('Original results:', originalResults)
    console.log(`Passed: ${originalResults.passed}/${originalResults.total}`)
    
    // Test with correct solution code
    console.log('\n2. Testing with correct solution code (should pass)...')
    const solutionCode = `def insert_at_beginning_of_list():
    my_list = [1, 2, 5, 6] # Simulating the state after previous operations
    my_list.insert(0, 0) # Insert value 0 at index 0
    print(my_list)
    return my_list # Returning for testing purposes, problem asks to print`
    
    const solutionResults = await executeChallengeTests(
      challengeData.starter_code,
      challengeData.test_cases,
      'python',
      challengeData.title,
      solutionCode // Pass user code
    )
    
    console.log('Solution results:', solutionResults)
    console.log(`Passed: ${solutionResults.passed}/${solutionResults.total}`)
    
    // Test with user-submitted code
    console.log('\n3. Testing with user-submitted code...')
    const userCode = `def insert_at_beginning_of_list():
    my_list = [1, 2, 5, 6]
    my_list.insert(0, 0)
    print(my_list)
    return my_list`
    
    const userResults = await executeChallengeTests(
      challengeData.starter_code,
      challengeData.test_cases,
      'python',
      challengeData.title,
      userCode // Pass user code
    )
    
    console.log('User code results:', userResults)
    console.log(`Passed: ${userResults.passed}/${userResults.total}`)
    
    // Test with incomplete code (should fail)
    console.log('\n4. Testing with incomplete code (should fail)...')
    const incompleteCode = `def insert_at_beginning_of_list():
    my_list = [1, 2, 5, 6]
    # Missing implementation
    pass`
    
    const incompleteResults = await executeChallengeTests(
      challengeData.starter_code,
      challengeData.test_cases,
      'python',
      challengeData.title,
      incompleteCode
    )
    
    console.log('Incomplete code results:', incompleteResults)
    console.log(`Passed: ${incompleteResults.passed}/${incompleteResults.total}`)
    
    console.log('\n✅ Supabase challenge test completed!')
    
  } catch (error) {
    console.error('❌ Supabase challenge test failed:', error)
  }
}

// Test different variations of the solution
export async function testSolutionVariations() {
  console.log('\n🧪 Testing different solution variations...')
  
  const testCases = [
    {
      input: 'None (my_list is pre-defined)',
      is_hidden: false,
      explanation: 'The list is initially [1, 2, 5, 6]. The number 0 is inserted at index 0.',
      expected_output: '[0, 1, 2, 5, 6]'
    }
  ]

  const variations = [
    {
      name: 'Using insert() method',
      code: `def insert_at_beginning_of_list():
    my_list = [1, 2, 5, 6]
    my_list.insert(0, 0)
    print(my_list)
    return my_list`
    },
    {
      name: 'Using list concatenation',
      code: `def insert_at_beginning_of_list():
    my_list = [1, 2, 5, 6]
    my_list = [0] + my_list
    print(my_list)
    return my_list`
    },
    {
      name: 'Using list slicing',
      code: `def insert_at_beginning_of_list():
    my_list = [1, 2, 5, 6]
    my_list[:0] = [0]
    print(my_list)
    return my_list`
    },
    {
      name: 'Using extend() method',
      code: `def insert_at_beginning_of_list():
    my_list = [1, 2, 5, 6]
    new_list = [0]
    new_list.extend(my_list)
    my_list = new_list
    print(my_list)
    return my_list`
    },
    {
      name: 'Using append() and reverse()',
      code: `def insert_at_beginning_of_list():
    my_list = [1, 2, 5, 6]
    my_list.append(0)
    my_list.reverse()
    print(my_list)
    return my_list`
    },
    {
      name: 'Using collections.deque',
      code: `def insert_at_beginning_of_list():
    from collections import deque
    my_list = [1, 2, 5, 6]
    d = deque(my_list)
    d.appendleft(0)
    my_list = list(d)
    print(my_list)
    return my_list`
    }
  ]

  for (const variation of variations) {
    console.log(`\n📝 Testing: ${variation.name}`)
    
    try {
      const results = await executeChallengeTests(
        { 'Python': 'def insert_at_beginning_of_list():\n    pass' }, // Minimal starter code
        testCases,
        'python',
        'Insert Element at Beginning of List',
        variation.code // Pass user code
      )
      
      console.log(`✅ Result: ${results.passed}/${results.total} passed`)
      if (results.results.length > 0) {
        const result = results.results[0]
        console.log(`📤 Output: ${result.result.output}`)
        console.log(`⏱️  Time: ${result.result.executionTime}ms`)
        console.log(`💾 Memory: ${result.result.memory}KB`)
        if (result.result.error) {
          console.log(`❌ Error: ${result.result.error}`)
        }
      }
    } catch (error) {
      console.error(`❌ Error with ${variation.name}:`, error)
    }
  }
}

// Test edge cases and error scenarios
export async function testEdgeCases() {
  console.log('\n🧪 Testing edge cases and error scenarios...')
  
  const testCases = [
    {
      input: 'None (my_list is pre-defined)',
      is_hidden: false,
      explanation: 'The list is initially [1, 2, 5, 6]. The number 0 is inserted at index 0.',
      expected_output: '[0, 1, 2, 5, 6]'
    }
  ]

  const edgeCases = [
    {
      name: 'Empty function (should fail)',
      code: `def insert_at_beginning_of_list():
    pass`
    },
    {
      name: 'Wrong function name (should fail)',
      code: `def wrong_function_name():
    my_list = [1, 2, 5, 6]
    my_list.insert(0, 0)
    print(my_list)
    return my_list`
    },
    {
      name: 'Syntax error (should fail)',
      code: `def insert_at_beginning_of_list():
    my_list = [1, 2, 5, 6
    my_list.insert(0, 0)
    print(my_list)
    return my_list`
    },
    {
      name: 'Wrong output format (should fail)',
      code: `def insert_at_beginning_of_list():
    my_list = [1, 2, 5, 6]
    my_list.insert(0, 0)
    print("Result:", my_list)
    return my_list`
    },
    {
      name: 'No print statement (should fail)',
      code: `def insert_at_beginning_of_list():
    my_list = [1, 2, 5, 6]
    my_list.insert(0, 0)
    return my_list`
    }
  ]

  for (const edgeCase of edgeCases) {
    console.log(`\n⚠️  Testing: ${edgeCase.name}`)
    
    try {
      const results = await executeChallengeTests(
        { 'Python': 'def insert_at_beginning_of_list():\n    pass' },
        testCases,
        'python',
        'Insert Element at Beginning of List',
        edgeCase.code
      )
      
      console.log(`Result: ${results.passed}/${results.total} passed`)
      if (results.results.length > 0) {
        const result = results.results[0]
        console.log(`Output: ${result.result.output}`)
        if (result.result.error) {
          console.log(`Error: ${result.result.error}`)
        }
      }
    } catch (error) {
      console.error(`Error with ${edgeCase.name}:`, error)
    }
  }
}

// Run tests if this file is executed directly
if (typeof window !== 'undefined') {
  // Browser environment - expose test functions
  ;(window as any).testSupabaseChallenge = testSupabaseChallenge
  ;(window as any).testSolutionVariations = testSolutionVariations
  ;(window as any).testEdgeCases = testEdgeCases
} 