# Pastebin Lite

Pastebin Lite is a small Pastebin-like web application that allows users to create text pastes and share a link to view them.
It supports optional time-based expiry (TTL) and view-count limits, with persistent storage.

This project was built as a take-home assignment and is deployed on Vercel.

--------------------------------------------------

LIVE DEPLOYMENT

Deployed URL:
https://pastebin-lite-snowy-alpha.vercel.app

--------------------------------------------------

FEATURES

- Create a paste containing arbitrary text
- Receive a shareable URL for each paste
- View pastes via a public HTML page
- Optional constraints per paste:
  - Time-to-live (TTL in seconds)
  - Maximum view count
- Paste becomes unavailable once any constraint is exceeded
- Deterministic expiry support for automated testing
- Persistent storage using MongoDB

--------------------------------------------------

TECH STACK

Framework: Next.js (Pages Router)
Language: TypeScript
Database: MongoDB (MongoDB Atlas)
Deployment: Vercel

--------------------------------------------------

API ROUTES

Health Check
GET /api/healthz

Returns application health and database connectivity status.

Response:
{ "ok": true }

--------------------------------------------------

Create a Paste
POST /api/pastes

Request Body:
{
  "content": "string",
  "ttl_seconds": 60,
  "max_views": 5
}

Rules:
- content is required and must be a non-empty string
- ttl_seconds (optional) must be an integer ≥ 1
- max_views (optional) must be an integer ≥ 1

Response:
{
  "id": "string",
  "url": "https://pastebin-lite-snowy-alpha.vercel.app/p/<id>"
}

Invalid input returns a 4xx status with a JSON error body.

--------------------------------------------------

Fetch a Paste (API)
GET /api/pastes/:id

Each successful API fetch counts as one view.

Successful Response:
{
  "content": "string",
  "remaining_views": 4,
  "expires_at": "2026-01-01T00:00:00.000Z"
}

Notes:
- remaining_views is null if unlimited
- expires_at is null if no TTL

Unavailable cases (HTTP 404):
- Paste does not exist
- Paste has expired
- View limit exceeded

--------------------------------------------------

View a Paste (HTML)
GET /p/:id

- Returns an HTML page containing the paste content
- Content is rendered safely (no script execution)
- Returns HTTP 404 if the paste is unavailable

--------------------------------------------------

DETERMINISTIC TIME FOR TESTING

If the environment variable below is set:
TEST_MODE=1

Then the request header:
x-test-now-ms: <milliseconds since epoch>

is treated as the current time for expiry logic only.
If the header is absent, real system time is used.

--------------------------------------------------

PERSISTENCE LAYER

MongoDB Atlas is used as the persistence layer.
Ensures data survives across serverless requests.

Each paste stores:
- content
- creation time
- optional expiry time
- max view limit
- current view count

--------------------------------------------------

RUNNING THE APP LOCALLY

Prerequisites:
- Node.js 18+
- MongoDB Atlas connection string

Setup:
npm install

Create a .env.local file:
MONGODB_URI=your_mongodb_connection_string
NEXT_PUBLIC_BASE_URL=http://localhost:3000

Run the app:
npm run dev

--------------------------------------------------

DESIGN DECISIONS

- Uses Next.js Pages Router for stable API routing and typing
- API layer is the single source of truth for TTL and view limits
- MongoDB atomic updates ensure view counts are concurrency-safe
- No global mutable in-memory state (safe for serverless)
- No secrets or credentials committed to the repository

--------------------------------------------------

ASSIGNMENT COMPLIANCE

- All required routes implemented
- Correct HTTP status codes and JSON responses
- TTL and view-count constraints fully enforced
- Deterministic expiry testing supported
- Persistent storage used
- Deployed and publicly accessible
- Repository structure and code quality requirements satisfied

--------------------------------------------------

AUTHOR

Revanth Kolluru
