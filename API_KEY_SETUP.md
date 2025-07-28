# Judge0 API Key Setup Guide

## Overview
The error "Judge0 API error: 403" means your API key is invalid or expired. Here's how to fix it:

## For AWS EC2 Judge0 Instance

### Option 1: No Authentication (Recommended for Development)
If your Judge0 instance doesn't require authentication:

1. **Open** `src/lib/judge0.ts`
2. **Find** the JUDGE0_API_KEY line:
```typescript
const JUDGE0_API_KEY = import.meta.env.VITE_JUDGE0_API_KEY || ''
```
3. **Leave it empty** or set to empty string in your `.env` file:
```env
VITE_JUDGE0_API_KEY=
```

### Option 2: With Authentication
If your Judge0 instance requires authentication:

1. **Contact your Judge0 administrator** to get an authentication token
2. **Set the token** in your `.env` file:
```env
VITE_JUDGE0_API_KEY=your-auth-token-here
```

## Testing the Connection

### Method 1: Using the Test Page
1. **Start** your development server: `npm run dev`
2. **Navigate** to `/judge0-test` page
3. **Click** "Test Judge0 API" button
4. **Check** the console for any errors

### Method 2: Using curl
Test the API directly:
```bash
# Test without authentication
curl -X GET http://3.85.134.155:2358/about

# Test with authentication (if required)
curl -X GET \
  -H "X-Auth-Token: your-auth-token-here" \
  http://3.85.134.155:2358/about
```

## Troubleshooting

### Common Issues

1. **Connection Refused**: Make sure your Judge0 instance is running on the EC2 server
2. **401 Unauthorized**: Check if authentication is required and your token is valid
3. **403 Forbidden**: Verify your authorization token has the correct permissions
4. **Timeout**: Check network connectivity to the EC2 instance

### Fallback Options
If you can't get the Judge0 API working, you can:

1. **Use a different Judge0 provider**
2. **Deploy your own Judge0 instance**
3. **Use a different code execution service**

## Environment Setup

### Quick Setup
```bash
# Create .env file
echo "VITE_JUDGE0_API_KEY=" > .env

# Or with authentication
echo "VITE_JUDGE0_API_KEY=your-auth-token-here" > .env
```

### Manual Setup
1. **Copy** `env.example` to `.env`
2. **Edit** `.env` and set your Judge0 API key
3. **Restart** your development server

## Security Notes

- **Never commit** your API key to version control
- **Use environment variables** for sensitive configuration
- **Rotate tokens** regularly if using authentication
- **Monitor** API usage for security 