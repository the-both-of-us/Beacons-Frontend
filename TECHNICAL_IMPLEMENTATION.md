# Social App - Technical Implementation Document

## Project Overview

**Hackathon Theme:** How can we leverage technology to make cities and human settlements inclusive, safe, resilient, and sustainable?

**Concept:** A location-based web application that creates community connections through QR codes and geofencing, enabling real-time, location-specific conversations and AI-assisted community support. Users access the platform via any web browser on their mobile devices or computers.

---

> **2025-11-08 Frontend Update**
>
> The production UI now talks directly to the live ASP.NET backend—mock data, QR flows, and AI/thread placeholders have been removed. Current scope:
> - `lib/api.ts` hits `/api/rooms` + `/api/rooms/{roomId}/messages` on the backend.
> - `hooks/useChatHub.ts` uses `@microsoft/signalr` to join `/chatHub` and stream history + live messages.
> - Active routes: `/` (marketing hero), `/scan` (room directory), `/room/[roomId]` (chat surface).
>
> The rest of this document captures the original aspirational design (QR scans, AI answers, threading, etc.) and remains for archival reference until those backend capabilities exist.

> **2025-11-09 Authentication Update**
>
> The frontend now relies on Auth.js (NextAuth) with Google OAuth for sign-in/out (`/login`, AuthStatus component, RequireAuth gates). Populate `NEXT_PUBLIC_GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, and the comma-separated `ADMIN_EMAILS` allowlist in `.env.local`, then restart `npm run dev`. `lib/authClient.ts` retrieves the session’s Google ID token so `lib/api.ts` can attach `Authorization: Bearer …` for admin requests—matching the backend’s `ADMIN_EMAILS` enforcement.

> **2025-11-08 QR Code Feature Implementation**
>
> QR code scanning and generation functionality has been implemented:
> - **Backend:** QR code model, service layer, and API endpoints (`/api/qrcodes`) for creating, validating, and managing QR codes
> - **Frontend:** Camera-based QR scanner using `html5-qrcode`, QR code generation using `qrcode` library
> - **Admin UI:** `/admin` page for managing rooms and QR codes with tabs for "Manage Rooms" and "Manage QR Codes"
> - **User Flow:** Users can scan QR codes on `/scan` page to instantly join rooms, or browse rooms manually as fallback
> - **Features:** Configurable expiration dates, one QR code per room, print/download functionality for physical distribution

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Tech Stack](#tech-stack)
3. [Core Features](#core-features)
4. [Database Schema](#database-schema)
5. [System Components](#system-components)
6. [API Design](#api-design)
7. [Security & Privacy](#security--privacy)
8. [Implementation Phases](#implementation-phases)
9. [AI Integration](#ai-integration)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                         │
│                  Next.js Web Application                     │
│         (QR Scanner via Web API + Location Services)         │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           │ HTTPS
                           │
         ┌─────────────────▼────────────────────┐
         │      Azure App Service               │
         │    ASP.NET Core Web API (C#)         │
         │                                      │
         │  ┌──────────────────────────────┐   │
         │  │   SignalR Service Hub        │   │
         │  │  (Real-time Communication)   │   │
         │  └──────────────────────────────┘   │
         └──────────────┬───────────────────────┘
                        │
         ┌──────────────┼──────────────┐
         │              │              │
    ┌────▼─────┐   ┌───▼────────┐  ┌─▼─────────────┐
    │  Auth    │   │  SignalR   │  │   AI/ML       │
    │ Service  │   │  Service   │  │   Service     │
    │(ASP.NET) │   │  (Azure)   │  │ (OpenAI API)  │
    └────┬─────┘   └───┬────────┘  └─┬─────────────┘
         │             │             │
         └─────────┬───┴─────┬───────┘
                   │         │
        ┌──────────▼───┐  ┌─▼──────────────┐
        │Azure Cosmos  │  │  Azure Cache   │
        │     DB       │  │  for Redis     │
        │  (NoSQL)     │  │  (Sessions)    │
        └──────────────┘  └────────────────┘
```

---

## Tech Stack

### Frontend
- **Framework:** Next.js 14+ (React 18+)
  - **Styling:** Tailwind CSS
  - **QR Scanner:** `html5-qrcode` or `@zxing/browser`
  - **Location:** Browser Geolocation API
  - **Real-time:** `@microsoft/signalr` client
  - **State Management:** React Context API / Zustand
  - **Forms:** React Hook Form + Zod validation

### Backend
- **Framework:** ASP.NET Core 8.0 (C#)
  - **API:** RESTful Web API
  - **Real-time:** Azure SignalR Service
  - **Authentication:** ASP.NET Core Identity + JWT Bearer tokens
  - **Validation:** FluentValidation
  - **Middleware:** CORS, Rate Limiting, Exception Handling

### Database & Storage
- **Primary Database:** Azure Cosmos DB (NoSQL)
  - **API:** Core (SQL API)
  - **Partitioning:** By `location_id` for scalability
- **Cache:** Azure Cache for Redis
  - Session management
  - Real-time data caching
  - Rate limiting counters
- **File Storage:** Azure Blob Storage (for future media/images)

### AI/ML
- **AI Model:** Azure OpenAI Service (GPT-4)
- **Vector Search:** Azure Cosmos DB Vector Search or Azure AI Search
- **Training Pipeline:** Azure Machine Learning (future)

### Azure Services
- **Hosting:** Azure App Service (Web App)
- **SignalR:** Azure SignalR Service (fully managed)
- **Authentication:** Azure AD B2C (optional for future)
- **Monitoring:** Azure Application Insights
- **CDN:** Azure Front Door (for global performance)

### DevOps
- **CI/CD:** GitHub Actions → Azure App Service
- **Secrets:** Azure Key Vault
- **Monitoring:** Application Insights + Azure Monitor
- **Logging:** Serilog → Application Insights

---

## Core Features

### 1. QR Code System

**Daily QR Code Generation:**
- Each location has a unique `location_id`
- QR codes regenerate daily at midnight (prevents sharing/reuse)
- QR payload format:
  ```json
  {
    "location_id": "uni_classroom_A101",
    "generated_at": "2025-01-08T00:00:00Z",
    "expires_at": "2025-01-09T00:00:00Z",
    "signature": "hash_for_verification"
  }
  ```

**Flow:**
```
Scan QR → Verify QR validity → Check user auth
         → If not authenticated: Show signup/anonymous option
         → If authenticated: Join room directly
```

### 2. Location-Based Access

**Geofencing System:**
- When accessing via web, request device location
- Calculate distance using Haversine formula
- Allow access if within radius (e.g., 100m from location center)
- Fallback: Manual verification (future: Bluetooth beacons)

**Implementation:**
```csharp
public static class GeofenceHelper
{
    public static bool IsWithinGeofence(
        double userLat, double userLng,
        double locationLat, double locationLng,
        double radiusMeters)
    {
        const double R = 6371e3; // Earth radius in meters
        var φ1 = userLat * Math.PI / 180;
        var φ2 = locationLat * Math.PI / 180;
        var Δφ = (locationLat - userLat) * Math.PI / 180;
        var Δλ = (locationLng - userLng) * Math.PI / 180;

        var a = Math.Sin(Δφ / 2) * Math.Sin(Δφ / 2) +
                Math.Cos(φ1) * Math.Cos(φ2) *
                Math.Sin(Δλ / 2) * Math.Sin(Δλ / 2);
        var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
        var distance = R * c;

        return distance <= radiusMeters;
    }
}
```

### 3. Chat Room System

**Room Types:**
- **Main Location Room:** Default room for each location
- **Thread Rooms:** Created when "location specific question" tag is used
- **Future:** Gender-specific, age-specific rooms

**Message Structure:**
```javascript
{
  id: "msg_uuid",
  room_id: "room_uuid",
  user_id: "user_uuid" | "anonymous_session_id",
  content: "message text",
  tags: ["location_specific_question", "urgent"],
  is_thread_starter: true,
  parent_thread_id: null,
  timestamp: "2025-01-08T14:30:00Z",
  votes: { up: 0, down: 0 },
  ai_response: null
}
```

**Real-time Updates:**
- Use Azure SignalR Service for instant message delivery
- SignalR Groups: joined by `roomId`
- Events: `MessageReceived`, `ThreadCreated`, `AiResponse`, `VoteUpdated`

### 4. Threading System

**Tag-Based Threading:**
- Special tag: "location_specific_question"
- When added, creates a new thread room
- Thread room shows:
  - Original message at top
  - All responses below
  - AI response (if applicable)

**User Flow:**
```
User types message → Selects "location_specific_question" tag
→ Message posted to main room
→ Thread room auto-created
→ Users can click to join thread
→ AI analyzes and responds
→ Users vote on responses
```

### 5. Anonymous & Authenticated Users

**Anonymous Users:**
- Generate session ID on first scan
- Store in browser localStorage
- Limited features: Can chat, vote, view threads
- Persistent until logout or browser data clear

**Authenticated Users:**
- Full profile (username, gender, age, avatar)
- Message history across devices
- Access to all future features (gender/age rooms)

**User Object:**
```javascript
{
  id: "user_uuid",
  username: "string" | null,
  is_anonymous: true | false,
  gender: "male" | "female" | "other" | "prefer_not_to_say" | null,
  age: number | null,
  created_at: "timestamp",
  session_id: "for_anonymous_users"
}
```

### 6. AI Integration

**AI Behavior:**
- Monitors all messages with "location_specific_question" tag
- Generates response using:
  1. Fine-tuned model on past Q&A data
  2. Location-specific context (building info, resources)
  3. Vector search on similar past questions

**Training Pipeline:**
```
User votes on messages/AI responses
→ Store feedback in training dataset
→ Batch process weekly
→ Fine-tune model on highly upvoted responses
→ Update vector embeddings
```

**AI Response Schema:**
```javascript
{
  thread_id: "thread_uuid",
  response: "AI generated answer",
  confidence_score: 0.85,
  sources: ["past_thread_123", "location_context_doc"],
  generated_at: "timestamp"
}
```

### 7. Voting Mechanism

**Purpose:**
- Improves AI training quality
- Surfaces best community answers
- Moderates content (future: auto-hide heavily downvoted)

**Implementation:**
```javascript
{
  message_id: "msg_uuid",
  voter_id: "user_uuid_or_session",
  vote_type: "up" | "down",
  timestamp: "timestamp"
}
```

**Rules:**
- 1 vote per user per message
- Can change vote (up → down or vice versa)
- Vote counts update in real-time

---

## Database Schema (Azure Cosmos DB)

### Container Structure

Azure Cosmos DB uses containers (collections) with JSON documents. We'll organize data into these containers:

#### 1. **users** Container
```json
{
  "id": "user_guid",
  "type": "user",
  "username": "johndoe",
  "email": "john@example.com",
  "passwordHash": "bcrypt_hash",
  "isAnonymous": false,
  "sessionId": "session_guid",
  "gender": "male",
  "age": 22,
  "createdAt": "2025-01-08T14:30:00Z",
  "updatedAt": "2025-01-08T14:30:00Z",
  "_partitionKey": "user_guid"
}
```
**Partition Key:** `/id`

#### 2. **locations** Container
```json
{
  "id": "location_guid",
  "type": "location",
  "locationCode": "uni_classroom_A101",
  "name": "University Classroom A101",
  "description": "Main lecture hall",
  "coordinates": {
    "latitude": 40.7128,
    "longitude": -74.0060
  },
  "geofenceRadius": 100,
  "createdAt": "2025-01-08T14:30:00Z",
  "_partitionKey": "location_guid"
}
```
**Partition Key:** `/id`

#### 3. **qr_codes** Container
```json
{
  "id": "qr_guid",
  "type": "qr_code",
  "locationId": "location_guid",
  "qrData": "encrypted_data_string",
  "signature": "hmac_signature",
  "generatedAt": "2025-01-08T00:00:00Z",
  "expiresAt": "2025-01-09T00:00:00Z",
  "isActive": true,
  "_partitionKey": "location_guid"
}
```
**Partition Key:** `/locationId`
**TTL:** Set automatic expiration based on `expiresAt`

#### 4. **rooms** Container
```json
{
  "id": "room_guid",
  "type": "room",
  "locationId": "location_guid",
  "roomType": "main",
  "parentThreadId": null,
  "filterCriteria": {
    "gender": null,
    "ageRange": null
  },
  "createdAt": "2025-01-08T14:30:00Z",
  "isActive": true,
  "_partitionKey": "location_guid"
}
```
**Partition Key:** `/locationId` (enables efficient queries per location)

#### 5. **messages** Container
```json
{
  "id": "message_guid",
  "type": "message",
  "roomId": "room_guid",
  "locationId": "location_guid",
  "userId": "user_guid",
  "content": "Where is the nearest bathroom?",
  "tags": ["location_specific_question"],
  "isThreadStarter": true,
  "parentThreadId": null,
  "votes": {
    "upvotes": 5,
    "downvotes": 0
  },
  "createdAt": "2025-01-08T14:30:00Z",
  "updatedAt": "2025-01-08T14:30:00Z",
  "_partitionKey": "location_guid"
}
```
**Partition Key:** `/locationId` (co-locates all messages for a location)
**Composite Index:** `locationId + createdAt DESC` for pagination

#### 6. **ai_responses** Container
```json
{
  "id": "ai_response_guid",
  "type": "ai_response",
  "messageId": "message_guid",
  "threadId": "thread_guid",
  "locationId": "location_guid",
  "responseText": "The nearest restroom is on the 3rd floor...",
  "confidenceScore": 0.92,
  "modelVersion": "gpt-4",
  "sources": [
    {"type": "context", "id": "location_context_doc"}
  ],
  "votes": {
    "upvotes": 12,
    "downvotes": 1
  },
  "createdAt": "2025-01-08T14:31:00Z",
  "_partitionKey": "location_guid"
}
```
**Partition Key:** `/locationId`

#### 7. **votes** Container
```json
{
  "id": "vote_guid",
  "type": "vote",
  "messageId": "message_guid",
  "aiResponseId": null,
  "voterId": "user_guid",
  "locationId": "location_guid",
  "voteType": "up",
  "createdAt": "2025-01-08T14:32:00Z",
  "_partitionKey": "location_guid",
  "_uniqueConstraint": "messageId_voterId"
}
```
**Partition Key:** `/locationId`
**Unique Index:** Create composite unique constraint on `messageId + voterId`

#### 8. **user_locations** Container (Session Tracking)
```json
{
  "id": "session_guid",
  "type": "user_location",
  "userId": "user_guid",
  "locationId": "location_guid",
  "joinedAt": "2025-01-08T14:30:00Z",
  "leftAt": null,
  "_partitionKey": "location_guid"
}
```
**Partition Key:** `/locationId`
**TTL:** Auto-delete after 24 hours

### Cosmos DB Performance Optimizations

1. **Partition Strategy:** All data partitioned by `locationId` for:
   - Efficient location-based queries
   - Co-location of related data
   - Horizontal scalability

2. **Indexing Policy:**
```json
{
  "indexingMode": "consistent",
  "automatic": true,
  "includedPaths": [
    { "path": "/locationId/?" },
    { "path": "/createdAt/?" },
    { "path": "/tags/*" },
    { "path": "/roomType/?" }
  ],
  "excludedPaths": [
    { "path": "/content/?" },
    { "path": "/responseText/?" }
  ]
}
```

3. **Throughput:**
   - Start with 400 RU/s autoscale
   - Scale up for hackathon demo
   - Monitor with Azure Monitor

---

## System Components

### 1. Authentication Service

**ASP.NET Core Controllers:**

```csharp
[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IConfiguration _configuration;

    [HttpPost("signup")]
    public async Task<ActionResult<AuthResponse>> SignUp([FromBody] SignUpRequest request)
    {
        var user = await _authService.CreateUserAsync(request);
        var token = GenerateJwtToken(user);
        return Ok(new AuthResponse { Token = token, User = user });
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
    {
        var user = await _authService.AuthenticateAsync(request.Email, request.Password);
        if (user == null)
            return Unauthorized("Invalid credentials");

        var token = GenerateJwtToken(user);
        return Ok(new AuthResponse { Token = token, User = user });
    }

    [HttpPost("anonymous")]
    public async Task<ActionResult<AuthResponse>> CreateAnonymousSession()
    {
        var user = await _authService.CreateAnonymousUserAsync();
        var token = GenerateJwtToken(user);
        return Ok(new AuthResponse { Token = token, User = user });
    }

    [HttpPost("convert-anonymous")]
    [Authorize]
    public async Task<ActionResult<AuthResponse>> ConvertAnonymous(
        [FromBody] ConvertAnonymousRequest request)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var user = await _authService.ConvertAnonymousToFullAsync(userId, request);
        var token = GenerateJwtToken(user);
        return Ok(new AuthResponse { Token = token, User = user });
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<User>> GetCurrentUser()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var user = await _authService.GetUserByIdAsync(userId);
        return Ok(user);
    }

    private string GenerateJwtToken(User user)
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id),
            new Claim("is_anonymous", user.IsAnonymous.ToString()),
            new Claim("session_id", user.SessionId ?? "")
        };

        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(24),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
```

### 2. QR Code Service

**ASP.NET Core Controller:**

```csharp
[ApiController]
[Route("api/[controller]")]
public class QrController : ControllerBase
{
    private readonly IQrCodeService _qrService;
    private readonly ILocationService _locationService;

    [HttpPost("verify")]
    public async Task<ActionResult<QrVerificationResponse>> VerifyQrCode(
        [FromBody] QrVerificationRequest request)
    {
        var qrCode = await _qrService.VerifyQrCodeAsync(request.QrData);

        if (qrCode == null || !qrCode.IsActive || qrCode.ExpiresAt < DateTime.UtcNow)
            return BadRequest("Invalid or expired QR code");

        var location = await _locationService.GetLocationAsync(qrCode.LocationId);
        var room = await _qrService.GetOrCreateRoomForLocationAsync(qrCode.LocationId);

        return Ok(new QrVerificationResponse
        {
            LocationId = location.Id,
            LocationName = location.Name,
            RoomId = room.Id,
            IsValid = true
        });
    }

    [HttpGet("generate/{locationId}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<QrCode>> GenerateQrCode(string locationId)
    {
        var qrCode = await _qrService.GenerateQrCodeAsync(locationId);
        return Ok(qrCode);
    }
}

// Background service for daily QR generation
public class QrCodeGenerationService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            var now = DateTime.UtcNow;
            var midnight = now.Date.AddDays(1);
            var delay = midnight - now;

            await Task.Delay(delay, stoppingToken);

            using var scope = _serviceProvider.CreateScope();
            var qrService = scope.ServiceProvider.GetRequiredService<IQrCodeService>();
            var locationService = scope.ServiceProvider.GetRequiredService<ILocationService>();

            var locations = await locationService.GetAllLocationsAsync();

            foreach (var location in locations)
            {
                await qrService.GenerateQrCodeAsync(location.Id);
            }
        }
    }
}
```

### 3. Location Service

**ASP.NET Core Controller:**

```csharp
[ApiController]
[Route("api/[controller]")]
public class LocationsController : ControllerBase
{
    private readonly ILocationService _locationService;

    [HttpGet]
    public async Task<ActionResult<List<Location>>> GetAllLocations()
    {
        var locations = await _locationService.GetAllLocationsAsync();
        return Ok(locations);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Location>> GetLocation(string id)
    {
        var location = await _locationService.GetLocationAsync(id);
        if (location == null)
            return NotFound();

        return Ok(location);
    }

    [HttpPost("verify-proximity")]
    public async Task<ActionResult<ProximityVerificationResponse>> VerifyProximity(
        [FromBody] ProximityVerificationRequest request)
    {
        var location = await _locationService.GetLocationAsync(request.LocationId);
        if (location == null)
            return NotFound("Location not found");

        var isWithin = GeofenceHelper.IsWithinGeofence(
            request.UserLatitude,
            request.UserLongitude,
            location.Coordinates.Latitude,
            location.Coordinates.Longitude,
            location.GeofenceRadius
        );

        if (isWithin)
        {
            var room = await _locationService.GetMainRoomForLocationAsync(request.LocationId);
            return Ok(new ProximityVerificationResponse
            {
                AccessGranted = true,
                RoomId = room.Id,
                LocationName = location.Name
            });
        }

        return StatusCode(403, new { error = "Outside geofence radius" });
    }
}
```

### 4. Chat Service (SignalR)

**SignalR Hub Implementation:**

```csharp
public class ChatHub : Hub
{
    private readonly IMessageService _messageService;
    private readonly IRoomService _roomService;
    private readonly IAiService _aiService;
    private readonly ILogger<ChatHub> _logger;

    public async Task JoinRoom(string roomId, string accessToken)
    {
        try
        {
            var user = await ValidateTokenAsync(accessToken);
            var hasAccess = await _roomService.CheckRoomAccessAsync(user.Id, roomId);

            if (!hasAccess)
            {
                await Clients.Caller.SendAsync("Error", "Access denied to room");
                return;
            }

            await Groups.AddToGroupAsync(Context.ConnectionId, roomId);

            // Notify others in room
            await Clients.OthersInGroup(roomId).SendAsync("UserJoined", new
            {
                Username = user.Username ?? "Anonymous",
                UserId = user.Id
            });

            // Send message history to joining user
            var messages = await _messageService.GetRecentMessagesAsync(roomId, 50);
            await Clients.Caller.SendAsync("MessageHistory", messages);

            _logger.LogInformation($"User {user.Id} joined room {roomId}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in JoinRoom");
            await Clients.Caller.SendAsync("Error", "Failed to join room");
        }
    }

    public async Task LeaveRoom(string roomId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, roomId);
        await Clients.OthersInGroup(roomId).SendAsync("UserLeft", Context.ConnectionId);
    }

    public async Task SendMessage(string roomId, string content, List<string> tags, string accessToken)
    {
        try
        {
            var user = await ValidateTokenAsync(accessToken);

            var message = await _messageService.CreateMessageAsync(new CreateMessageRequest
            {
                RoomId = roomId,
                UserId = user.Id,
                Content = content,
                Tags = tags
            });

            // Broadcast to all in room
            await Clients.Group(roomId).SendAsync("MessageReceived", message);

            // Check if thread should be created
            if (tags?.Contains("location_specific_question") == true)
            {
                var thread = await _messageService.CreateThreadAsync(message);
                await Clients.Group(roomId).SendAsync("ThreadCreated", thread);

                // Trigger AI response asynchronously
                _ = Task.Run(async () => await _aiService.GenerateResponseAsync(thread.Id, message));
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in SendMessage");
            await Clients.Caller.SendAsync("Error", "Failed to send message");
        }
    }

    public async Task VoteMessage(string messageId, string voteType, string accessToken)
    {
        var user = await ValidateTokenAsync(accessToken);
        var vote = await _messageService.VoteMessageAsync(messageId, user.Id, voteType);

        var message = await _messageService.GetMessageAsync(messageId);
        await Clients.Group(message.RoomId).SendAsync("VoteUpdated", new
        {
            MessageId = messageId,
            Upvotes = message.Votes.Upvotes,
            Downvotes = message.Votes.Downvotes
        });
    }

    public override async Task OnDisconnectedAsync(Exception exception)
    {
        _logger.LogInformation($"Client disconnected: {Context.ConnectionId}");
        await base.OnDisconnectedAsync(exception);
    }
}
```

**SignalR Client (Next.js):**

```typescript
// lib/signalr.ts
import * as signalR from '@microsoft/signalr';

export class ChatClient {
  private connection: signalR.HubConnection;

  constructor(accessToken: string) {
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(`${process.env.NEXT_PUBLIC_API_URL}/hubs/chat`, {
        accessTokenFactory: () => accessToken
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.connection.on('MessageReceived', (message) => {
      console.log('New message:', message);
      // Handle in React state
    });

    this.connection.on('ThreadCreated', (thread) => {
      console.log('New thread:', thread);
    });

    this.connection.on('AiResponse', (response) => {
      console.log('AI response:', response);
    });

    this.connection.on('VoteUpdated', (data) => {
      console.log('Vote updated:', data);
    });

    this.connection.on('Error', (error) => {
      console.error('SignalR error:', error);
    });
  }

  async start() {
    await this.connection.start();
  }

  async joinRoom(roomId: string, accessToken: string) {
    await this.connection.invoke('JoinRoom', roomId, accessToken);
  }

  async sendMessage(roomId: string, content: string, tags: string[], accessToken: string) {
    await this.connection.invoke('SendMessage', roomId, content, tags, accessToken);
  }

  async voteMessage(messageId: string, voteType: 'up' | 'down', accessToken: string) {
    await this.connection.invoke('VoteMessage', messageId, voteType, accessToken);
  }

  async leaveRoom(roomId: string) {
    await this.connection.invoke('LeaveRoom', roomId);
  }

  stop() {
    this.connection.stop();
  }
}
```

### 5. AI Service

**Components:**
- **Response Generator:** Generates answers to questions
- **Training Pipeline:** Processes votes and updates model
- **Context Manager:** Retrieves relevant context from vector DB

**AI Service Implementation:**

```csharp
public class AiService : IAiService
{
    private readonly OpenAIClient _openAiClient;
    private readonly ICosmosDbService _cosmosDb;
    private readonly IHubContext<ChatHub> _chatHub;
    private readonly IConfiguration _configuration;

    public async Task GenerateResponseAsync(string threadId, Message originalMessage)
    {
        try
        {
            // 1. Get context
            var location = await GetLocationForThreadAsync(threadId);
            var similarQuestions = await VectorSearchAsync(originalMessage.Content);

            // 2. Build context
            var contextText = BuildContext(location, similarQuestions);

            // 3. Generate response using Azure OpenAI
            var chatCompletionsOptions = new ChatCompletionsOptions
            {
                DeploymentName = "gpt-4",
                Messages =
                {
                    new ChatRequestSystemMessage(
                        $"You are a helpful AI assistant for {location.Name}. " +
                        $"Answer questions about this location based on the context provided. " +
                        $"Context: {contextText}"
                    ),
                    new ChatRequestUserMessage(originalMessage.Content)
                },
                Temperature = 0.7f,
                MaxTokens = 500
            };

            var response = await _openAiClient.GetChatCompletionsAsync(chatCompletionsOptions);
            var aiResponseText = response.Value.Choices[0].Message.Content;

            // 4. Store response in Cosmos DB
            var aiResponse = new AiResponse
            {
                Id = Guid.NewGuid().ToString(),
                MessageId = originalMessage.Id,
                ThreadId = threadId,
                LocationId = location.Id,
                ResponseText = aiResponseText,
                ModelVersion = "gpt-4",
                ConfidenceScore = 0.85,
                CreatedAt = DateTime.UtcNow
            };

            await _cosmosDb.CreateItemAsync(aiResponse, "ai_responses");

            // 5. Broadcast to SignalR clients
            await _chatHub.Clients.Group(threadId).SendAsync("AiResponse", aiResponse);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error generating AI response: {ex.Message}");
        }
    }

    private async Task<List<Message>> VectorSearchAsync(string query)
    {
        // Use Azure Cosmos DB Vector Search or Azure AI Search
        // For now, simplified example
        var queryEmbedding = await GetEmbeddingAsync(query);

        // Query Cosmos DB with vector similarity
        // This requires Cosmos DB vector search feature
        var similarMessages = await _cosmosDb.VectorSearchAsync(
            "messages",
            queryEmbedding,
            limit: 5
        );

        return similarMessages;
    }

    private async Task<float[]> GetEmbeddingAsync(string text)
    {
        var embeddingsOptions = new EmbeddingsOptions("text-embedding-ada-002", new[] { text });
        var response = await _openAiClient.GetEmbeddingsAsync(embeddingsOptions);
        return response.Value.Data[0].Embedding.ToArray();
    }
}
```

---

## API Design

### REST Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Create user account |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/anonymous` | Create anonymous session |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/qr/verify` | Verify QR code |
| GET | `/api/locations` | List all locations |
| POST | `/api/locations/verify-proximity` | Check geofence |
| GET | `/api/rooms/:location_id` | Get room for location |
| GET | `/api/messages/:room_id` | Get messages in room |
| POST | `/api/messages` | Create message |
| POST | `/api/votes` | Vote on message/AI response |
| GET | `/api/threads/:thread_id` | Get thread details |

---

## Security & Privacy

### 1. Anonymous User Privacy
- No PII collected for anonymous users
- Session IDs rotated regularly
- No tracking across sessions

### 2. Authentication
- Passwords hashed with bcrypt (12 rounds)
- JWT tokens expire after 24 hours
- Refresh token mechanism for long sessions

### 3. Location Privacy
- Location data never stored permanently
- Only used for real-time verification
- User can deny location access (QR only)

### 4. Rate Limiting
- Message sending: 10/minute per user
- QR scanning: 5/minute per device
- API calls: 100/minute per IP

### 5. Content Moderation
- Profanity filter on messages
- Report mechanism (future)
- Auto-hide heavily downvoted content
- Admin dashboard for moderation

### 6. Data Encryption
- HTTPS only (TLS 1.3)
- Database encryption at rest
- Sensitive fields encrypted (future: end-to-end for DMs)

---

## Implementation Phases

### Phase 1: MVP (Hackathon Demo) - 24-48 hours

**Core Features:**
- QR code generation & scanning (web-based via browser camera)
- Basic authentication (email/password + anonymous)
- Single location chatroom with real-time messaging
- Basic Next.js web UI with Tailwind CSS
- Location verification (QR primary, geofence optional)

**Tech Setup:**
- Next.js 14+ with Tailwind CSS for frontend
- ASP.NET Core 8.0 Web API for backend
- Azure SignalR Service for real-time messaging
- Azure Cosmos DB (NoSQL)
- Azure App Service for hosting
- Deploy: Frontend to Vercel/Azure Static Web Apps, Backend to Azure App Service

**Deliverables:**
- Working demo video
- Live deployed web app
- GitHub repository
- Pitch presentation

### Phase 2: AI Integration - Week 1-2

**Features:**
- Threading system with tags
- OpenAI integration for responses
- Voting mechanism
- Basic AI training pipeline

### Phase 3: Enhanced Features - Week 3-4

**Features:**
- User profiles with gender/age
- Gender/age-specific rooms
- Message search & history
- Push notifications
- Advanced AI fine-tuning

### Phase 4: Scale & Polish - Month 2+

**Features:**
- Performance optimization
- Advanced moderation
- Analytics dashboard
- Multi-language support
- Accessibility features
- App store deployment

---

## AI Integration Details

### Training Data Structure

```javascript
{
  question: "Where is the nearest bathroom?",
  location_id: "uni_building_main",
  context: "University Main Building, 3rd Floor",
  ai_response: "The nearest restroom is on the 3rd floor, near room 301.",
  upvotes: 15,
  downvotes: 1,
  human_responses: [
    {
      content: "Just down the hall from the elevator",
      upvotes: 8
    }
  ],
  timestamp: "2025-01-08T14:30:00Z"
}
```

### Vector Database Schema

**Embeddings Storage:**
- Each message/question → embedding vector (1536 dimensions for OpenAI)
- Store in Pinecone/Weaviate with metadata
- Search for similar questions when new query arrives

### Fine-tuning Workflow

```
1. Collect high-quality Q&A pairs (upvotes > 10)
2. Format for training:
   [
     {"role": "system", "content": "You are a helpful assistant for [location]"},
     {"role": "user", "content": "question"},
     {"role": "assistant", "content": "best_response"}
   ]
3. Fine-tune model monthly
4. A/B test new model vs. old
5. Deploy if performance improves
```

---

## Future Enhancements

### Near-term (3-6 months)
- Direct messaging between users
- Event announcements by admins
- Integration with campus systems (class schedules, events)
- Bluetooth beacon support for indoor locations
- Gamification (reputation points, badges)
- Progressive Web App (PWA) for mobile experience

### Long-term (6-12 months)
- Multi-city expansion
- Community marketplace
- Resource sharing (notes, study materials)
- Video/voice chat in threads
- Integration with university LMS
- Native mobile apps (React Native)
- Push notifications

---

## Metrics & KPIs

### User Engagement
- Daily Active Users (DAU)
- Messages per user per session
- Average session duration
- QR scan to chat conversion rate

### AI Performance
- Response accuracy (measured by upvotes)
- Response time (< 3 seconds)
- Thread resolution rate
- User satisfaction score

### Technical
- API response time (< 200ms p95)
- SignalR connection stability (> 99%)
- Cosmos DB query performance (RU consumption)
- Error rate (< 0.1%)

---

## Development Timeline (Hackathon Focus)

### Day 1
**Morning (4 hours):**
- Azure resource provisioning (Cosmos DB, App Service, SignalR)
- ASP.NET Core project setup with authentication
- Cosmos DB containers and initial data seeding
- Basic API endpoints (auth, locations)

**Afternoon (4 hours):**
- QR code generation system implementation
- SignalR Hub setup for real-time chat
- Next.js project initialization with Tailwind
- Basic UI components (landing, login, chat interface)

### Day 2
**Morning (4 hours):**
- Complete SignalR client integration in Next.js
- QR scanner implementation (web camera API)
- Geolocation verification system
- Anonymous user flow
- Message threading UI

**Afternoon (4 hours):**
- Azure OpenAI integration for Q&A
- Voting mechanism implementation
- Testing & bug fixes
- Deploy to Azure (backend + frontend)
- Create demo video & finalize presentation

---

## Conclusion

This Social App leverages location-based technology to create inclusive, safe community spaces where people can connect, ask questions, and receive AI-assisted support. The QR code + geofencing approach ensures authentic, location-specific interactions while maintaining user privacy through anonymous options.

**Platform:** Web-first approach (Next.js) accessible on any device with a browser. Mobile apps are a future enhancement—the hackathon MVP focuses on a responsive web application that works seamlessly on phones, tablets, and desktops.

**Key Innovations:**
1. **Physical-Digital Bridge:** QR codes create seamless entry to digital communities
2. **Privacy-First:** Anonymous participation encourages open communication
3. **AI-Human Collaboration:** AI learns from community to provide better answers
4. **Hyperlocal Focus:** Every location has its own context and community

**Hackathon Pitch:**
"Social App makes every physical space a connected community. Whether you're in a classroom, library, or public square, scan the QR code from your phone's browser to instantly join conversations, ask questions, and get help from both your peers and AI—all while staying completely anonymous if you choose. We're making cities more inclusive and connected, one location at a time."

---

## Quick Start Commands

### Backend Setup (C# / ASP.NET Core)

```bash
# Navigate to backend
cd backend

# Restore packages
dotnet restore

# Set up user secrets for local development
dotnet user-secrets init
dotnet user-secrets set "CosmosDb:ConnectionString" "your_cosmos_connection_string"
dotnet user-secrets set "AzureOpenAI:ApiKey" "your_openai_key"
dotnet user-secrets set "Jwt:Key" "your_jwt_secret_key"

# Run migrations (if using EF Core for admin data)
dotnet ef database update

# Run the application
dotnet run

# Or with hot reload
dotnet watch run
```

### Frontend Setup (Next.js)

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install
# or
yarn install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API URLs

# Run development server
npm run dev
# or
yarn dev

# Build for production
npm run build
npm start
```

### Azure Setup

```bash
# Install Azure CLI
# macOS: brew install azure-cli
# Windows: Download from Microsoft

# Login to Azure
az login

# Create resource group
az group create --name SocialAppRG --location eastus

# Create Cosmos DB account
az cosmosdb create \
  --name socialapp-cosmosdb \
  --resource-group SocialAppRG

# Create App Service Plan
az appservice plan create \
  --name SocialAppPlan \
  --resource-group SocialAppRG \
  --sku B1

# Create Web App
az webapp create \
  --name socialapp-backend \
  --resource-group SocialAppRG \
  --plan SocialAppPlan \
  --runtime "DOTNET|8.0"

# Create SignalR Service
az signalr create \
  --name socialapp-signalr \
  --resource-group SocialAppRG \
  --sku Standard_S1
```

### Docker Setup (Optional)

```bash
# Backend Dockerfile
docker build -t socialapp-backend ./backend
docker run -p 5000:5000 socialapp-backend

# Frontend Dockerfile
docker build -t socialapp-frontend ./frontend
docker run -p 3000:3000 socialapp-frontend

# Using Docker Compose
docker-compose up
```

---

**Document Version:** 1.0
**Last Updated:** 2025-01-08
**Author:** Social App Team
