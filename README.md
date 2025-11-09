# Beacons Frontend

A modern, responsive Next.js web application for real-time location-based chat with AI-powered responses.

## Overview

Beacons turns strangers into neighbors through QR code-accessed location-specific chat rooms. The frontend provides a clean, intuitive interface for joining communities, messaging, and voting on content.

## Features

- **Location-Based Chat**: Join specific rooms via QR code scanning
- **Real-Time Messaging**: Instant message delivery via SignalR WebSocket
- **Threading System**: Nested replies to location-specific questions
- **AI Responses**: Context-aware answers powered by RAG pipeline
- **Voting System**: Upvote/downvote messages (authenticated users only)
- **Admin Dashboard**: Manage rooms, QR codes, and administrators
- **Authentication**: Google OAuth via Auth.js/NextAuth.js
- **Mobile-First Design**: Responsive two-row header, optimized for small screens
- **Toast Notifications**: Non-blocking user feedback
- **Skeleton Loading**: Better perceived performance

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Backend running on `http://localhost:5211`
- Google OAuth credentials (see Configuration)

### Installation

```bash
npm install
```

### Configuration

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5211
NEXT_PUBLIC_SIGNALR_URL=http://localhost:5211/chatHub
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_secret
NEXTAUTH_SECRET=your_secret_key
NEXTAUTH_URL=http://localhost:3000
```

### Development

```bash
npm run dev
```

Open http://localhost:3000

### Production Build

```bash
npm run build
npm start
```

## Architecture

See [TECHNICAL_IMPLEMENTATION.md](./TECHNICAL_IMPLEMENTATION.md) for detailed architecture, components, and integration information.

## Project Structure

```
app/              # Pages and layouts
components/       # Reusable UI and chat components
context/          # React Context (auth, toast)
hooks/            # Custom hooks (useChatHub)
lib/              # Utilities (API client, auth)
types/            # TypeScript definitions
```

## Key Technologies

- **Next.js 14+**: React framework with App Router
- **React 18**: UI library
- **TypeScript**: Type safety
- **Tailwind CSS**: Utility-first styling
- **Auth.js**: OAuth authentication
- **SignalR**: Real-time WebSocket communication
- **React Context**: State management

## Authentication

1. Users sign in with Google OAuth
2. Backend validates Google ID token
3. Token passed to WebSocket connection
4. Admin status verified via API call

## Pages

- **`/`**: Home/marketing with room list
- **`/login`**: Google OAuth sign-in
- **`/scan`**: QR code scanner (future)
- **`/room/[roomId]`**: Main chat interface
- **`/admin`**: Admin dashboard (admin only)

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend REST API URL |
| `NEXT_PUBLIC_SIGNALR_URL` | SignalR WebSocket URL |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret |
| `NEXTAUTH_SECRET` | NextAuth session secret |
| `NEXTAUTH_URL` | Frontend URL for OAuth redirect |

## Development Tips

- **Type checking**: `npm run type-check`
- **Hot reload**: Enabled by default with `npm run dev`
- **Debugging**: Use browser DevTools, SignalR logs in console
- **Styling**: Tailwind CSS - modify `app/globals.css`

## Deployment

### Vercel (Recommended)

```bash
vercel
```

Set environment variables in Vercel dashboard.

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
docker build -t beacons-frontend .
docker run -p 3000:3000 beacons-frontend
```

## Integration with Backend

Frontend communicates with backend via:

1. **REST API** (`lib/api.ts`): Rooms, messages, voting
2. **SignalR WebSocket**: Real-time messaging

See [TECHNICAL_IMPLEMENTATION.md](./TECHNICAL_IMPLEMENTATION.md) for API details.

## Performance

- **Code splitting**: Each page is separate bundle
- **Skeleton loading**: Better UX during data fetch
- **Message memoization**: Efficient re-renders
- **Incremental updates**: SignalR for delta updates

## Browser Support

- Chrome, Firefox, Safari, Edge (latest versions)
- Requires JavaScript and WebSocket support
- Mobile: iOS Safari 12+, Android Chrome latest

## Troubleshooting

**"Cannot connect to backend"**
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check backend is running on expected port
- Look for CORS errors in browser console

**"SignalR connection fails"**
- Verify `NEXT_PUBLIC_SIGNALR_URL` is correct
- Check browser supports WebSocket
- Look for authentication errors

**"Google OAuth not working"**
- Verify `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is set
- Check `NEXTAUTH_URL` matches deployment URL
- Ensure Google OAuth app is configured correctly

## Future Enhancements

- Message search and filtering
- User presence indicators
- Message reactions
- Room bookmarking
- Avatar support
- Typing indicators
- Read receipts

## Contributing

1. Create a feature branch
2. Commit changes
3. Test thoroughly
4. Submit pull request

## License

MIT
