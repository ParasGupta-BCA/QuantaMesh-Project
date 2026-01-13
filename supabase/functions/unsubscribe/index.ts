import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const leadId = url.searchParams.get("id");
  const email = url.searchParams.get("email");
  const action = url.searchParams.get("action") || "unsubscribe"; // unsubscribe or resubscribe

  if (!leadId && !email) {
    return new Response(generateHTML("error", action, "Invalid link"), {
      status: 400,
      headers: { "Content-Type": "text/html", ...corsHeaders },
    });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const newStatus = action === "resubscribe" ? "new" : "unsubscribed";
    
    // Update lead status
    let query = supabase.from("leads").update({ 
      status: newStatus,
      updated_at: new Date().toISOString()
    });

    if (leadId) {
      query = query.eq("id", leadId);
    } else if (email) {
      query = query.eq("email", email);
    }

    const { error } = await query;

    if (error) {
      console.error(`Error ${action}:`, error);
      throw error;
    }

    console.log(`${action}: leadId=${leadId}, email=${email}`);

    // Return a styled HTML page
    return new Response(generateHTML("success", action, undefined, leadId, email), {
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
  leadId?: string | null,
  email?: string | null
): string {
  const isSuccess = status === "success";
  const isResubscribe = action === "resubscribe";
  
  // Build the opposite action URL
  const baseUrl = `https://hnnlhddnettfaapyjggx.supabase.co/functions/v1/unsubscribe`;
  const params = leadId ? `id=${leadId}` : `email=${encodeURIComponent(email || '')}`;
  const oppositeAction = isResubscribe ? "unsubscribe" : "resubscribe";
  const toggleUrl = `${baseUrl}?${params}&action=${oppositeAction}`;
  
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
    ${isSuccess ? `
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
