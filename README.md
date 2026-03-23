# AI Chat Assistant

A modern, feature-rich AI chat application powered by Ollama. Built with Next.js, React, and TypeScript, featuring real-time streaming responses, prompt optimization, and intelligent configuration management.

## Features

- **Real-time Chat**: Stream AI responses in real-time with Markdown rendering
- **Syntax Highlighting**: Code blocks are automatically highlighted with support for multiple languages
- **Prompt Optimizer**: Built-in tools to enhance your prompts for better AI responses
- **Flexible Configuration**: Adjust temperature, max tokens, and select different AI models
- **Persistent Settings**: Your settings are automatically saved to browser storage
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Dark Theme**: Beautiful glassmorphic dark interface
- **Error Handling**: Robust error handling with user-friendly messages
- **Keyboard Shortcuts**: Full keyboard navigation support

## Getting Started

### Prerequisites

- Node.js 18+ or higher
- Ollama API access (or compatible API endpoint)
- pnpm, npm, or yarn package manager

### Installation

1. Clone or download the project
2. Install dependencies:

```bash
pnpm install
# or
npm install
# or
yarn install
```

3. Start the development server:

```bash
pnpm dev
# or
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Configuration

### API Setup

1. Navigate to the **Settings** tab
2. Enter your Ollama API key
3. Select your preferred AI model (Llama 2, Mistral, etc.)
4. Adjust generation parameters:
   - **Temperature**: Controls creativity (0 = focused, 2 = very creative)
   - **Max Tokens**: Maximum response length

Your settings are automatically saved and persist across sessions.

### Available Models

- Llama 2 (default)
- Llama 2 Uncensored
- Mistral
- Neural Chat
- Dolphin Mixtral
- Code Llama

## Usage

### Chat Tab

1. Configure your API key and model in Settings
2. Type your message in the chat input
3. Press **Enter** to send (or click the Send button)
4. Wait for the AI to generate a response
5. Use **Shift+Enter** for multi-line messages
6. Press **Escape** to clear the input

### Prompt Optimizer Tab

1. Enter your initial prompt
2. Click "Optimize Prompt" to enhance it
3. Copy the optimized prompt to use it in chat
4. Browse prompt templates for common use cases
5. Read optimization tips for better results

### Settings Tab

- Configure API credentials
- Choose your AI model
- Adjust temperature and token limits
- All changes are automatically saved

## Keyboard Shortcuts

- **Enter**: Send message
- **Shift+Enter**: New line in message
- **Escape**: Clear input field

## Architecture

### Key Components

- **AppShell**: Main layout container with sidebar navigation
- **ChatWindow**: Message display and input interface
- **PromptOptimizerPanel**: Tools for enhancing prompts
- **SettingsPanel**: Configuration interface
- **MessageBubble**: Renders messages with Markdown and syntax highlighting

### Hooks

- **useChat**: Manages message history state
- **useOllamaAPI**: Handles streaming API calls to Ollama
- **useAIConfig**: Global AI configuration state management
- **useLocalStorage**: Persistent storage utilities

### Utilities

- **helpers.ts**: Common utility functions
- **toast.ts**: Notification system
- **ai-config-context.tsx**: Global configuration provider

## API Integration

The app communicates with Ollama's streaming API:

```
POST https://api.ollama.com/api/generate
```

**Request Body:**
```json
{
  "model": "llama2",
  "prompt": "Your prompt here",
  "stream": true,
  "temperature": 0.7,
  "num_predict": 2048
}
```

Responses are streamed as newline-delimited JSON for real-time rendering.

## Styling

- **Theme**: Dark mode with deep blue/purple and cyan accents
- **Colors**: Semantic CSS variables for consistent theming
- **Components**: Built with shadcn/ui and Tailwind CSS
- **Typography**: Geist font family with proper hierarchy

## Development

### Project Structure

```
├── app/
│   ├── layout.tsx          # Root layout with providers
│   ├── page.tsx            # Main page component
│   └── globals.css         # Global styles and theme
├── components/
│   ├── chat/               # Chat-related components
│   ├── optimizer/          # Prompt optimizer components
│   ├── settings/           # Settings panel components
│   ├── layout/             # Layout components
│   └── ui/                 # Reusable UI components
├── hooks/                  # Custom React hooks
├── lib/                    # Utility functions and contexts
└── public/                 # Static assets
```

### Building

```bash
pnpm build
pnpm start
```

### Code Quality

- TypeScript for type safety
- ESLint for code linting
- Proper error boundaries
- Console logging for debugging

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- Streaming responses for immediate feedback
- Lazy component loading
- Optimized re-renders
- Efficient state management
- LocalStorage for persistence

## Security

- API keys stored locally in browser storage
- No sensitive data sent to external servers
- CORS-safe fetch requests
- Input validation and sanitization

## Troubleshooting

### "API Key not set"
- Ensure you've configured the API key in Settings
- Verify the key is correct and has valid permissions

### "Failed to generate response"
- Check your internet connection
- Verify the Ollama API is accessible
- Try a different model
- Check browser console for detailed error messages

### Settings not saving
- Ensure browser storage is enabled
- Check browser privacy settings
- Try clearing cache if issues persist

### Slow responses
- Reduce max tokens to get faster responses
- Lower temperature for more focused responses
- Check your network speed

## Dependencies

- **Next.js**: React framework
- **React 19**: UI library
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **Radix UI**: Accessible components
- **React Markdown**: Markdown rendering
- **Syntax Highlighter**: Code highlighting
- **Lucide React**: Icons

## License

This project is open source and available under the MIT License.

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review browser console for error messages
3. Verify API configuration is correct
4. Try refreshing the page

## Future Enhancements

- Chat history persistence
- Multiple conversation threads
- Custom system prompts
- Response regeneration
- Message editing and deletion
- Export chat history
- Advanced analytics
- Voice input/output support
