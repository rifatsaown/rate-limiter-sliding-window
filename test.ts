import * as http from 'http';

/**
 * Interface for the HTTP response result
 */
interface RequestResult {
  status?: number;
  body?: string;
  error?: string;
}

/**
 * Makes an HTTP GET request to the rate limited server
 * Wraps the request in a Promise for easier async/await handling
 *
 * @returns Promise resolving to the response status code, body, or error message
 */
function makeRequest(): Promise<RequestResult> {
  return new Promise((resolve) => {
    // Make GET request to the local server on port 3000
    const req = http.get('http://localhost:3000/', (res) => {
      let data: string = '';

      // Accumulate response data chunks
      res.on('data', (chunk: Buffer) => (data += chunk));

      // When response ends, resolve with status code and body
      res.on('end', () =>
        resolve({
          status: res.statusCode,
          body: data,
        }),
      );
    });

    // Handle request errors
    req.on('error', (err: Error) =>
      resolve({
        error: err.message,
      }),
    );
  });
}

/**
 * Main test function
 * Sends 7 requests in quick succession to test the rate limiter
 * The first 5 should succeed (within limit), and requests 6-7 should be rate limited
 */
async function test(): Promise<void> {
  console.log('Testing rate limiter...\n');

  // Send 7 requests with a small 100ms delay between each
  for (let i: number = 1; i <= 7; i++) {
    const result: RequestResult = await makeRequest();

    // Display the result of each request
    console.log(
      `Request ${i}: Status ${result.status} - ${result.body || result.error}`,
    );

    // Wait 100ms before making the next request
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}

// Execute the test function
test();
