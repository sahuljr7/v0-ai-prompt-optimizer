# Setup Guide

This guide will help you set up and configure the AI Chat Assistant application.

## Quick Start

### 1. Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

The app will be available at `http://localhost:3000`

## Configuration

### Step 1: Get an Ollama API Key

You'll need access to an Ollama API endpoint. Here are your options:

#### Option A: Local Ollama Installation
1. Install Ollama from https://ollama.ai
2. Run Ollama locally on your machine
3. The API will be available at `http://localhost:11434`

#### Option B: Ollama Cloud Service
1. Sign up for an Ollama cloud service
2. Create an API key
3. Get your API endpoint URL

#### Option C: Compatible Services
You can use any LLM API that's compatible with Ollama's API format.

### Step 2: Configure the Application

1. Open the app in your browser
2. Click the **Settings** tab in the sidebar
3. Enter your API Key in the "API Key" field
4. Select your preferred AI model from the dropdown
5. Adjust the generation parameters:
   - **Temperature**: How creative the AI should be (0 = focused, 2 = very creative)
   - **Max Tokens**: Maximum length of responses
6. Click "Save Settings"

Your settings are automatically saved in your browser's local storage.

## Temperature Settings Guide

- **0.0 - 0.3**: Very Focused
  - Best for: Factual information, technical writing, consistent answers
  - Use when: You want reliable, predictable responses

- **0.3 - 0.6**: Focused
  - Best for: General questions, explanations, documentation
  - Use when: You want quality answers with some variation

- **0.6 - 1.0**: Balanced
  - Best for: Creative writing, brainstorming, diverse perspectives
  - Use when: You want creativity without losing coherence

- **1.0 - 1.5**: Creative
  - Best for: Storytelling, ideas, artistic content
  - Use when: You want more imaginative responses

- **1.5 - 2.0**: Very Creative
  - Best for: Experimental prompts, unconventional thinking
  - Use when: You want maximum creativity (may lose coherence)

## Model Selection

### Recommended Models

**Llama 2** (Default)
- Balanced performance and quality
- Good for general-purpose conversations
- ~7B parameters

**Mistral**
- Smaller but very capable
- Excellent for coding
- Better performance on faster connections

**Code Llama**
- Specialized for programming
- Excellent code generation and explanation
- Best for developers

**Dolphin Mixtral**
- High-quality responses
- Good reasoning abilities
- Larger model (better quality, slower)

## Troubleshooting

### Issue: "API Key not set" error

**Solution:**
1. Ensure you've entered a valid API key in Settings
2. The key should be non-empty and properly formatted
3. Try resaving the settings
4. Clear your browser cache and reload

### Issue: "Failed to generate response"

**Solutions:**
1. Check your internet connection
2. Verify the API endpoint is accessible
3. Ensure the API key is valid and has permissions
4. Try a different model
5. Check the browser console (F12) for detailed errors

### Issue: Very slow responses

**Solutions:**
1. Reduce the "Max Tokens" value
2. Lower the temperature setting
3. Try a smaller model (e.g., Mistral instead of Dolphin Mixtral)
4. Check your internet speed and server load

### Issue: Settings not saving

**Solutions:**
1. Check if browser storage is enabled
2. Review browser privacy settings
3. Ensure you have enough storage space
4. Try a different browser
5. Clear cache and reload the page

### Issue: Responses are incoherent or repetitive

**Solutions:**
1. Lower the temperature value
2. Reduce max tokens
3. Try a different model
4. Refine your prompt (use the Prompt Optimizer tool)

## Advanced Usage

### Using the Prompt Optimizer

1. Go to the **Optimizer** tab
2. Enter your initial prompt
3. Click "Optimize Prompt"
4. Review the suggestions
5. Copy the optimized prompt
6. Use it in the Chat tab

### Keyboard Shortcuts

- **Enter**: Send message
- **Shift + Enter**: Add new line in message
- **Escape**: Clear the input field

## Performance Tips

1. **Start with smaller models** if you have a slow connection
2. **Lower max tokens** for faster responses
3. **Use lower temperature** for more consistent results
4. **Close other browser tabs** to free up memory
5. **Clear browser cache** periodically for better performance

## Security & Privacy

- Your API key is stored **only in your browser's local storage**
- No data is sent to external servers except to your configured API endpoint
- Your conversations are stored locally and not backed up
- Clear your browser data to delete all stored information

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

**Not supported:**
- Internet Explorer
- Very old browser versions
- Browsers with local storage disabled

## Deployment

### Deploy to Vercel

```bash
# Push to GitHub first
git push origin main

# Deploy from Vercel Dashboard
# https://vercel.com/new
```

### Deploy Elsewhere

```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

## Environment Variables

Currently, the app uses browser-based configuration. No environment variables are required for development.

For production, you may want to:
1. Disable local API key storage
2. Implement a backend authentication system
3. Add server-side API key management

## Common Questions

### Q: Is my API key secure?
A: Your API key is stored only in your browser's local storage. It's never sent to our servers. However, be careful sharing your screen or granting browser access to others.

### Q: Can I use multiple API keys?
A: Not currently, but you can:
1. Use different browsers
2. Use browser profiles
3. Clear storage and re-enter new keys

### Q: How long are conversations kept?
A: Until you refresh the page or clear browser storage. Implement a backend for persistence.

### Q: Can I export conversations?
A: Currently no, but you can copy/paste messages. A future update may add export functionality.

### Q: Why is my response incomplete?
A: You likely hit the "Max Tokens" limit. Increase it in Settings for longer responses.

## Getting Help

1. **Check the README.md** for general information
2. **Review browser console** (F12) for error messages
3. **Check API endpoint** accessibility
4. **Verify API key** and permissions
5. **Try a different model** or lower settings

## Next Steps

1. Complete the setup above
2. Start with the Chat tab
3. Explore the Prompt Optimizer
4. Experiment with different models and settings
5. Check out the README for more features

Happy chatting!
