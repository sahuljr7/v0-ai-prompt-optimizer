# Ollama API Configuration Guide

This guide walks you through configuring the AI Chat Assistant to work with your hosted Ollama API.

## Prerequisites

- A hosted Ollama API account at https://api.ollama.com
- An API key from your Ollama dashboard
- The qwen3.5 model available in your Ollama library

## Quick Start

### Step 1: Get Your API Key

1. Go to [api.ollama.com](https://api.ollama.com)
2. Sign in to your account
3. Navigate to the API Keys section
4. Create a new API key or copy an existing one
5. Keep this key safe - you'll need it in the next step

### Step 2: Configure in the App

1. Open the application in your browser
2. Click the **Settings** tab in the sidebar (gear icon)
3. Paste your API key into the **API Key** field
4. Select **Qwen 3.5** from the AI Model dropdown
5. Adjust Temperature and Max Tokens if desired (defaults are recommended):
   - **Temperature**: 0.7 (Balanced creativity and focus)
   - **Max Tokens**: 2048 (reasonable response length)
6. Click **Save Settings**

### Step 3: Start Chatting

1. Click the **Chat** tab in the sidebar
2. Type your message in the input field
3. Press **Enter** to send
4. Wait for the AI response to stream back

## API Configuration Details

### Base URL
```
https://api.ollama.com
```

### Authentication
All requests use Bearer token authentication with your API key:
```
Authorization: Bearer YOUR_API_KEY_HERE
```

### Supported Model
The application is configured to use:
- **qwen3.5** (recommended - best performance)

You can select other available models from your Ollama library in the Settings panel.

### Request Format
```json
{
  "model": "qwen3.5",
  "prompt": "Your message here",
  "stream": true,
  "temperature": 0.7,
  "num_predict": 2048
}
```

## Troubleshooting

### "Error: Failed to generate response"
**Cause**: API key is invalid or not provided
**Solution**: 
1. Verify your API key in the Ollama dashboard
2. Make sure it's correctly pasted in Settings
3. Try using a freshly generated API key

### "Error: API error: Unauthorized"
**Cause**: API key has expired or been revoked
**Solution**: Generate a new API key in your Ollama dashboard and update Settings

### "Error: Failed to read response stream"
**Cause**: Network issue or API server problem
**Solution**: 
1. Check your internet connection
2. Verify the Ollama API is running
3. Try again in a few moments

### Response takes too long or times out
**Cause**: Model is overloaded or network is slow
**Solution**: 
1. Reduce Max Tokens in Settings (try 1024)
2. Lower Temperature if very high
3. Wait a moment and try again
4. Contact Ollama support if persistent

### "qwen3.5 model not found"
**Cause**: Model hasn't been added to your Ollama account
**Solution**:
1. Log into https://api.ollama.com
2. Add qwen3.5 to your available models
3. Refresh the app

## Security Notes

- Your API key is stored **only in your browser's local storage**
- API keys are **never sent to any server except api.ollama.com**
- Clear browser storage to remove your API key
- Don't share your API key with others

## Settings Parameters Explained

### Temperature (0.0 - 2.0)
- **0.0 - 0.5**: More focused, consistent, deterministic responses
- **0.5 - 0.8**: Balanced (recommended: 0.7)
- **0.8 - 2.0**: More creative, varied, random responses

### Max Tokens (128 - 8192)
- **128 - 512**: Short responses only
- **512 - 2048**: Normal conversation (recommended: 2048)
- **2048 - 8192**: Long-form, detailed responses

## Getting Help

For issues with:
- **API authentication**: Contact Ollama support
- **App functionality**: Check the error message in the chat window
- **Model availability**: Visit your Ollama dashboard

## Next Steps

Once configured, you can:
1. Use the **Optimizer** tab to enhance your prompts
2. Create different chat sessions for different topics
3. Adjust settings per conversation type (creative vs technical)
