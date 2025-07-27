import { supabase } from '../lib/supabase'

export interface TestTextTutorial {
  id: string
  title: string
  subtitle: string
  learning_track: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  time_minutes: number
  summary: string
  category: string
  tags: string[]
  programming_languages: string[]
  learning_goals: string
  what_students_learn: string
  prerequisites: string
  introduction: string
  main_content: string
  conclusion: string
  fun_facts: string
  memes_humor: string
  learning_sections: any[]
  is_published: boolean
  created_by: string
  created_at: string
  updated_at: string
  category_id?: string
}

const sampleTextTutorials: TestTextTutorial[] = [
  {
    id: 'tutorial-1',
    title: 'Introduction to JavaScript Fundamentals',
    subtitle: 'Master the basics of JavaScript programming',
    learning_track: 'Web Development',
    difficulty: 'beginner',
    time_minutes: 45,
    summary: 'Learn the fundamental concepts of JavaScript including variables, functions, and control structures. This tutorial provides hands-on examples and practical exercises to build a solid foundation in JavaScript programming.',
    category: 'Programming',
    tags: ['javascript', 'basics', 'web-development', 'programming'],
    programming_languages: ['javascript'],
    learning_goals: 'Understand JavaScript syntax, variables, functions, and basic control structures',
    what_students_learn: 'Students will learn how to write basic JavaScript code, understand variables and data types, create functions, and use control structures like loops and conditionals.',
    prerequisites: 'Basic computer literacy and familiarity with HTML (recommended but not required)',
    introduction: `JavaScript is one of the most popular programming languages in the world, powering interactive websites and web applications. In this tutorial, we'll explore the fundamental concepts that every JavaScript developer needs to know.

Whether you're a complete beginner or looking to refresh your knowledge, this guide will provide you with a solid foundation in JavaScript programming. We'll start with the basics and gradually build up to more complex concepts.`,
    main_content: `## Variables and Data Types

JavaScript is a dynamically typed language, which means you don't need to declare the type of a variable when you create it. Here are the basic data types:

### Numbers
\`\`\`javascript
let age = 25;
let price = 19.99;
let temperature = -5;
\`\`\`

### Strings
\`\`\`javascript
let name = "John Doe";
let message = 'Hello, World!';
let template = \`Hello, \${name}!\`;
\`\`\`

### Booleans
\`\`\`javascript
let isActive = true;
let isComplete = false;
\`\`\`

### Arrays
\`\`\`javascript
let colors = ['red', 'green', 'blue'];
let numbers = [1, 2, 3, 4, 5];
let mixed = [1, 'hello', true, null];
\`\`\`

### Objects
\`\`\`javascript
let person = {
  name: 'John',
  age: 30,
  city: 'New York'
};
\`\`\`

## Functions

Functions are reusable blocks of code that perform specific tasks. Here's how to create and use them:

### Basic Function Declaration
\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}

// Call the function
console.log(greet('Alice')); // Output: Hello, Alice!
\`\`\`

### Arrow Functions (ES6)
\`\`\`javascript
const add = (a, b) => {
  return a + b;
};

// Shorter syntax for simple functions
const multiply = (a, b) => a * b;
\`\`\`

## Control Structures

### If Statements
\`\`\`javascript
let age = 18;

if (age >= 18) {
  console.log('You are an adult');
} else if (age >= 13) {
  console.log('You are a teenager');
} else {
  console.log('You are a child');
}
\`\`\`

### Loops

#### For Loop
\`\`\`javascript
for (let i = 0; i < 5; i++) {
  console.log(\`Count: \${i}\`);
}
\`\`\`

#### While Loop
\`\`\`javascript
let count = 0;
while (count < 3) {
  console.log(\`Count: \${count}\`);
  count++;
}
\`\`\`

#### For...of Loop (for arrays)
\`\`\`javascript
const fruits = ['apple', 'banana', 'orange'];
for (const fruit of fruits) {
  console.log(fruit);
}
\`\`\`

## Practical Example

Let's create a simple calculator function that demonstrates these concepts:

\`\`\`javascript
function calculator(operation, a, b) {
  switch (operation) {
    case 'add':
      return a + b;
    case 'subtract':
      return a - b;
    case 'multiply':
      return a * b;
    case 'divide':
      if (b === 0) {
        return 'Error: Division by zero';
      }
      return a / b;
    default:
      return 'Error: Invalid operation';
  }
}

// Test the calculator
console.log(calculator('add', 5, 3));      // 8
console.log(calculator('multiply', 4, 7)); // 28
console.log(calculator('divide', 10, 2));  // 5
\`\`\``,
    conclusion: `Congratulations! You've completed the Introduction to JavaScript Fundamentals tutorial. 

## What You've Learned

- **Variables and Data Types**: You now understand how to declare variables and work with different data types in JavaScript
- **Functions**: You can create and use functions to organize and reuse your code
- **Control Structures**: You know how to use if statements and loops to control program flow
- **Practical Application**: You've seen how these concepts work together in a real-world example

## Next Steps

Now that you have a solid foundation in JavaScript fundamentals, consider exploring:

1. **DOM Manipulation**: Learn how to interact with web pages
2. **Event Handling**: Understand how to respond to user interactions
3. **ES6+ Features**: Explore modern JavaScript features like classes and modules
4. **Asynchronous Programming**: Learn about callbacks, promises, and async/await

Remember, practice is key to mastering any programming language. Try creating your own small projects to reinforce what you've learned!`,
    fun_facts: `## Fun Facts About JavaScript

- **Name Origin**: JavaScript was originally called "Mocha" and then "LiveScript" before being renamed to JavaScript
- **Created in 10 Days**: Brendan Eich created the first version of JavaScript in just 10 days in 1995
- **Not Related to Java**: Despite the name, JavaScript has no relation to the Java programming language
- **Most Popular Language**: JavaScript has been the most popular programming language on GitHub for several years
- **Runs Everywhere**: JavaScript can run on browsers, servers (Node.js), mobile apps, and even IoT devices`,
    memes_humor: `## JavaScript Humor

> "JavaScript is like a box of chocolates - you never know what you're gonna get!" 🍫

> "Why do JavaScript developers prefer dark mode? Because light attracts bugs!" 🐛

> "JavaScript: The only language where '2' + 2 = '22' and 2 + 2 = 4" 🤔`,
    learning_sections: [
      {
        title: 'Getting Started with Variables',
        content: 'Learn how to declare and use variables in JavaScript, including different data types and best practices.',
        examples: [
          {
            title: 'Variable Declaration',
            code: 'let name = "John";\nconst age = 25;',
            explanation: 'Use let for variables that can change, const for values that remain constant.'
          }
        ]
      },
      {
        title: 'Understanding Functions',
        content: 'Master function creation and usage, including traditional functions and modern arrow functions.',
        examples: [
          {
            title: 'Function Declaration',
            code: 'function greet(name) {\n  return `Hello, ${name}!`;\n}',
            explanation: 'Functions are reusable blocks of code that can accept parameters and return values.'
          }
        ]
      }
    ],
    is_published: true,
    created_by: '00000000-0000-0000-0000-000000000000', // Default admin user ID
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'tutorial-2',
    title: 'CSS Grid Layout Mastery',
    subtitle: 'Create responsive layouts with CSS Grid',
    learning_track: 'Web Development',
    difficulty: 'intermediate',
    time_minutes: 60,
    summary: 'Master CSS Grid Layout to create complex, responsive web layouts. Learn grid containers, grid items, and advanced techniques for modern web design.',
    category: 'Web Design',
    tags: ['css', 'grid', 'layout', 'responsive-design', 'web-design'],
    programming_languages: ['css', 'html'],
    learning_goals: 'Understand CSS Grid concepts, create responsive layouts, and master grid positioning',
    what_students_learn: 'Students will learn how to use CSS Grid to create complex layouts, understand grid terminology, and build responsive designs that work across different screen sizes.',
    prerequisites: 'Basic knowledge of HTML and CSS, familiarity with CSS Flexbox (recommended)',
    introduction: `CSS Grid Layout is a powerful two-dimensional layout system that allows you to create complex web layouts with ease. Unlike Flexbox, which is primarily one-dimensional, CSS Grid gives you control over both rows and columns simultaneously.

In this tutorial, we'll explore the fundamental concepts of CSS Grid and learn how to create responsive, professional-looking layouts.`,
    main_content: `## Grid Container Basics

To create a grid layout, you need to define a grid container. Here's how:

\`\`\`css
.grid-container {
  display: grid;
  grid-template-columns: 200px 1fr 200px;
  grid-template-rows: 100px 1fr 100px;
  gap: 20px;
}
\`\`\`

## Grid Template Areas

One of the most powerful features of CSS Grid is the ability to define template areas:

\`\`\`css
.grid-layout {
  display: grid;
  grid-template-areas: 
    "header header header"
    "sidebar main aside"
    "footer footer footer";
  grid-template-columns: 200px 1fr 200px;
  grid-template-rows: 80px 1fr 60px;
  gap: 20px;
}

.header { grid-area: header; }
.sidebar { grid-area: sidebar; }
.main { grid-area: main; }
.aside { grid-area: aside; }
.footer { grid-area: footer; }
\`\`\`

## Responsive Grid Design

Create responsive layouts that adapt to different screen sizes:

\`\`\`css
.responsive-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  padding: 20px;
}

/* Mobile-first approach */
@media (max-width: 768px) {
  .responsive-grid {
    grid-template-columns: 1fr;
  }
}
\`\`\`

## Advanced Grid Techniques

### Grid Lines and Spans
\`\`\`css
.grid-item {
  grid-column: 1 / 3; /* Start at line 1, end at line 3 */
  grid-row: 1 / 4;    /* Start at line 1, end at line 4 */
}
\`\`\`

### Auto-placement and Flow
\`\`\`css
.auto-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-auto-rows: minmax(100px, auto);
  grid-auto-flow: dense; /* Fills gaps automatically */
}
\`\`\``,
    conclusion: `You've successfully completed the CSS Grid Layout Mastery tutorial! 

## Key Takeaways

- **Grid Containers**: You can create powerful layouts using CSS Grid
- **Template Areas**: Define semantic layouts with named grid areas
- **Responsive Design**: Create layouts that adapt to different screen sizes
- **Advanced Techniques**: Use grid lines, spans, and auto-placement for complex layouts

## Practice Projects

Try building these layouts to reinforce your learning:
1. A responsive photo gallery
2. A dashboard layout with sidebar and main content
3. A card-based layout for a portfolio
4. A magazine-style layout with different content areas

CSS Grid is a game-changer for web layout design. Keep practicing and experimenting with different grid configurations!`,
    fun_facts: `## CSS Grid Fun Facts

- **Browser Support**: CSS Grid is supported in all modern browsers since 2017
- **Two-Dimensional**: Unlike Flexbox, Grid works in both rows and columns simultaneously
- **Named Areas**: You can give grid areas semantic names like "header" and "main"
- **Auto-placement**: Grid can automatically place items and fill gaps
- **Subgrid**: A newer feature that allows nested grids to align with parent grids`,
    memes_humor: `## CSS Grid Humor

> "CSS Grid: Because sometimes you need to think in two dimensions!" 📐

> "Grid vs Flexbox: It's like choosing between a spreadsheet and a line of people" 📊

> "CSS Grid: Making web developers feel like architects since 2017" 🏗️`,
    learning_sections: [],
    is_published: true,
    created_by: '00000000-0000-0000-0000-000000000000',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'tutorial-3',
    title: 'React Hooks Deep Dive',
    subtitle: 'Master modern React development with hooks',
    learning_track: 'Frontend Development',
    difficulty: 'advanced',
    time_minutes: 90,
    summary: 'Explore React Hooks in depth, from basic useState and useEffect to custom hooks and advanced patterns. Learn how to build more maintainable and reusable React components.',
    category: 'React',
    tags: ['react', 'hooks', 'javascript', 'frontend', 'state-management'],
    programming_languages: ['javascript', 'jsx'],
    learning_goals: 'Master React Hooks, understand state management, and create custom hooks',
    what_students_learn: 'Students will learn how to use React Hooks effectively, manage component state and side effects, and create reusable custom hooks for better code organization.',
    prerequisites: 'Basic knowledge of React, JavaScript ES6+, and functional programming concepts',
    introduction: `React Hooks revolutionized how we write React components by allowing us to use state and other React features in functional components. Introduced in React 16.8, hooks provide a more intuitive way to manage component logic and state.

In this advanced tutorial, we'll explore hooks in depth, from the basic built-in hooks to creating custom hooks and implementing advanced patterns.`,
    main_content: `## useState Hook

The useState hook is the most fundamental hook for managing state in functional components:

\`\`\`jsx
import React, { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('');

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
      
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter your name"
      />
      <p>Hello, {name}!</p>
    </div>
  );
}
\`\`\`

## useEffect Hook

useEffect handles side effects in functional components:

\`\`\`jsx
import React, { useState, useEffect } from 'react';

function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await fetch(\`/api/users/\${userId}\`);
        const userData = await response.json();
        setUser(userData);
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]); // Dependency array

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>User not found</div>;

  return (
    <div>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  );
}
\`\`\`

## Custom Hooks

Create reusable logic with custom hooks:

\`\`\`jsx
// useLocalStorage.js
import { useState, useEffect } from 'react';

function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
}

// Usage
function App() {
  const [theme, setTheme] = useLocalStorage('theme', 'light');
  
  return (
    <div className={\`app \${theme}\`}>
      <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
        Toggle Theme
      </button>
    </div>
  );
}
\`\`\`

## Advanced Hook Patterns

### useReducer for Complex State
\`\`\`jsx
import React, { useReducer } from 'react';

const initialState = { count: 0 };

function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    case 'decrement':
      return { count: state.count - 1 };
    case 'reset':
      return initialState;
    default:
      throw new Error();
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <div>
      Count: {state.count}
      <button onClick={() => dispatch({ type: 'increment' })}>+</button>
      <button onClick={() => dispatch({ type: 'decrement' })}>-</button>
      <button onClick={() => dispatch({ type: 'reset' })}>Reset</button>
    </div>
  );
}
\`\`\`

### useCallback and useMemo for Performance
\`\`\`jsx
import React, { useState, useCallback, useMemo } from 'react';

function ExpensiveComponent({ data, onItemClick }) {
  const processedData = useMemo(() => {
    return data.map(item => ({
      ...item,
      processed: item.value * 2
    }));
  }, [data]);

  const handleClick = useCallback((id) => {
    onItemClick(id);
  }, [onItemClick]);

  return (
    <div>
      {processedData.map(item => (
        <div key={item.id} onClick={() => handleClick(item.id)}>
          {item.name}: {item.processed}
        </div>
      ))}
    </div>
  );
}
\`\`\``,
    conclusion: `Congratulations on completing the React Hooks Deep Dive tutorial! 

## What You've Mastered

- **useState**: Managing component state effectively
- **useEffect**: Handling side effects and lifecycle events
- **Custom Hooks**: Creating reusable logic and abstractions
- **Advanced Patterns**: useReducer, useCallback, and useMemo for complex scenarios

## Best Practices

1. **Always include dependencies** in useEffect dependency arrays
2. **Create custom hooks** for reusable logic
3. **Use useCallback and useMemo** judiciously for performance optimization
4. **Keep hooks at the top level** of your components
5. **Follow the Rules of Hooks** strictly

## Next Steps

Continue your React journey by exploring:
- Context API and useContext hook
- React Router and navigation patterns
- State management libraries (Redux, Zustand)
- Testing React components and hooks
- Performance optimization techniques

React Hooks have transformed how we write React applications. Keep building and experimenting!`,
    fun_facts: `## React Hooks Fun Facts

- **Introduced in 2018**: Hooks were introduced in React 16.8
- **Backward Compatible**: Hooks don't break existing class components
- **Rules of Hooks**: There are specific rules that must be followed
- **Custom Hooks**: You can create your own hooks to share logic
- **Future of React**: Hooks represent the future direction of React development`,
    memes_humor: `## React Hooks Humor

> "useState: Because sometimes you need to remember things!" 🧠

> "useEffect: The hook that runs when you least expect it" ⚡

> "Custom Hooks: Making your code as reusable as your jokes" 😄`,
    learning_sections: [],
    is_published: true,
    created_by: '00000000-0000-0000-0000-000000000000',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
]

export async function seedTestTextTutorials() {
  try {
    console.log('Seeding test text tutorials...')

    // First, let's check if we have any existing tutorials
    const { data: existingTutorials, error: checkError } = await supabase
      .from('text_tutorials')
      .select('id')
      .limit(1)

    if (checkError) {
      console.error('Error checking existing tutorials:', checkError)
      throw checkError
    }

    if (existingTutorials && existingTutorials.length > 0) {
      console.log('Text tutorials already exist, skipping seed...')
      return { success: true, message: 'Text tutorials already exist' }
    }

    // Insert the sample tutorials
    const { data, error } = await supabase
      .from('text_tutorials')
      .insert(sampleTextTutorials)
      .select()

    if (error) {
      console.error('Error seeding text tutorials:', error)
      throw error
    }

    console.log('Successfully seeded text tutorials:', data)
    return { success: true, data, message: 'Text tutorials seeded successfully' }

  } catch (error) {
    console.error('Failed to seed text tutorials:', error)
    throw error
  }
}

export async function clearTestTextTutorials() {
  try {
    console.log('Clearing test text tutorials...')

    const { error } = await supabase
      .from('text_tutorials')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Keep some tutorials

    if (error) {
      console.error('Error clearing text tutorials:', error)
      throw error
    }

    console.log('Successfully cleared text tutorials')
    return { success: true, message: 'Text tutorials cleared successfully' }

  } catch (error) {
    console.error('Failed to clear text tutorials:', error)
    throw error
  }
} 