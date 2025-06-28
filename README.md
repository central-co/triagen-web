# triagen-web

This project uses Vite with React and TypeScript.

## Local development

1. Copy `.env.example` to `.env`.
2. Set `VITE_LIVEKIT_URL` in your `.env` file to the WebSocket URL of your LiveKit server.
3. Set `VITE_API_URL` to the base URL of the API.
4. Run `npm install` followed by `npm run dev`.

The `VITE_LIVEKIT_URL` and `VITE_API_URL` variables will also be read during `npm run build` for deployment.
