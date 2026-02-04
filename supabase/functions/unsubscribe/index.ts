import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const UNSUBSCRIBE_SECRET = Deno.env.get("UNSUBSCRIBE_SECRET") || SUPABASE_SERVICE_ROLE_KEY;

// Helper to convert ArrayBuffer to hex string
function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Generate HMAC signature for unsubscribe tokens
async function generateSignature(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(UNSUBSCRIBE_SECRET);
  const messageData = encoder.encode(data);
  
  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  
  const signature = await crypto.subtle.sign("HMAC", key, messageData);
  return bufferToHex(signature);
}

// Verify HMAC signature
async function verifySignature(data: string, signature: string): Promise<boolean> {
  try {
    const expectedSignature = await generateSignature(data);
    return signature === expectedSignature;
  } catch {
    return false;
  }
}

// Verify and decode unsubscribe token
async function verifyUnsubscribeToken(token: string): Promise<{ leadId: string; timestamp: number } | null> {
  try {
    // Decode base64 token
    const decoded = atob(token);
    const parts = decoded.split(":");
    if (parts.length !== 3) return null;
    
    const [leadId, timestampStr, signature] = parts;
    const timestamp = parseInt(timestampStr, 10);
    
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(leadId)) return null;
    
    // Check token expiration (30 days)
    const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days in ms
    if (Date.now() - timestamp > maxAge) return null;
    
    // Verify signature
    const data = `${leadId}:${timestampStr}`;
    const isValid = await verifySignature(data, signature);
    if (!isValid) return null;
    
    return { leadId, timestamp };
  } catch {
    return null;
  }
}

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  const action = url.searchParams.get("action") || "unsubscribe";

  // Validate action parameter
  if (action !== "unsubscribe" && action !== "resubscribe") {
    return new Response(generateHTML("error", "unsubscribe", "Invalid action"), {
      status: 400,
      headers: { "Content-Type": "text/html", ...corsHeaders },
    });
  }

  if (!token) {
    return new Response(generateHTML("error", action, "Invalid or expired link"), {
      status: 400,
      headers: { "Content-Type": "text/html", ...corsHeaders },
    });
  }

  // Verify the token
  const tokenData = await verifyUnsubscribeToken(token);
  if (!tokenData) {
    console.error("Invalid or expired unsubscribe token");
    return new Response(generateHTML("error", action, "Invalid or expired link. Please contact support."), {
      status: 400,
      headers: { "Content-Type": "text/html", ...corsHeaders },
    });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const newStatus = action === "resubscribe" ? "new" : "unsubscribed";
    
    // Update lead status using verified leadId
    const { error, count } = await supabase
      .from("leads")
      .update({ 
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq("id", tokenData.leadId);

    if (error) {
      console.error(`Error ${action}:`, error);
      throw error;
    }

    console.log(`${action}: leadId=${tokenData.leadId}, count=${count}`);

    // Return a styled HTML page
    return new Response(generateHTML("success", action, undefined, token), {
      status: 200,
      headers: { "Content-Type": "text/html", ...corsHeaders },
    });
  } catch (error) {
    console.error(`Error processing ${action}:`, error);
    return new Response(generateHTML("error", action, "Something went wrong. Please try again."), {
      status: 500,
      headers: { "Content-Type": "text/html", ...corsHeaders },
    });
  }
});

function generateHTML(
  status: "success" | "error", 
  action: string,
  errorMessage?: string,
  token?: string | null
): string {
  const isSuccess = status === "success";
  const isResubscribe = action === "resubscribe";
  
  // Build the opposite action URL using the same token
  const baseUrl = `https://hnnlhddnettfaapyjggx.supabase.co/functions/v1/unsubscribe`;
  const oppositeAction = isResubscribe ? "unsubscribe" : "resubscribe";
  const toggleUrl = token ? `${baseUrl}?token=${encodeURIComponent(token)}&action=${oppositeAction}` : "";
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${isSuccess ? (isResubscribe ? "Subscribed" : "Unsubscribed") : "Error"} - Quanta Mesh</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Helvetica, Arial, sans-serif;
      background: linear-gradient(135deg, #1d1d1f 0%, #000000 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      color: #f5f5f7;
    }
    .container {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(20px);
      border-radius: 24px;
      padding: 48px;
      max-width: 480px;
      width: 100%;
      text-align: center;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .icon {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 24px;
      font-size: 40px;
    }
    .icon.success {
      background: linear-gradient(135deg, #30d158 0%, #34c759 100%);
    }
    .icon.resubscribe {
      background: linear-gradient(135deg, #0071e3 0%, #0077ed 100%);
    }
    .icon.error {
      background: linear-gradient(135deg, #ff453a 0%, #ff3b30 100%);
    }
    h1 {
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 12px;
      letter-spacing: -0.5px;
    }
    p {
      font-size: 16px;
      color: #86868b;
      line-height: 1.5;
      margin-bottom: 24px;
    }
    .button {
      display: inline-block;
      background: #0071e3;
      color: #ffffff;
      font-size: 16px;
      font-weight: 500;
      text-decoration: none;
      padding: 14px 28px;
      border-radius: 50px;
      transition: all 0.3s ease;
      margin-bottom: 16px;
    }
    .button:hover {
      background: #0077ed;
      transform: translateY(-1px);
    }
    .toggle-link {
      display: inline-block;
      color: #86868b;
      font-size: 14px;
      text-decoration: none;
      transition: color 0.3s ease;
    }
    .toggle-link:hover {
      color: #f5f5f7;
    }
    .logo {
      font-size: 20px;
      font-weight: 700;
      margin-top: 24px;
      color: #f5f5f7;
      letter-spacing: -0.5px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon ${isSuccess ? (isResubscribe ? 'resubscribe' : 'success') : 'error'}">
      ${isSuccess ? (isResubscribe ? "✓" : "✓") : "✕"}
    </div>
    <h1>${isSuccess 
      ? (isResubscribe ? "Welcome Back!" : "You're Unsubscribed") 
      : "Oops!"}</h1>
    <p>
      ${isSuccess 
        ? (isResubscribe 
          ? "You've successfully re-subscribed to our emails. We're excited to have you back!" 
          : "You've been successfully unsubscribed from our emails. We're sorry to see you go!") 
        : errorMessage || "Something went wrong. Please try again."}
    </p>
    <a href="https://www.quantamesh.store" class="button">
      ${isSuccess ? "Visit Website" : "Go Home"}
    </a>
    ${isSuccess && toggleUrl ? `
    <br>
    <a href="${toggleUrl}" class="toggle-link">
      ${isResubscribe ? "Changed your mind? Unsubscribe" : "Changed your mind? Re-subscribe"}
    </a>
    ` : ''}
    <p class="logo">Quanta Mesh</p>
  </div>
</body>
</html>
`;
}
