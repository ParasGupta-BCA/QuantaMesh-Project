import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// 1x1 transparent GIF pixel
const TRACKING_PIXEL = new Uint8Array([
  0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00,
  0x80, 0x00, 0x00, 0xff, 0xff, 0xff, 0x00, 0x00, 0x00, 0x21,
  0xf9, 0x04, 0x01, 0x00, 0x00, 0x00, 0x00, 0x2c, 0x00, 0x00,
  0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0x02, 0x02, 0x44,
  0x01, 0x00, 0x3b
]);

// In-memory rate limiting store
// Map: IP -> { count: number, windowStart: number }
const rateLimitStore = new Map<string, { count: number; windowStart: number }>();

// Rate limit configuration
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute window
const RATE_LIMIT_MAX_REQUESTS = 100; // Max 100 requests per IP per minute

// Clean up old entries periodically (prevent memory leak)
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // Every 5 minutes
let lastCleanup = Date.now();

function cleanupRateLimitStore() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  
  lastCleanup = now;
  const expiredThreshold = now - RATE_LIMIT_WINDOW_MS;
  
  for (const [ip, data] of rateLimitStore.entries()) {
    if (data.windowStart < expiredThreshold) {
      rateLimitStore.delete(ip);
    }
  }
  console.log(`Rate limit store cleanup: ${rateLimitStore.size} entries remaining`);
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(ip);
  
  if (!record) {
    // First request from this IP
    rateLimitStore.set(ip, { count: 1, windowStart: now });
    return false;
  }
  
  // Check if window has expired
  if (now - record.windowStart > RATE_LIMIT_WINDOW_MS) {
    // Reset window
    rateLimitStore.set(ip, { count: 1, windowStart: now });
    return false;
  }
  
  // Increment count
  record.count++;
  
  // Check if over limit
  if (record.count > RATE_LIMIT_MAX_REQUESTS) {
    console.warn(`Rate limit exceeded for IP: ${ip.substring(0, 8)}... (${record.count} requests)`);
    return true;
  }
  
  return false;
}

function getClientIP(req: Request): string {
  // Try various headers for IP detection (behind proxies/CDNs)
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    // Take the first IP in the chain (original client)
    return forwardedFor.split(",")[0].trim();
  }
  
  const realIP = req.headers.get("x-real-ip");
  if (realIP) return realIP;
  
  const cfConnectingIP = req.headers.get("cf-connecting-ip");
  if (cfConnectingIP) return cfConnectingIP;
  
  // Fallback to a hash of user-agent + accept-language for some fingerprinting
  const ua = req.headers.get("user-agent") || "";
  const lang = req.headers.get("accept-language") || "";
  return `fallback:${hashString(ua + lang)}`;
}

function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(16);
}

serve(async (req) => {
  // Periodic cleanup
  cleanupRateLimitStore();
  
  const url = new URL(req.url);
  const emailId = url.searchParams.get("id");
  const action = url.searchParams.get("action"); // "open" or "click"
  const redirect = url.searchParams.get("redirect");
  const source = url.searchParams.get("source"); // "cold" for cold outreach emails
  
  // Get client IP for rate limiting
  const clientIP = getClientIP(req);

  if (!emailId) {
    return new Response("Missing email ID", { status: 400 });
  }
  
  // Validate emailId format (UUID)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(emailId)) {
    console.warn(`Invalid email ID format: ${emailId.substring(0, 20)}...`);
    // Still return pixel/redirect to not break UX, but don't process
    if (action === "open") {
      return new Response(TRACKING_PIXEL, {
        headers: { "Content-Type": "image/gif" },
      });
    } else if (redirect) {
      return new Response(null, {
        status: 302,
        headers: { "Location": redirect },
      });
    }
    return new Response("Invalid email ID", { status: 400 });
  }
  
  // Check rate limit
  if (isRateLimited(clientIP)) {
    // Still return pixel/redirect to not break UX, but skip DB update
    console.log(`Rate limited request for email: ${emailId}`);
    if (action === "open") {
      return new Response(TRACKING_PIXEL, {
        headers: {
          "Content-Type": "image/gif",
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      });
    } else if (redirect) {
      return new Response(null, {
        status: 302,
        headers: { "Location": redirect },
      });
    }
    return new Response("Rate limited", { status: 429 });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const now = new Date().toISOString();

    if (action === "open") {
      // Track email open
      if (source === "cold") {
        await supabase
          .from("cold_outreach")
          .update({ opened_at: now, status: "opened" })
          .eq("id", emailId)
          .is("opened_at", null);
        console.log(`Cold email opened: ${emailId}`);
      } else {
        await supabase
          .from("email_sequences")
          .update({ opened_at: now })
          .eq("id", emailId)
          .is("opened_at", null);
        console.log(`Email opened: ${emailId}`);
      }

      // Return tracking pixel
      return new Response(TRACKING_PIXEL, {
        headers: {
          "Content-Type": "image/gif",
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          "Pragma": "no-cache",
          "Expires": "0",
        },
      });
    } else if (action === "click" && redirect) {
      // Validate redirect URL (must be http/https, no javascript: or data:)
      try {
        const redirectUrl = new URL(redirect);
        if (!["http:", "https:"].includes(redirectUrl.protocol)) {
          console.warn(`Invalid redirect protocol: ${redirectUrl.protocol}`);
          return new Response("Invalid redirect URL", { status: 400 });
        }
      } catch {
        console.warn(`Invalid redirect URL format: ${redirect.substring(0, 50)}...`);
        return new Response("Invalid redirect URL", { status: 400 });
      }
      
      // Track email click
      if (source === "cold") {
        await supabase
          .from("cold_outreach")
          .update({ clicked_at: now })
          .eq("id", emailId)
          .is("clicked_at", null);
        console.log(`Cold email clicked: ${emailId}, redirecting to: ${redirect}`);
      } else {
        await supabase
          .from("email_sequences")
          .update({ clicked_at: now })
          .eq("id", emailId)
          .is("clicked_at", null);
        console.log(`Email clicked: ${emailId}, redirecting to: ${redirect}`);
      }

      // Redirect to the actual URL
      return new Response(null, {
        status: 302,
        headers: {
          "Location": redirect,
        },
      });
    }

    return new Response("Invalid action", { status: 400 });
  } catch (error) {
    console.error("Error tracking email:", error);
    
    // Still return pixel/redirect even on error to not break user experience
    if (action === "open") {
      return new Response(TRACKING_PIXEL, {
        headers: { "Content-Type": "image/gif" },
      });
    } else if (redirect) {
      return new Response(null, {
        status: 302,
        headers: { "Location": redirect },
      });
    }
    
    return new Response("Error", { status: 500 });
  }
});
