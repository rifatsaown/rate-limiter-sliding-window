# Rate Limiter - Sliding Window

A Node.js HTTP server implementing a **sliding window rate limiting algorithm** in TypeScript. This project limits the number of requests per IP address within a configurable time window.

## Overview

This rate limiter uses a sliding window approach to track and limit API requests. Each IP address can make a maximum number of requests within a rolling time window. Once the limit is exceeded, subsequent requests are rejected with a **429 (Too Many Requests)** status code.

## Algorithm: Sliding Window

The sliding window algorithm maintains a list of request timestamps for each IP address:

1. **Track requests**: Store the timestamp of each incoming request
2. **Clean old requests**: Remove timestamps outside the current time window
3. **Check limit**: If the number of remaining timestamps >= max requests, reject the request
4. **Allow/Reject**: Either add the new request timestamp or return 429 error

**Benefits:**
- More accurate than fixed-window counters
- No boundary conditions causing request spikes
- Real-time limiting granularity

## Project Structure

```
rate-limiter-sliding-window/
├── server.ts           # HTTP server with rate limiting middleware
├── test.ts             # Test script to verify rate limiter
├── package.json        # Project dependencies and scripts
├── tsconfig.json       # TypeScript configuration
└── README.md          # This file
```

## Configuration

Edit the rate limiting parameters in [server.ts](server.ts):

```typescript
const rateLimitWindowMs = 60 * 1000;      // Time window: 1 minute
const maxRequestsPerWindow = 5;           // Max requests per window
```

## Installation

### Prerequisites
- Node.js (v18 or higher)
- pnpm (recommended) or npm

### Setup

1. Clone or download the project
2. Install dependencies:

```bash
pnpm install
```

## Usage

### Start the Server

```bash
pnpm start
```

The server will run on `http://localhost:3000`

### Run Tests

In a separate terminal, test the rate limiter:

```bash
pnpm test
```

#### Expected Test Output

With default settings (5 requests per minute):
- Requests 1-5: **Status 200** ✓ (allowed)
- Requests 6-7: **Status 429** ✗ (rate limited)

```
Testing rate limiter...

Request 1: Status 200 - Hello, world!
Request 2: Status 200 - Hello, world!
Request 3: Status 200 - Hello, world!
Request 4: Status 200 - Hello, world!
Request 5: Status 200 - Hello, world!
Request 6: Status 429 - Too many requests. Try again later.
Request 7: Status 429 - Too many requests. Try again later.
```

## API Endpoints

### GET /

Returns a simple "Hello, world!" response if within rate limit.

**Success Response (200):**
```
Hello, world!
```

**Rate Limited Response (429):**
```
Too many requests. Try again later.
```

## Implementation Details

### Rate Limit Middleware

The `rateLimitMiddleware` function:
1. Extracts the client's IP address from the request
2. Filters out old request timestamps (outside the window)
3. Checks if the request count exceeds the limit
4. Returns `true` to allow or `false` to reject

### Data Structure

```typescript
const ipRequests: Record<string, number[]> = {
  '127.0.0.1': [timestamp1, timestamp2, ...],
  '192.168.1.100': [timestamp3, timestamp4, ...],
  // ... other IPs
}
```

## TypeScript Features

- Full type safety with strict mode enabled
- Interface-based response handling
- JSDoc documentation for all functions
- Proper module imports/exports

## Development

### Run in Watch Mode

For development with auto-reload:

```bash
pnpm dev
```

### Compile TypeScript

```bash
npx tsc
```

Output will be in the `dist/` directory.

## Limitations

- **In-memory storage**: Request data is lost on server restart
- **Single-instance**: Not suitable for multi-process/distributed systems
- **Per-IP tracking**: Doesn't support user-level or API-key-level rate limiting

## Future Enhancements

- [ ] Redis backend for distributed rate limiting
- [ ] User/API-key based rate limiting
- [ ] Configurable rate limit headers
- [ ] Multiple middleware configurations
- [ ] Rate limit metrics and analytics

## License

ISC

## Author

Created as a learning resource for rate limiting algorithms.
