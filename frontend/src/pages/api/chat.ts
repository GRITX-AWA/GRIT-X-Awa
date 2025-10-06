import type { APIRoute } from 'astro';

// In-memory storage for rate limiting (resets on deployment)
// For production, use Redis or a database
const messageCount: Map<string, { count: number; resetTime: number }> = new Map();

const MAX_MESSAGES_PER_DAY = 20;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function getClientIP(request: Request): string {
  // Try to get real IP from headers (Vercel provides these)
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  // Fallback (shouldn't happen on Vercel)
  return 'unknown';
}

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const userLimit = messageCount.get(ip);
  
  // If no record or past reset time, reset the counter
  if (!userLimit || now > userLimit.resetTime) {
    messageCount.set(ip, {
      count: 1,
      resetTime: now + ONE_DAY_MS
    });
    return { allowed: true, remaining: MAX_MESSAGES_PER_DAY - 1 };
  }
  
  // Check if user has exceeded limit
  if (userLimit.count >= MAX_MESSAGES_PER_DAY) {
    return { allowed: false, remaining: 0 };
  }
  
  // Increment count
  userLimit.count++;
  messageCount.set(ip, userLimit);
  
  return { allowed: true, remaining: MAX_MESSAGES_PER_DAY - userLimit.count };
}

export const POST: APIRoute = async ({ request }) => {
  try {
    // Get client IP
    const clientIP = getClientIP(request);
    
    // Check rate limit
    const rateLimit = checkRateLimit(clientIP);
    
    if (!rateLimit.allowed) {
      return new Response(
        JSON.stringify({
          error: 'Rate limit exceeded',
          message: 'You have reached the maximum of 20 messages per day. Please try again tomorrow.',
          remaining: 0
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': MAX_MESSAGES_PER_DAY.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': messageCount.get(clientIP)?.resetTime.toString() || ''
          }
        }
      );
    }
    
    // Parse request body
    const body = await request.json();
    const { messages } = body;
    
    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'Invalid request: messages array required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Get API key from environment variable (server-side only)
    // Astro automatically loads .env files and exposes them via import.meta.env
    const apiKey = import.meta.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      console.error('❌ OPENAI_API_KEY not found!');
      console.error('📁 Current directory:', process.cwd());
      console.error('📁 For local dev: Ensure .env file exists in frontend/ directory');
      console.error('📝 File should contain: OPENAI_API_KEY=sk-proj-...');
      console.error('🔄 After adding .env file, RESTART the dev server');
      console.error('📊 Available env vars:', Object.keys(import.meta.env).filter(k => !k.startsWith('_')).join(', '));
      return new Response(
        JSON.stringify({ 
          error: 'Server configuration error',
          message: 'OpenAI API key is not configured. Please ensure OPENAI_API_KEY is set in your .env file and restart the server.',
          debug: process.env.NODE_ENV === 'development' ? {
            availableVars: Object.keys(import.meta.env).filter(k => !k.startsWith('_')),
            cwd: process.cwd()
          } : undefined
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('✅ API key found (length: ' + apiKey.length + '), making request to OpenAI...');
    
    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('OpenAI API error:', response.status, errorData);
      return new Response(
        JSON.stringify({
          error: 'OpenAI API error',
          details: errorData
        }),
        {
          status: response.status,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    const data = await response.json();
    
    // Return response with rate limit headers
    return new Response(
      JSON.stringify({
        ...data,
        rateLimit: {
          remaining: rateLimit.remaining,
          limit: MAX_MESSAGES_PER_DAY
        }
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': MAX_MESSAGES_PER_DAY.toString(),
          'X-RateLimit-Remaining': rateLimit.remaining.toString()
        }
      }
    );
    
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};
