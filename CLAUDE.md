# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Social App** is a location-based social platform for hackathons that creates community connections through QR codes and geofencing. Users scan QR codes at physical locations (classrooms, campuses, etc.) to join location-specific chatrooms anonymously or with accounts. The app features real-time messaging, AI-assisted Q&A threads, and voting mechanisms.

**Hackathon Theme:** "How can we leverage technology to make cities and human settlements inclusive, safe, resilient, and sustainable?"

## Architecture

This is a **full-stack Azure project** with two main components:

### Frontend (Next.js)
- **Framework:** Next.js 14+ with App Router
- **Styling:** Tailwind CSS
- **Real-time:** `@microsoft/signalr` client for WebSocket connections
- **QR Scanner:** Web-based QR scanning (html5-qrcode or @zxing/browser)
- **State:** React Context API or Zustand for global state
- Expected location: `/frontend` or root

### Backend (ASP.NET Core)
- **Framework:** ASP.NET Core 8.0 (C#)
- **API:** RESTful Web API controllers
- **Real-time:** Azure SignalR Service with Hub pattern
- **Auth:** JWT Bearer tokens with ASP.NET Core Identity
- **Database:** Azure Cosmos DB (NoSQL, SQL API)
- **Cache:** Azure Cache for Redis
- Expected location: `/backend`

## Key Technical Concepts

### 1. Location-Based Architecture
All data is **partitioned by `locationId`** in Cosmos DB for:
- Efficient co-location of related data
- Fast location-specific queries
- Horizontal scalability

### 2. SignalR Hub Pattern
Real-time chat uses Azure SignalR Service with hub methods:
- `JoinRoom(roomId, accessToken)` - Join location chatroom
- `SendMessage(roomId, content, tags, accessToken)` - Send message
- `VoteMessage(messageId, voteType, accessToken)` - Vote on messages
- Client receives: `MessageReceived`, `ThreadCreated`, `AiResponse`, `VoteUpdated`

### 3. QR Code Flow
```
User scans QR → POST /api/qr/verify → Verify signature & expiry
→ Check auth status → Show anonymous/signup option OR join room directly
→ GET room for location → Connect SignalR → Subscribe to room messages
```

### 4. Threading System
When users tag a message with `"location_specific_question"`:
1. Message creates a new thread (room with `roomType: "thread"`)
2. AI service triggers automatically to generate response
3. Users can join thread to see focused conversation
4. Voting mechanism surfaces best answers

### 5. Anonymous vs Authenticated Users
- **Anonymous:** Session ID in localStorage, can chat/vote, no cross-device sync
- **Authenticated:** JWT token, full profile (username, gender, age), persistent history
- Conversion flow: `/api/auth/convert-anonymous` upgrades anonymous to full account

## Cosmos DB Containers

8 containers, all partitioned by `locationId` (except users by `/id`):

1. **users** - User accounts and anonymous sessions
2. **locations** - Physical locations with coordinates and geofence radius
3. **qr_codes** - Daily-rotating QR codes with HMAC signatures (TTL enabled)
4. **rooms** - Main location rooms and thread rooms
5. **messages** - All chat messages with tags and vote counts
6. **ai_responses** - AI-generated answers to questions
7. **votes** - User votes on messages/AI responses
8. **user_locations** - Session tracking (TTL: 24h)

## Development Commands

### Backend (ASP.NET Core)
```bash
cd backend
dotnet restore                    # Install dependencies
dotnet build                      # Build project
dotnet run                        # Run API server
dotnet watch run                  # Run with hot reload
dotnet test                       # Run tests
```

### Frontend (Next.js)
```bash
cd frontend
npm install                       # Install dependencies
npm run dev                       # Development server (http://localhost:3000)
npm run build                     # Production build
npm run lint                      # Lint code
npm test                          # Run tests
```

### Azure Resource Setup
```bash
az login
az group create --name SocialAppRG --location eastus

# Cosmos DB
az cosmosdb create --name socialapp-cosmosdb --resource-group SocialAppRG

# App Service
az appservice plan create --name SocialAppPlan --resource-group SocialAppRG --sku B1
az webapp create --name socialapp-backend --resource-group SocialAppRG --plan SocialAppPlan --runtime "DOTNET|8.0"

# SignalR Service
az signalr create --name socialapp-signalr --resource-group SocialAppRG --sku Standard_S1
```

## Configuration

### Backend (appsettings.json or User Secrets)
```bash
dotnet user-secrets init
dotnet user-secrets set "CosmosDb:ConnectionString" "your_connection_string"
dotnet user-secrets set "AzureOpenAI:ApiKey" "your_api_key"
dotnet user-secrets set "Jwt:Key" "your_jwt_secret"
dotnet user-secrets set "SignalR:ConnectionString" "your_signalr_connection"
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SIGNALR_URL=http://localhost:5000/hubs/chat
```

## Important Implementation Details

### Geofencing
Use the `GeofenceHelper.IsWithinGeofence()` method (Haversine formula) to verify users are within `geofenceRadius` meters of a location's coordinates. **Note:** Browser GPS is unreliable indoors; QR codes are the primary access method.

### Daily QR Code Rotation
Background service `QrCodeGenerationService` runs at midnight UTC to generate new QR codes with HMAC signatures for all locations. Cosmos DB TTL auto-expires old codes.

### AI Response Generation
When a message has tag `"location_specific_question"`:
- `AiService.GenerateResponseAsync()` is triggered
- Uses Azure OpenAI with location-specific context
- Stores response with confidence score
- Broadcasts via SignalR to all thread subscribers

### Rate Limiting
Implement middleware for:
- Message sending: 10/min per user
- QR scanning: 5/min per device
- API calls: 100/min per IP

## Project Structure Expectations

```
/
├── backend/
│   ├── Controllers/        # AuthController, QrController, LocationsController
│   ├── Hubs/              # ChatHub (SignalR)
│   ├── Services/          # IAuthService, IQrCodeService, IAiService, etc.
│   ├── Models/            # User, Location, Message, QrCode, etc.
│   ├── Helpers/           # GeofenceHelper, JwtHelper
│   └── Program.cs
├── frontend/
│   ├── app/               # Next.js app directory
│   ├── components/        # UI components
│   ├── lib/               # SignalR client, API helpers
│   └── public/            # Static assets
└── TECHNICAL_IMPLEMENTATION.md  # Full technical specification
```

## Hackathon Scope (MVP)

**Must Have:**
- QR code scanning (web camera)
- Anonymous user sessions
- Real-time chat with SignalR
- Location-based rooms
- Basic authentication

**Nice to Have (if time):**
- Threading with tags
- Voting mechanism
- AI responses (can fake for demo)

**Skip for MVP:**
- Geofencing (use QR only)
- Daily QR rotation (use static codes)
- Gender/age-specific rooms
- Vector search fine-tuning

## Reference Documents

- **TECHNICAL_IMPLEMENTATION.md** - Complete technical specification with:
  - Full database schema
  - All API endpoints
  - SignalR hub implementation
  - AI integration details
  - Security & privacy guidelines
  - 2-day hackathon timeline

When implementing features, always reference TECHNICAL_IMPLEMENTATION.md for detailed code examples and specifications.
