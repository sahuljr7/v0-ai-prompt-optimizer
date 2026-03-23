# Backend Configuration

This application is fully configured with backend-only setup. No user interaction is required for API configuration.

## Environment Variables

The following environment variable is required and should be set in your deployment:

- **OLLAMA_API_KEY**: Your Ollama API key for authentication (currently configured)

## Configuration Details

- **API Base URL**: `https://api.ollama.com`
- **Model**: `qwen3.5`
- **Default Temperature**: 0.7
- **Default Max Tokens**: 2048

## How It Works

1. All API requests from the client are sent to `/api/chat` (backend route)
2. The backend securely handles authentication using the `OLLAMA_API_KEY` environment variable
3. The backend forwards requests to the Ollama API with Bearer token authentication
4. Streaming responses are piped back to the client

## Security

- Your API key is never exposed to the client
- All Ollama API communication happens server-to-server
- The client only communicates with your own backend API

## Deployment

When deploying to production:

1. Set the `OLLAMA_API_KEY` environment variable in your deployment platform (Vercel, etc.)
2. The application will automatically use the configured API key
3. No additional setup is required on the client side

## Troubleshooting

### "API key not configured on server"

This error means the `OLLAMA_API_KEY` environment variable is not set. Ensure it's configured in your deployment environment.

### "Failed to generate response from Ollama"

This typically means:
- The API key is invalid or expired
- The Ollama API is unavailable
- The qwen3.5 model is not available in your Ollama account

Check your Ollama dashboard to verify the API key and available models.
