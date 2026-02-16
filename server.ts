import * as http from 'http';

// Configuration for rate limiting
/** Time window for rate limiting in milliseconds (1 minute) */
const rateLimitWindowMs: number = 60 * 1000;

/** Maximum number of requests allowed per time window */
const maxRequestsPerWindow: number = 5;

/**
 * Data structure to store request timestamps for each IP address
 * Key: IP address as string
 * Value: Array of timestamp numbers when requests were made
 */
const ipRequests: Record<string, number[]> = {};

/**
 * Rate limiting middleware function
 * Implements sliding window algorithm to track and limit requests per IP
 *
 * @param req - HTTP incoming request object
 * @param res - HTTP response object
 * @returns boolean - true if request is allowed, false if rate limit exceeded
 */
const rateLimitMiddleware = (
  req: http.IncomingMessage,
  res: http.ServerResponse,
): boolean => {
  // Extract client IP address from the request
  const ip: string = req.socket.remoteAddress || 'unknown';

  // Get current timestamp in milliseconds
  const currentTime: number = Date.now();

  // Initialize empty timestamp array if this IP is making a request for the first time
  if (!ipRequests[ip]) {
    ipRequests[ip] = [];
  }

  // Remove timestamps that are outside the current sliding window
  // This keeps only the requests that fall within the rateLimitWindowMs
  ipRequests[ip] = ipRequests[ip].filter((timestamp: number) => {
    return currentTime - timestamp < rateLimitWindowMs;
  });

  // Check if the current request count exceeds the maximum allowed per window
  if (ipRequests[ip].length >= maxRequestsPerWindow) {
    // Too many requests: respond with 429 (Too Many Requests) status code
    res.statusCode = 429;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Too many requests. Try again later.');
    return false; // Reject the request
  } else {
    // Request is allowed: add the current timestamp to track this request
    ipRequests[ip].push(currentTime);
    return true; // Allow the request to proceed
  }
};

/**
 * Create HTTP server with rate limiting middleware
 * Requests are rate limited using a sliding window algorithm per IP address
 */
const server = http.createServer(
  (req: http.IncomingMessage, res: http.ServerResponse) => {
    // Apply rate limiting middleware and reject request if limit exceeded
    if (!rateLimitMiddleware(req, res)) return;

    // Request is allowed: send successful response
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Hello, world!');
  },
);

// Start the server on port 3000
server.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});
