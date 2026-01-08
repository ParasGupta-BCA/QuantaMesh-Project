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
  // Resend errors are often plain objects: { statusCode, name, message }
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

    // Our own function may throw { error: "..." }
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
    
    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    // Fallback if JSON parsing fails
    return {
      subject: `Hey ${name}, Welcome to Quanta Mesh! 🚀`,
      content: content,
    };
  } catch (error) {
    console.error("AI generation error:", error);
    // Fallback email content
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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { leadId, email, name, sequenceType }: EmailRequest = await req.json();

    // Validate inputs
    if (!email || !name) {
      throw new Error("Email and name are required");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Generate email with AI
    console.log(`Generating ${sequenceType} email for ${name}`);
    const emailContent = await generateEmailWithAI(name, sequenceType);

    // Send email via Resend
    console.log(`Sending email to ${email}`);
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: "Quanta Mesh <onboarding@resend.dev>",
      to: [email],
      subject: emailContent.subject,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
              line-height: 1.7; 
              color: #1a1a2e; 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              padding: 40px 20px;
            }
            .container { 
              max-width: 600px; 
              margin: 0 auto; 
              background: #ffffff;
              border-radius: 24px;
              overflow: hidden;
              box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            }
            .header { 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              padding: 40px 30px;
              text-align: center;
            }
            .header h1 { 
              color: #ffffff; 
              font-size: 32px; 
              font-weight: 700;
              letter-spacing: -0.5px;
              margin: 0;
              text-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .header p {
              color: rgba(255,255,255,0.9);
              font-size: 14px;
              margin-top: 8px;
            }
            .body-content { 
              padding: 40px 35px;
            }
            .content { 
              font-size: 16px;
              color: #4a5568;
              line-height: 1.8;
            }
            .cta-wrapper {
              text-align: center;
              padding: 30px 0 20px;
            }
            .cta { 
              display: inline-block; 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: #ffffff !important; 
              padding: 18px 48px; 
              border-radius: 50px;
              text-decoration: none; 
              font-weight: 600;
              font-size: 16px;
              letter-spacing: 0.3px;
              box-shadow: 0 10px 40px -10px rgba(102, 126, 234, 0.5);
              transition: all 0.3s ease;
            }
            .cta:hover {
              transform: translateY(-2px);
              box-shadow: 0 15px 50px -10px rgba(102, 126, 234, 0.6);
            }
            .cta-arrow {
              display: inline-block;
              margin-left: 8px;
              transition: transform 0.3s ease;
            }
            .features {
              background: #f8fafc;
              border-radius: 16px;
              padding: 25px;
              margin: 25px 0;
            }
            .feature-item {
              display: flex;
              align-items: center;
              margin: 12px 0;
              font-size: 15px;
              color: #4a5568;
            }
            .feature-icon {
              width: 24px;
              height: 24px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              border-radius: 50%;
              display: inline-flex;
              align-items: center;
              justify-content: center;
              margin-right: 12px;
              font-size: 12px;
              color: white;
            }
            .footer { 
              background: #f8fafc;
              padding: 30px 35px;
              text-align: center;
              border-top: 1px solid #e2e8f0;
            }
            .footer p { 
              font-size: 13px; 
              color: #718096;
              margin: 5px 0;
            }
            .social-links {
              margin: 20px 0;
            }
            .social-link {
              display: inline-block;
              width: 36px;
              height: 36px;
              background: #e2e8f0;
              border-radius: 50%;
              margin: 0 5px;
              line-height: 36px;
              font-size: 14px;
              color: #667eea;
              text-decoration: none;
            }
            .discount-badge {
              display: inline-block;
              background: linear-gradient(135deg, #10b981 0%, #059669 100%);
              color: white;
              padding: 8px 20px;
              border-radius: 20px;
              font-size: 14px;
              font-weight: 600;
              margin: 15px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚀 Quanta Mesh</h1>
              <p>Your Android App Publishing Partner</p>
            </div>
            <div class="body-content">
              <div class="content">${emailContent.content.replace(/\n/g, "<br>")}</div>
              
              <div class="features">
                <div class="feature-item">
                  <span class="feature-icon">✓</span>
                  <span>Fast Google Play Store publishing</span>
                </div>
                <div class="feature-item">
                  <span class="feature-icon">✓</span>
                  <span>Professional metadata & screenshots</span>
                </div>
                <div class="feature-item">
                  <span class="feature-icon">✓</span>
                  <span>100% Policy compliance guaranteed</span>
                </div>
              </div>
              
              <div class="cta-wrapper">
                <span class="discount-badge">💰 $5 OFF - Limited Time!</span>
                <br><br>
                <a href="https://www.quantamesh.store/order" class="cta">
                  Publish My App Now <span class="cta-arrow">→</span>
                </a>
              </div>
            </div>
            <div class="footer">
              <p><strong>© 2025 Quanta Mesh</strong></p>
              <p>Trusted by 500+ Android developers worldwide</p>
              <p style="margin-top: 15px; font-size: 11px; color: #a0aec0;">
                You received this email because you signed up at quantamesh.store<br>
                <a href="https://www.quantamesh.store" style="color: #667eea;">Unsubscribe</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (emailError) {
      console.error("Resend error:", emailError);
      throw emailError;
    }

    // Get lead ID if not provided
    let actualLeadId = leadId;
    if (!actualLeadId) {
      const { data: leadData } = await supabase
        .from("leads")
        .select("id")
        .eq("email", email)
        .single();
      actualLeadId = leadData?.id;
    }

    // Save email to database
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

      // Update lead status and last_contacted_at
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
