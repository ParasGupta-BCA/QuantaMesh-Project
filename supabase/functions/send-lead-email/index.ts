import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Base URL for hosted images
const BASE_URL = "https://www.quantamesh.store";

interface EmailRequest {
  leadId?: string;
  email: string;
  name: string;
  sequenceType: "welcome" | "follow_up" | "follow_up_2" | "follow_up_3";
}

type ExtractedErrorInfo = {
  message: string;
  status: number;
  name?: string;
};

function extractErrorInfo(error: unknown): ExtractedErrorInfo {
  if (error && typeof error === "object") {
    const anyErr = error as Record<string, unknown>;
    const message = typeof anyErr.message === "string" ? anyErr.message : undefined;
    const statusCode = typeof anyErr.statusCode === "number" ? anyErr.statusCode : undefined;
    const name = typeof anyErr.name === "string" ? anyErr.name : undefined;

    if (message) {
      return {
        message,
        status: statusCode && statusCode >= 400 && statusCode <= 599 ? statusCode : 500,
        name,
      };
    }

    if (typeof anyErr.error === "string") {
      return { message: anyErr.error, status: 500 };
    }
  }

  if (error instanceof Error) {
    return { message: error.message, status: 500 };
  }

  return { message: "Unknown error", status: 500 };
}

async function generateEmailWithAI(name: string, sequenceType: string): Promise<{ subject: string; content: string }> {
  const prompts: Record<string, string> = {
    welcome: `Write a friendly, professional welcome email for a new lead named "${name}" who just signed up on Quanta Mesh - an Android app publishing service. 
    
Key points to include:
- Thank them for signing up
- Mention they got $5 off their first app publish (normally $25, now $20)
- Briefly explain our service (we publish Android apps to Google Play for developers)
- Create urgency but stay friendly
- Include a call-to-action to publish their first app

Keep it under 150 words. Be personable and enthusiastic.`,

    follow_up: `Write a follow-up email for a lead named "${name}" who signed up for Quanta Mesh but hasn't ordered yet.

Key points:
- Gently remind them of their $5 discount
- Ask if they have any questions about the service
- Mention we handle everything: metadata, screenshots, policy compliance
- Share that 500+ developers trust us
- Soft call-to-action

Keep it under 120 words. Be helpful, not pushy.`,

    follow_up_2: `Write a second follow-up email for "${name}" about Quanta Mesh app publishing service.

Key points:
- Share a quick success story or benefit
- Remind them publishing without us costs $25 for Google's developer account alone
- Our service is just $25 (or $20 with their discount) and we do all the work
- Limited time offer expires soon
- Final reminder about the discount

Keep it under 100 words. Create mild urgency.`,

    follow_up_3: `Write a final follow-up email for "${name}" about Quanta Mesh.

Key points:
- This is their last chance for the $5 discount
- Simple, direct message
- One clear call-to-action
- Thank them for their time if they're not interested

Keep it under 80 words. Be respectful of their decision.`,
  };

  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are an expert email copywriter for a B2B SaaS company. Write emails that are:
- Professional but friendly
- Concise and scannable
- Have compelling subject lines (max 50 chars)
- Include clear calls-to-action

Return ONLY valid JSON in this exact format:
{"subject": "Your Subject Here", "content": "Your email body here with proper line breaks"}`,
          },
          { role: "user", content: prompts[sequenceType] || prompts.welcome },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return {
      subject: `Hey ${name}, Welcome to Quanta Mesh! 🚀`,
      content: content,
    };
  } catch (error) {
    console.error("AI generation error:", error);
    return {
      subject: `Welcome to Quanta Mesh, ${name}! 🎉`,
      content: `Hi ${name},

Thanks for joining Quanta Mesh! We're excited to have you.

As a welcome gift, you've got $5 OFF your first app publish - just $20 instead of $25.

We handle everything:
✓ App upload to Google Play
✓ Metadata & screenshots
✓ Policy compliance

Ready to publish? Visit quantamesh.store to get started!

Cheers,
The Quanta Mesh Team`,
    };
  }
}

// Apple-inspired email template
function generateAppleStyleEmail(content: string, name: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    :root {
      color-scheme: light dark;
      supported-color-schemes: light dark;
    }
    
    * { 
      margin: 0; 
      padding: 0; 
      box-sizing: border-box; 
    }
    
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', Helvetica, Arial, sans-serif;
      line-height: 1.5; 
      color: #1d1d1f;
      background-color: #f5f5f7;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    
    .wrapper {
      width: 100%;
      background-color: #f5f5f7;
      padding: 40px 20px;
    }
    
    .container { 
      max-width: 680px; 
      margin: 0 auto; 
      background: #ffffff;
      border-radius: 18px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
    }
    
    .hero-image {
      width: 100%;
      height: auto;
      display: block;
    }
    
    .content-wrapper {
      padding: 48px 48px 40px;
      text-align: center;
    }
    
    .eyebrow {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #86868b;
      margin-bottom: 8px;
    }
    
    .headline {
      font-size: 40px;
      font-weight: 700;
      letter-spacing: -0.02em;
      line-height: 1.1;
      color: #1d1d1f;
      margin-bottom: 16px;
    }
    
    .subheadline {
      font-size: 21px;
      font-weight: 400;
      color: #86868b;
      margin-bottom: 32px;
      line-height: 1.4;
    }
    
    .body-text {
      font-size: 17px;
      color: #1d1d1f;
      line-height: 1.6;
      text-align: left;
      margin-bottom: 32px;
    }
    
    .body-text p {
      margin-bottom: 16px;
    }
    
    .feature-grid {
      display: table;
      width: 100%;
      margin: 32px 0;
      border-spacing: 12px;
    }
    
    .feature-row {
      display: table-row;
    }
    
    .feature-item {
      display: table-cell;
      width: 33.33%;
      background: #f5f5f7;
      border-radius: 12px;
      padding: 24px 16px;
      text-align: center;
      vertical-align: top;
    }
    
    .feature-icon {
      font-size: 28px;
      margin-bottom: 8px;
    }
    
    .feature-title {
      font-size: 14px;
      font-weight: 600;
      color: #1d1d1f;
      margin-bottom: 4px;
    }
    
    .feature-desc {
      font-size: 12px;
      color: #86868b;
    }
    
    .cta-section {
      padding: 32px 0;
      text-align: center;
    }
    
    .discount-pill {
      display: inline-block;
      background: linear-gradient(135deg, #af52de 0%, #5e5ce6 100%);
      color: #ffffff;
      font-size: 13px;
      font-weight: 600;
      padding: 8px 20px;
      border-radius: 100px;
      margin-bottom: 24px;
      letter-spacing: 0.3px;
    }
    
    .cta-button {
      display: inline-block;
      background: #0071e3;
      color: #ffffff !important;
      font-size: 17px;
      font-weight: 400;
      padding: 16px 32px;
      border-radius: 980px;
      text-decoration: none;
      transition: background 0.2s ease;
    }
    
    .cta-button:hover {
      background: #0077ed;
    }
    
    .cta-link {
      display: block;
      margin-top: 16px;
      font-size: 17px;
      color: #0071e3;
      text-decoration: none;
    }
    
    .divider {
      height: 1px;
      background: #d2d2d7;
      margin: 40px 48px;
    }
    
    .footer {
      padding: 0 48px 40px;
      text-align: center;
    }
    
    .footer-logo {
      font-size: 24px;
      font-weight: 700;
      color: #1d1d1f;
      margin-bottom: 16px;
      letter-spacing: -0.02em;
    }
    
    .footer-text {
      font-size: 12px;
      color: #86868b;
      line-height: 1.6;
      margin-bottom: 8px;
    }
    
    .footer-links {
      margin-top: 16px;
    }
    
    .footer-link {
      display: inline-block;
      font-size: 12px;
      color: #0071e3;
      text-decoration: none;
      margin: 0 8px;
    }
    
    @media only screen and (max-width: 600px) {
      .wrapper {
        padding: 20px 16px;
      }
      
      .content-wrapper {
        padding: 32px 24px 28px;
      }
      
      .headline {
        font-size: 28px;
      }
      
      .subheadline {
        font-size: 17px;
      }
      
      .body-text {
        font-size: 15px;
      }
      
      .feature-grid {
        display: block;
      }
      
      .feature-item {
        display: block;
        width: 100%;
        margin-bottom: 12px;
      }
      
      .divider {
        margin: 32px 24px;
      }
      
      .footer {
        padding: 0 24px 32px;
      }
      
      .cta-button {
        display: block;
        padding: 18px 32px;
      }
    }
    
    @media (prefers-color-scheme: dark) {
      body {
        background-color: #000000;
        color: #f5f5f7;
      }
      
      .wrapper {
        background-color: #000000;
      }
      
      .container {
        background: #1d1d1f;
      }
      
      .headline {
        color: #f5f5f7;
      }
      
      .body-text {
        color: #f5f5f7;
      }
      
      .feature-item {
        background: #2d2d2f;
      }
      
      .feature-title {
        color: #f5f5f7;
      }
      
      .divider {
        background: #424245;
      }
      
      .footer-logo {
        color: #f5f5f7;
      }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <!-- Hero Image -->
      <img 
        src="${BASE_URL}/email-hero-banner.png" 
        alt="Quanta Mesh - Launch Your App" 
        class="hero-image"
        width="680"
        style="width: 100%; height: auto; display: block;"
      />
      
      <!-- Main Content -->
      <div class="content-wrapper">
        <p class="eyebrow">App Publishing Made Simple</p>
        <h1 class="headline">Your app deserves<br/>to be live.</h1>
        <p class="subheadline">We handle everything. You focus on building.</p>
        
        <div class="body-text">
          ${content.replace(/\n/g, "<br/>")}
        </div>
        
        <!-- Features Grid -->
        <table class="feature-grid" role="presentation" cellspacing="12" cellpadding="0">
          <tr class="feature-row">
            <td class="feature-item">
              <div class="feature-icon">⚡️</div>
              <div class="feature-title">24hr Delivery</div>
              <div class="feature-desc">Lightning fast</div>
            </td>
            <td class="feature-item">
              <div class="feature-icon">🛡️</div>
              <div class="feature-title">Policy Safe</div>
              <div class="feature-desc">100% compliant</div>
            </td>
            <td class="feature-item">
              <div class="feature-icon">✨</div>
              <div class="feature-title">Full Service</div>
              <div class="feature-desc">We do it all</div>
            </td>
          </tr>
        </table>
        
        <!-- CTA Section -->
        <div class="cta-section">
          <span class="discount-pill">🎁 $5 OFF — Your Exclusive Offer</span>
          <br/><br/>
          <a href="https://www.quantamesh.store/order" class="cta-button">
            Publish Your App
          </a>
          <a href="https://www.quantamesh.store/services" class="cta-link">
            Learn more →
          </a>
        </div>
      </div>
      
      <div class="divider"></div>
      
      <!-- Footer -->
      <div class="footer">
        <p class="footer-logo">Quanta Mesh</p>
        <p class="footer-text">
          Trusted by 500+ developers worldwide.<br/>
          © 2025 Quanta Mesh. All rights reserved.
        </p>
        <p class="footer-text">
          You're receiving this because you signed up at quantamesh.store
        </p>
        <div class="footer-links">
          <a href="https://www.quantamesh.store" class="footer-link">Visit Website</a>
          <a href="https://www.quantamesh.store/privacy-policy" class="footer-link">Privacy</a>
          <a href="mailto:parasgupta4494@gmail.com" class="footer-link">Contact</a>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { leadId, email, name, sequenceType }: EmailRequest = await req.json();

    if (!email || !name) {
      throw new Error("Email and name are required");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    console.log(`Generating ${sequenceType} email for ${name}`);
    const emailContent = await generateEmailWithAI(name, sequenceType);

    // Generate Apple-style HTML email
    const htmlEmail = generateAppleStyleEmail(emailContent.content, name);

    console.log(`Sending email to ${email}`);
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: "Quanta Mesh <onboarding@resend.dev>",
      to: [email],
      subject: emailContent.subject,
      html: htmlEmail,
    });

    if (emailError) {
      console.error("Resend error:", emailError);
      throw emailError;
    }

    let actualLeadId = leadId;
    if (!actualLeadId) {
      const { data: leadData } = await supabase
        .from("leads")
        .select("id")
        .eq("email", email)
        .single();
      actualLeadId = leadData?.id;
    }

    if (actualLeadId) {
      const { error: insertError } = await supabase.from("email_sequences").insert({
        lead_id: actualLeadId,
        sequence_type: sequenceType,
        subject: emailContent.subject,
        content: emailContent.content,
        status: "sent",
      });

      if (insertError) {
        console.error("Failed to save email sequence:", insertError);
      }

      await supabase
        .from("leads")
        .update({
          status: "contacted",
          last_contacted_at: new Date().toISOString(),
        })
        .eq("id", actualLeadId);
    }

    console.log("Email sent successfully:", emailData);

    return new Response(
      JSON.stringify({ success: true, emailId: emailData?.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const info = extractErrorInfo(error);
    console.error("Error in send-lead-email:", {
      status: info.status,
      name: info.name,
      message: info.message,
    });

    return new Response(
      JSON.stringify({ error: info.message, name: info.name }),
      { status: info.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
