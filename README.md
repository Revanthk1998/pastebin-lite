# Pastebin Lite

Pastebin Lite is a small Pastebin-like web application that allows users to create text pastes and share a link to view them.
It supports optional time-based expiry (TTL) and view-count limits with persistent storage.

This project was built as a take-home assignment and is deployed on Vercel.

## Live Deployment

https://pastebin-lite-snowy-alpha.vercel.app

## Features

- Create a paste containing arbitrary text
- Receive a shareable URL for each paste
- View pastes via a public HTML page
- Optional constraints per paste:
  - Time-to-live (TTL in seconds)
  - Maximum view count
- Paste becomes unavailable once any constraint is exceeded
- Deterministic expiry support for automated testing
- Persistent storage using MongoDB

## Tech Stack

- Framework: Next.js (Pages Router)
- Language: TypeScript
- Database: MongoDB Atlas
- Deployment: Vercel

## API Routes

### Health Check
GET /api/healthz

Response:
{ "ok": true }

### Create a Paste
POST /api/pastes

Request body:
{
  "content": "string",
  "ttl_seconds": 60,
  "max_views": 5
}

### Fetch a Paste (API)
GET /api/pastes/:id

Response:
{
  "content": "string",
  "remaining_views": 4,
  "expires_at": "2026-01-01T00:00:00.000Z"
}

Returns 404 if the paste is missing, expired, or view limit exceeded.

### View a Paste (HTML)
GET /p/:id

Returns an HTML page containing the paste content.
Returns 404 if unavailable.

## Deterministic Time for Testing

If TEST_MODE=1 is set, the request header:
x-test-now-ms: <milliseconds since epoch>
is used as the current time for expiry logic.

## Persistence Layer

MongoDB Atlas is used for persistence to ensure data survives across serverless requests.

## Running Locally

1. Install dependencies:
npm install

2. Create a .env.local file:
MONGODB_URI=your_mongodb_connection_string
NEXT_PUBLIC_BASE_URL=http://localhost:3000

3. Run the app:
npm run dev

## Design Decisions

- API layer enforces TTL and view limits
- MongoDB atomic updates prevent race conditions
- No in-memory global state
- No secrets committed

## Assignment Compliance

- All required routes implemented
- TTL and view limits enforced
- Deterministic expiry supported
- Persistent storage used
- Deployed and publicly accessible

## Author

Revanth Kolluru
 