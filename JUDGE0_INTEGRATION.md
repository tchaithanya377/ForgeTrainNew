# Judge0 API Integration

This document describes the integration of the Judge0 API for remote code execution in the ForgeTrain application.

## Overview

The Judge0 API provides a secure, sandboxed environment for executing code in multiple programming languages. This integration replaces the previous client-side code execution with a more robust and secure remote execution system.

## Features

- **Multi-language Support**: Supports JavaScript, Python, Java, C++, C, and many other programming languages
- **Secure Execution**: Code runs in isolated sandboxes on Judge0 servers
- **Real-time Results**: Provides execution time, memory usage, and detailed error messages
- **Input/Output Handling**: Supports custom input and expected output validation
- **Error Handling**: Comprehensive error reporting for compilation and runtime errors

## API Configuration

The integration uses the following configuration:

```typescript
const JUDGE0_API_KEY = '74328e168emsh588c9081fc4f4b8p132647jsn12c6313d0b4f'
const JUDGE0_HOST = 'judge0-ce.p.rapidapi.com'
```

## Supported Languages

| Language | ID | Extension |
|----------|----|-----------|
| JavaScript (Node.js) | 63 | js |
| Python 3 | 71 | py |
| Java | 62 | java |
| C++ | 54 | cpp |
| C | 50 | c |
| C# | 51 | cs |
| PHP | 68 | php |
| Ruby | 72 | ruby |
| Go | 60 | go |
| Rust | 73 | rust |
| Swift | 83 | swift |
| Kotlin | 78 | kt |
| TypeScript | 74 | ts |

## Usage

### Basic Code Execution

```typescript
import { Judge0Service } from './lib/judge0'

const result = await Judge0Service.executeCode(
  'console.log("Hello, World!")',
  'javascript'
)

console.log(result)
// {
//   success: true,
//   output: 'Hello, World!\n',
//   error: null,
//   executionTime: 150,
//   memory: 1024,
//   status: 'Accepted'
// }
```

### Code Execution with Input/Output Validation

```typescript
const result = await Judge0Service.executeCode(
  'function add(a, b) { return a + b; } console.log(add(5, 3));',
  'javascript',
  '5\n3',
  '8'
)
```

### Code Validation

```typescript
const validation = Judge0Service.validateCode(code)
if (!validation.isValid) {
  console.error('Code validation failed:', validation.error)
}
```

## Integration with Challenge System

The Judge0 integration is used in the challenge solving system:

1. **Code Validation**: Before execution, code is validated for security
2. **Test Case Execution**: Each test case is executed remotely
3. **Result Processing**: Results are processed and displayed to the user
4. **Performance Metrics**: Execution time and memory usage are tracked

## Security Features

### Code Validation

The system validates code for potentially dangerous patterns:

- `eval()` and `Function()` constructors
- Network requests (`fetch`, `XMLHttpRequest`)
- File system access
- Process execution
- Infinite loops
- Browser-specific APIs

### Sandboxed Execution

- Code runs in isolated containers
- No access to system resources
- Time and memory limits enforced
- Network access restricted

## Error Handling

The system handles various types of errors:

- **Compilation Errors**: Syntax errors, missing imports
- **Runtime Errors**: Exceptions during execution
- **Time Limit Exceeded**: Code takes too long to execute
- **Memory Limit Exceeded**: Code uses too much memory
- **Wrong Answer**: Output doesn't match expected result

## Testing

To test the Judge0 integration:

1. Navigate to a challenge solving page
2. Click the "Test Judge0 API" button
3. Check the browser console for detailed test results

Or run the test programmatically:

```typescript
import { testJudge0Integration } from './lib/judge0-test'

await testJudge0Integration()
```

## API Endpoints Used

- `POST /submissions` - Submit code for execution
- `GET /submissions/{token}` - Get execution results
- `GET /languages` - Get supported languages

## Rate Limiting

The Judge0 API has rate limits:
- 1000 requests per month (free tier)
- 10 requests per second
- Maximum execution time: 15 seconds
- Maximum memory: 512MB

## Troubleshooting

### Common Issues

1. **API Key Invalid**: Check if the API key is correct and active
2. **Language Not Supported**: Verify the language ID is correct
3. **Timeout**: Code execution takes too long
4. **Memory Limit**: Code uses too much memory

### Debug Mode

Enable debug logging by checking the browser console for detailed error messages.

## Future Enhancements

- Support for more programming languages
- Custom execution environments
- Batch code execution
- Real-time execution monitoring
- Code execution history
- Performance analytics 