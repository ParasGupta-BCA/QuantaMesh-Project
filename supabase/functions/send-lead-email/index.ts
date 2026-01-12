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
  sequenceType: "welcome" | "follow_up" | "follow_up_2" | "follow_up_3" | 
    "tip_aso" | "tip_screenshots" | "tip_description" | "tip_keywords" | 
    "tip_updates" | "tip_reviews" | "tip_monetization";
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

    // Daily engagement tips
    tip_aso: `Write a helpful email for "${name}" about App Store Optimization (ASO).

Key points:
- Share 2-3 practical ASO tips for Google Play
- Explain how good ASO increases downloads
- Mention that we optimize listings as part of our service
- Soft CTA to publish with us

Keep it under 100 words. Be educational and valuable.`,

    tip_screenshots: `Write a helpful email for "${name}" about app screenshots.

Key points:
- Share tips for creating compelling app screenshots
- Mention optimal dimensions and count for Google Play
- Explain screenshots impact on conversion rates
- We create feature graphics as an add-on

Keep it under 100 words. Be practical and helpful.`,

    tip_description: `Write a helpful email for "${name}" about writing app descriptions.

Key points:
- Tips for writing effective Google Play descriptions
- Importance of first 80 characters
- Using bullet points and emojis strategically
- We help optimize descriptions in our service

Keep it under 100 words. Be actionable.`,

    tip_keywords: `Write a helpful email for "${name}" about keyword optimization.

Key points:
- How to research keywords for your app
- Where to place keywords in the listing
- Long-tail vs competitive keywords
- We help with keyword research

Keep it under 100 words. Be educational.`,

    tip_updates: `Write a helpful email for "${name}" about app update strategies.

Key points:
- Why regular updates matter for ranking
- What to include in update notes
- How updates affect user retention
- We can help with future updates too

Keep it under 100 words. Be strategic.`,

    tip_reviews: `Write a helpful email for "${name}" about getting app reviews.

Key points:
- Tips for encouraging positive reviews
- Best timing to ask for reviews
- How to respond to negative feedback
- Good reviews = more downloads

Keep it under 100 words. Be practical.`,

    tip_monetization: `Write a helpful email for "${name}" about app monetization.

Key points:
- Overview of monetization options (ads, IAP, subscriptions)
- Which model works for different app types
- Setting up monetization on Google Play
- We ensure proper monetization setup

Keep it under 100 words. Be informative.`,
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

// Apple-inspired email template with mobile-first inline styles
function generateAppleStyleEmail(content: string, name: string, emailId: string, leadId: string): string {
  const trackingBaseUrl = `${SUPABASE_URL}/functions/v1/track-email`;
  const unsubscribeUrl = `${SUPABASE_URL}/functions/v1/unsubscribe?id=${leadId}`;
  
  // Create tracked URLs
  const orderUrl = `${trackingBaseUrl}?id=${emailId}&action=click&redirect=${encodeURIComponent("https://www.quantamesh.store/order")}`;
  const servicesUrl = `${trackingBaseUrl}?id=${emailId}&action=click&redirect=${encodeURIComponent("https://www.quantamesh.store/services")}`;
  const websiteUrl = `${trackingBaseUrl}?id=${emailId}&action=click&redirect=${encodeURIComponent("https://www.quantamesh.store")}`;
  const openPixelUrl = `${trackingBaseUrl}?id=${emailId}&action=open`;
  
  return `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>Quanta Mesh</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <style>
    table { border-collapse: collapse; }
    td { font-family: Arial, sans-serif; }
  </style>
  <![endif]-->
  <style>
    /* Reset */
    body, table, td, p, a, li { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    body { margin: 0 !important; padding: 0 !important; width: 100% !important; }
    
    /* Dark mode */
    @media (prefers-color-scheme: dark) {
      .dark-bg { background-color: #1d1d1f !important; }
      .dark-text { color: #f5f5f7 !important; }
      .dark-feature { background-color: #2d2d2f !important; }
    }
    
    [data-ogsc] .dark-bg { background-color: #1d1d1f !important; }
    [data-ogsc] .dark-text { color: #f5f5f7 !important; }
    [data-ogsc] .dark-feature { background-color: #2d2d2f !important; }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f7; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Helvetica, Arial, sans-serif;">
  
  <!-- Wrapper Table -->
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f5f5f7;">
    <tr>
      <td align="center" style="padding: 24px 16px;">
        
        <!-- Container -->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden;" class="dark-bg">
          
          <!-- Hero Image -->
          <tr>
            <td>
              <img src="${BASE_URL}/email-hero-banner.png" alt="Quanta Mesh" width="600" style="width: 100%; max-width: 600px; height: auto; display: block;">
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 32px 24px 24px; text-align: center;">
              
              <!-- Eyebrow -->
              <p style="margin: 0 0 8px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.2px; color: #86868b;">
                App Publishing Made Simple
              </p>
              
              <!-- Headline -->
              <h1 style="margin: 0 0 12px; font-size: 28px; font-weight: 700; line-height: 1.15; color: #1d1d1f; letter-spacing: -0.5px;" class="dark-text">
                Your app deserves<br>to be live.
              </h1>
              
              <!-- Subheadline -->
              <p style="margin: 0 0 24px; font-size: 16px; font-weight: 400; line-height: 1.4; color: #86868b;">
                We handle everything. You focus on building.
              </p>
              
              <!-- Body Text -->
              <div style="font-size: 15px; line-height: 1.6; color: #1d1d1f; text-align: left; margin-bottom: 24px;" class="dark-text">
                ${content.replace(/\n/g, "<br>")}
              </div>
              
            </td>
          </tr>
          
          <!-- Features - Stacked for Mobile Compatibility -->
          <tr>
            <td style="padding: 0 24px 24px;">
              
              <!-- Feature 1 -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 12px;">
                <tr>
                  <td style="background-color: #f5f5f7; border-radius: 12px; padding: 20px; text-align: center;" class="dark-feature">
                    <span style="font-size: 24px; display: block; margin-bottom: 6px;">⚡️</span>
                    <span style="font-size: 14px; font-weight: 600; color: #1d1d1f; display: block; margin-bottom: 2px;" class="dark-text">24hr Delivery</span>
                    <span style="font-size: 12px; color: #86868b;">Lightning fast publishing</span>
                  </td>
                </tr>
              </table>
              
              <!-- Feature 2 -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 12px;">
                <tr>
                  <td style="background-color: #f5f5f7; border-radius: 12px; padding: 20px; text-align: center;" class="dark-feature">
                    <span style="font-size: 24px; display: block; margin-bottom: 6px;">🛡️</span>
                    <span style="font-size: 14px; font-weight: 600; color: #1d1d1f; display: block; margin-bottom: 2px;" class="dark-text">Policy Safe</span>
                    <span style="font-size: 12px; color: #86868b;">100% Google compliant</span>
                  </td>
                </tr>
              </table>
              
              <!-- Feature 3 -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 12px;">
                <tr>
                  <td style="background-color: #f5f5f7; border-radius: 12px; padding: 20px; text-align: center;" class="dark-feature">
                    <span style="font-size: 24px; display: block; margin-bottom: 6px;">✨</span>
                    <span style="font-size: 14px; font-weight: 600; color: #1d1d1f; display: block; margin-bottom: 2px;" class="dark-text">Full Service</span>
                    <span style="font-size: 12px; color: #86868b;">We handle everything</span>
                  </td>
                </tr>
              </table>
              
            </td>
          </tr>
          
          <!-- CTA Section -->
          <tr>
            <td style="padding: 0 24px 32px; text-align: center;">
              
              <!-- Discount Badge -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td align="center" style="padding-bottom: 20px;">
                    <span style="display: inline-block; background: linear-gradient(135deg, #af52de 0%, #5e5ce6 100%); color: #ffffff; font-size: 13px; font-weight: 600; padding: 10px 24px; border-radius: 50px;">
                      🎁 $5 OFF — Your Exclusive Offer
                    </span>
                  </td>
                </tr>
              </table>
              
              <!-- Primary CTA Button -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td align="center">
                    <a href="${orderUrl}" target="_blank" style="display: inline-block; background-color: #0071e3; color: #ffffff; font-size: 16px; font-weight: 500; text-decoration: none; padding: 16px 40px; border-radius: 50px; min-width: 200px;">
                      Publish Your App
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Secondary Link -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td align="center" style="padding-top: 16px;">
                    <a href="${servicesUrl}" target="_blank" style="color: #0071e3; font-size: 15px; text-decoration: none;">
                      Learn more →
                    </a>
                  </td>
                </tr>
              </table>
              
            </td>
          </tr>
          
          <!-- Divider -->
          <tr>
            <td style="padding: 0 24px;">
              <div style="height: 1px; background-color: #e5e5e5;"></div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px; text-align: center;">
              
              <!-- Logo -->
              <p style="margin: 0 0 12px; font-size: 20px; font-weight: 700; color: #1d1d1f; letter-spacing: -0.5px;" class="dark-text">
                Quanta Mesh
              </p>
              
              <!-- Footer Text -->
              <p style="margin: 0 0 8px; font-size: 12px; color: #86868b; line-height: 1.5;">
                Trusted by 500+ developers worldwide.
              </p>
              <p style="margin: 0 0 16px; font-size: 11px; color: #86868b;">
                © ${new Date().getFullYear()} Quanta Mesh. All rights reserved.
              </p>
              
              <!-- Footer Links -->
              <p style="margin: 0; font-size: 12px;">
                <a href="${websiteUrl}" target="_blank" style="color: #0071e3; text-decoration: none; margin: 0 8px;">Website</a>
                <a href="https://www.quantamesh.store/privacy-policy" target="_blank" style="color: #0071e3; text-decoration: none; margin: 0 8px;">Privacy</a>
                <a href="mailto:parasgupta4494@gmail.com" style="color: #0071e3; text-decoration: none; margin: 0 8px;">Contact</a>
              </p>
              
              <p style="margin: 16px 0 0; font-size: 10px; color: #adadad;">
                You're receiving this because you signed up at quantamesh.store<br>
                <a href="${unsubscribeUrl}" target="_blank" style="color: #adadad; text-decoration: underline;">Unsubscribe</a>
              </p>
              
              <!-- Open Tracking Pixel -->
              <img src="${openPixelUrl}" width="1" height="1" alt="" style="display: none; width: 1px; height: 1px; border: 0;" />
              
            </td>
          </tr>
          
        </table>
        
      </td>
    </tr>
  </table>
  
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

    // Get lead ID first if not provided
    let actualLeadId = leadId;
    if (!actualLeadId) {
      const { data: leadData } = await supabase
        .from("leads")
        .select("id")
        .eq("email", email)
        .single();
      actualLeadId = leadData?.id;
    }


    // First, insert the email sequence record to get the ID
    let emailSequenceId: string | null = null;
    
    if (actualLeadId) {
      const { data: insertData, error: insertError } = await supabase
        .from("email_sequences")
        .insert({
          lead_id: actualLeadId,
          sequence_type: sequenceType,
          subject: emailContent.subject,
          content: emailContent.content,
          status: "pending",
        })
        .select("id")
        .single();

      if (insertError) {
        console.error("Failed to save email sequence:", insertError);
      } else {
        emailSequenceId = insertData?.id;
      }
    }

    // Generate Apple-style HTML email with tracking
    const htmlEmail = generateAppleStyleEmail(
      emailContent.content, 
      name, 
      emailSequenceId || "unknown",
      actualLeadId || "unknown"
    );

    console.log(`Sending email to ${email}`);
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: "Quanta Mesh <onboarding@resend.dev>",
      to: [email],
      subject: emailContent.subject,
      html: htmlEmail,
    });

    if (emailError) {
      console.error("Resend error:", emailError);
      // Update email sequence status to failed
      if (emailSequenceId) {
        await supabase
          .from("email_sequences")
          .update({ status: "failed" })
          .eq("id", emailSequenceId);
      }
      throw emailError;
    }

    // Update email sequence status to sent
    if (emailSequenceId) {
      await supabase
        .from("email_sequences")
        .update({ status: "sent" })
        .eq("id", emailSequenceId);
    }

    // Update lead status
    if (actualLeadId) {
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
