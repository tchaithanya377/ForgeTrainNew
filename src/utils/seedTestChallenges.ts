import { supabase } from '../lib/supabase'

export interface TestChallenge {
  id: string
  title: string
  description: string
  difficulty: 'easy' | 'medium' | 'hard'
  category_id?: string
  tags: string[]
  company_tags: string[]
  supported_languages: string[]
  starter_code: Record<string, any>
  solution_code: Record<string, any>
  test_cases: any[]
  constraints: string
  hints: string[]
  time_complexity: string
  space_complexity: string
  acceptance_rate: number
  total_submissions: number
  is_published: boolean
  created_by: string
  created_at: string
  updated_at: string
  step_by_step_solution?: string
}

const sampleChallenges: TestChallenge[] = [
  {
    id: 'challenge-1',
    title: 'Two Sum',
    description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
    difficulty: 'easy',
    tags: ['arrays', 'hash-table', 'two-pointers'],
    company_tags: ['Google', 'Amazon', 'Microsoft'],
    supported_languages: ['javascript', 'python', 'java', 'cpp'],
    starter_code: {
      javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(nums, target) {
    
};`,
      python: `class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        `,
      java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        
    }
}`,
      cpp: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        
    }
};`
    },
    solution_code: {
      javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(nums, target) {
    const map = new Map();
    
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        
        map.set(nums[i], i);
    }
    
    return [];
};`,
      python: `class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        seen = {}
        
        for i, num in enumerate(nums):
            complement = target - num
            
            if complement in seen:
                return [seen[complement], i]
            
            seen[num] = i
        
        return []`,
      java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            
            if (map.containsKey(complement)) {
                return new int[] {map.get(complement), i};
            }
            
            map.put(nums[i], i);
        }
        
        return new int[0];
    }
}`,
      cpp: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> map;
        
        for (int i = 0; i < nums.size(); i++) {
            int complement = target - nums[i];
            
            if (map.find(complement) != map.end()) {
                return {map[complement], i};
            }
            
            map[nums[i]] = i;
        }
        
        return {};
    }
};`
    },
    test_cases: [
      {
        input: { nums: [2, 7, 11, 15], target: 9 },
        expected_output: [0, 1]
      },
      {
        input: { nums: [3, 2, 4], target: 6 },
        expected_output: [1, 2]
      },
      {
        input: { nums: [3, 3], target: 6 },
        expected_output: [0, 1]
      }
    ],
    constraints: `2 <= nums.length <= 104
-109 <= nums[i] <= 109
-109 <= target <= 109
Only one valid answer exists.`,
    hints: [
      'Try using a hash table to store the numbers you have seen so far.',
      'For each number, check if its complement (target - current_number) exists in the hash table.',
      'If the complement exists, you have found your pair!'
    ],
    time_complexity: 'O(n)',
    space_complexity: 'O(n)',
    acceptance_rate: 85.2,
    total_submissions: 2500000,
    is_published: true,
    created_by: 'system',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    step_by_step_solution: `Step 1: Understand the Problem
We need to find two numbers in an array that add up to a target value. We need to return their indices.

Step 2: Choose the Right Data Structure
A hash table (or hash map) is perfect for this because:
- We can store numbers we've seen as keys
- We can quickly check if a number exists in O(1) time
- We can store the index as the value

Step 3: Algorithm
1. Create an empty hash table
2. Iterate through the array
3. For each number, calculate its complement (target - current_number)
4. Check if the complement exists in the hash table
5. If yes, return [complement_index, current_index]
6. If no, add the current number and its index to the hash table

Step 4: Time and Space Complexity
- Time: O(n) - we only need to traverse the array once
- Space: O(n) - in the worst case, we might store all numbers in the hash table`
  },
  {
    id: 'challenge-2',
    title: 'Valid Parentheses',
    description: `Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.`,
    difficulty: 'easy',
    tags: ['stack', 'string'],
    company_tags: ['Facebook', 'Google', 'Amazon'],
    supported_languages: ['javascript', 'python', 'java', 'cpp'],
    starter_code: {
      javascript: `/**
 * @param {string} s
 * @return {boolean}
 */
var isValid = function(s) {
    
};`,
      python: `class Solution:
    def isValid(self, s: str) -> bool:
        `,
      java: `class Solution {
    public boolean isValid(String s) {
        
    }
}`,
      cpp: `class Solution {
public:
    bool isValid(string s) {
        
    }
};`
    },
    solution_code: {
      javascript: `/**
 * @param {string} s
 * @return {boolean}
 */
var isValid = function(s) {
    const stack = [];
    const brackets = {
        ')': '(',
        '}': '{',
        ']': '['
    };
    
    for (let char of s) {
        if (char === '(' || char === '{' || char === '[') {
            stack.push(char);
        } else {
            if (stack.length === 0 || stack.pop() !== brackets[char]) {
                return false;
            }
        }
    }
    
    return stack.length === 0;
};`,
      python: `class Solution:
    def isValid(self, s: str) -> bool:
        stack = []
        brackets = {')': '(', '}': '{', ']': '['}
        
        for char in s:
            if char in '({[':
                stack.append(char)
            else:
                if not stack or stack.pop() != brackets[char]:
                    return False
        
        return len(stack) == 0`,
      java: `class Solution {
    public boolean isValid(String s) {
        Stack<Character> stack = new Stack<>();
        Map<Character, Character> brackets = new HashMap<>();
        brackets.put(')', '(');
        brackets.put('}', '{');
        brackets.put(']', '[');
        
        for (char c : s.toCharArray()) {
            if (c == '(' || c == '{' || c == '[') {
                stack.push(c);
            } else {
                if (stack.isEmpty() || stack.pop() != brackets.get(c)) {
                    return false;
                }
            }
        }
        
        return stack.isEmpty();
    }
}`,
      cpp: `class Solution {
public:
    bool isValid(string s) {
        stack<char> st;
        unordered_map<char, char> brackets = {
            {')', '('},
            {'}', '{'},
            {']', '['}
        };
        
        for (char c : s) {
            if (c == '(' || c == '{' || c == '[') {
                st.push(c);
            } else {
                if (st.empty() || st.top() != brackets[c]) {
                    return false;
                }
                st.pop();
            }
        }
        
        return st.empty();
    }
};`
    },
    test_cases: [
      {
        input: { s: "()" },
        expected_output: true
      },
      {
        input: { s: "()[]{}" },
        expected_output: true
      },
      {
        input: { s: "(]" },
        expected_output: false
      },
      {
        input: { s: "([)]" },
        expected_output: false
      }
    ],
    constraints: `1 <= s.length <= 104
s consists of parentheses only '()[]{}'`,
    hints: [
      'Use a stack to keep track of opening brackets.',
      'When you encounter a closing bracket, check if it matches the top of the stack.',
      'Make sure the stack is empty at the end.'
    ],
    time_complexity: 'O(n)',
    space_complexity: 'O(n)',
    acceptance_rate: 78.5,
    total_submissions: 1800000,
    is_published: true,
    created_by: 'system',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    step_by_step_solution: `Step 1: Understand the Problem
We need to check if a string of brackets is valid. The key rules are:
- Each opening bracket must have a matching closing bracket
- Brackets must be closed in the correct order
- The string must be properly nested

Step 2: Choose the Right Data Structure
A stack is perfect for this because:
- We need to process brackets in LIFO (Last In, First Out) order
- We can easily check if the most recent opening bracket matches the current closing bracket

Step 3: Algorithm
1. Create an empty stack
2. Create a mapping of closing brackets to their corresponding opening brackets
3. Iterate through each character in the string
4. If it's an opening bracket, push it onto the stack
5. If it's a closing bracket:
   - Check if the stack is empty (if yes, return false)
   - Check if the top of the stack matches the expected opening bracket
   - If not, return false
   - If yes, pop the stack
6. At the end, check if the stack is empty

Step 4: Time and Space Complexity
- Time: O(n) - we process each character once
- Space: O(n) - in the worst case, we might store all opening brackets in the stack`
  },
  {
    id: 'challenge-3',
    title: 'Maximum Subarray',
    description: `Given an integer array nums, find the subarray with the largest sum, and return its sum.

A subarray is a contiguous part of an array.`,
    difficulty: 'medium',
    tags: ['arrays', 'dynamic-programming', 'divide-and-conquer'],
    company_tags: ['Microsoft', 'Amazon', 'Apple'],
    supported_languages: ['javascript', 'python', 'java', 'cpp'],
    starter_code: {
      javascript: `/**
 * @param {number[]} nums
 * @return {number}
 */
var maxSubArray = function(nums) {
    
};`,
      python: `class Solution:
    def maxSubArray(self, nums: List[int]) -> int:
        `,
      java: `class Solution {
    public int maxSubArray(int[] nums) {
        
    }
}`,
      cpp: `class Solution {
public:
    int maxSubArray(vector<int>& nums) {
        
    }
};`
    },
    solution_code: {
      javascript: `/**
 * @param {number[]} nums
 * @return {number}
 */
var maxSubArray = function(nums) {
    let maxSum = nums[0];
    let currentSum = nums[0];
    
    for (let i = 1; i < nums.length; i++) {
        currentSum = Math.max(nums[i], currentSum + nums[i]);
        maxSum = Math.max(maxSum, currentSum);
    }
    
    return maxSum;
};`,
      python: `class Solution:
    def maxSubArray(self, nums: List[int]) -> int:
        max_sum = current_sum = nums[0]
        
        for num in nums[1:]:
            current_sum = max(num, current_sum + num)
            max_sum = max(max_sum, current_sum)
        
        return max_sum`,
      java: `class Solution {
    public int maxSubArray(int[] nums) {
        int maxSum = nums[0];
        int currentSum = nums[0];
        
        for (int i = 1; i < nums.length; i++) {
            currentSum = Math.max(nums[i], currentSum + nums[i]);
            maxSum = Math.max(maxSum, currentSum);
        }
        
        return maxSum;
    }
}`,
      cpp: `class Solution {
public:
    int maxSubArray(vector<int>& nums) {
        int maxSum = nums[0];
        int currentSum = nums[0];
        
        for (int i = 1; i < nums.size(); i++) {
            currentSum = max(nums[i], currentSum + nums[i]);
            maxSum = max(maxSum, currentSum);
        }
        
        return maxSum;
    }
};`
    },
    test_cases: [
      {
        input: { nums: [-2, 1, -3, 4, -1, 2, 1, -5, 4] },
        expected_output: 6
      },
      {
        input: { nums: [1] },
        expected_output: 1
      },
      {
        input: { nums: [5, 4, -1, 7, 8] },
        expected_output: 23
      }
    ],
    constraints: `1 <= nums.length <= 105
-104 <= nums[i] <= 104`,
    hints: [
      'Think about what happens when you add a negative number to a positive sum.',
      'At each step, you have a choice: start a new subarray or extend the current one.',
      'Keep track of both the current sum and the maximum sum seen so far.'
    ],
    time_complexity: 'O(n)',
    space_complexity: 'O(1)',
    acceptance_rate: 72.1,
    total_submissions: 1500000,
    is_published: true,
    created_by: 'system',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    step_by_step_solution: `Step 1: Understand the Problem
We need to find the contiguous subarray with the maximum sum. This is a classic dynamic programming problem.

Step 2: Key Insight
At each position, we have two choices:
1. Start a new subarray from the current element
2. Extend the existing subarray by adding the current element

Step 3: Algorithm (Kadane's Algorithm)
1. Initialize maxSum and currentSum to the first element
2. For each element starting from the second:
   - Update currentSum = max(current_element, currentSum + current_element)
   - Update maxSum = max(maxSum, currentSum)
3. Return maxSum

Step 4: Why This Works
- If currentSum becomes negative, it's better to start fresh with the current element
- If currentSum is positive, we extend it with the current element
- We always keep track of the maximum sum we've seen

Step 5: Time and Space Complexity
- Time: O(n) - we process each element once
- Space: O(1) - we only use a constant amount of extra space`
  }
]

export async function seedTestChallenges() {
  try {
    console.log('Seeding test challenges...')
    
    // Check if challenges already exist
    const { data: existingChallenges } = await supabase
      .from('code_challenges')
      .select('id')
      .limit(1)
    
    if (existingChallenges && existingChallenges.length > 0) {
      console.log('Challenges already exist, skipping seed...')
      return
    }
    
    // Insert sample challenges
    const { data, error } = await supabase
      .from('code_challenges')
      .insert(sampleChallenges)
    
    if (error) {
      console.error('Error seeding challenges:', error)
      throw error
    }
    
    console.log('Successfully seeded test challenges!')
    return data
  } catch (error) {
    console.error('Failed to seed test challenges:', error)
    throw error
  }
}

export async function clearTestChallenges() {
  try {
    console.log('Clearing test challenges...')
    
    const { error } = await supabase
      .from('code_challenges')
      .delete()
      .in('id', sampleChallenges.map(c => c.id))
    
    if (error) {
      console.error('Error clearing challenges:', error)
      throw error
    }
    
    console.log('Successfully cleared test challenges!')
  } catch (error) {
    console.error('Failed to clear test challenges:', error)
    throw error
  }
} 