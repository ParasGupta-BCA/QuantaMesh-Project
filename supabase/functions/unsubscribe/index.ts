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

  if (!leadId && !email) {
    return new Response(generateHTML("error", "Invalid unsubscribe link"), {
      status: 400,
      headers: { "Content-Type": "text/html", ...corsHeaders },
    });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Update lead status to unsubscribed
    let query = supabase.from("leads").update({ 
      status: "unsubscribed",
      updated_at: new Date().toISOString()
    });

    if (leadId) {
      query = query.eq("id", leadId);
    } else if (email) {
      query = query.eq("email", email);
    }

    const { error, count } = await query;

    if (error) {
      console.error("Error unsubscribing:", error);
      throw error;
    }

    console.log(`Unsubscribed: leadId=${leadId}, email=${email}`);

    // Return a styled HTML page
    return new Response(generateHTML("success"), {
      status: 200,
      headers: { "Content-Type": "text/html", ...corsHeaders },
    });
  } catch (error) {
    console.error("Error processing unsubscribe:", error);
    return new Response(generateHTML("error", "Something went wrong. Please try again."), {
      status: 500,
      headers: { "Content-Type": "text/html", ...corsHeaders },
    });
  }
});

function generateHTML(status: "success" | "error", errorMessage?: string): string {
  const isSuccess = status === "success";
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${isSuccess ? "Unsubscribed" : "Error"} - Quanta Mesh</title>
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
      margin-bottom: 32px;
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
    }
    .button:hover {
      background: #0077ed;
      transform: translateY(-1px);
    }
    .logo {
      font-size: 20px;
      font-weight: 700;
      margin-top: 32px;
      color: #f5f5f7;
      letter-spacing: -0.5px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon ${status}">
      ${isSuccess ? "✓" : "✕"}
    </div>
    <h1>${isSuccess ? "You're Unsubscribed" : "Oops!"}</h1>
    <p>
      ${isSuccess 
        ? "You've been successfully unsubscribed from our emails. We're sorry to see you go!" 
        : errorMessage || "Something went wrong. Please try again."}
    </p>
    <a href="https://www.quantamesh.store" class="button">
      ${isSuccess ? "Visit Website" : "Go Home"}
    </a>
    <p class="logo">Quanta Mesh</p>
  </div>
</body>
</html>
`;
}
