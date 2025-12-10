import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");



const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ChatNotificationRequest {
  recipientEmail: string;
  recipientName: string | null;
  messageContent: string;
}

// Escape HTML entities to prevent XSS in emails
const escapeHtml = (text: string): string => {
  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return text.replace(/[&<>"']/g, (char) => htmlEntities[char] || char);
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { recipientEmail, recipientName, messageContent }: ChatNotificationRequest = await req.json();
    
    // Sanitize user-provided content
    const safeMessageContent = escapeHtml(messageContent);
    const safeRecipientName = recipientName ? escapeHtml(recipientName) : null;

    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    console.log("Sending chat notification to:", recipientEmail);

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "QuantaMesh Support <onboarding@resend.dev>",
        to: [recipientEmail],
        subject: "New message from QuantaMesh Support",
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0a0a0b; color: #ffffff; padding: 40px 20px; margin: 0;">
              <div style="max-width: 600px; margin: 0 auto; background-color: #18181b; border-radius: 16px; padding: 32px; border: 1px solid #27272a;">
                <div style="text-align: center; margin-bottom: 24px;">
                  <h1 style="color: #a855f7; margin: 0; font-size: 24px;">QuantaMesh</h1>
                </div>
                
                <h2 style="color: #ffffff; margin: 0 0 16px 0; font-size: 20px;">
                  Hi${safeRecipientName ? ` ${safeRecipientName}` : ''},
                </h2>
                
                <p style="color: #a1a1aa; margin: 0 0 24px 0; line-height: 1.6;">
                  You have a new message from our support team:
                </p>
                
                <div style="background-color: #27272a; border-radius: 12px; padding: 20px; margin-bottom: 24px; border-left: 4px solid #a855f7;">
                  <p style="color: #ffffff; margin: 0; line-height: 1.6; white-space: pre-wrap;">
                    ${safeMessageContent}
                  </p>
                </div>
                
                <div style="text-align: center;">
                  <a href="https://quantamesh.lovable.app/chat" style="display: inline-block; background: linear-gradient(135deg, #a855f7, #8b5cf6); color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
                    View Conversation
                  </a>
                </div>
                
                <hr style="border: none; border-top: 1px solid #27272a; margin: 32px 0;">
                
                <p style="color: #71717a; font-size: 12px; text-align: center; margin: 0;">
                  © ${new Date().getFullYear()} QuantaMesh. All rights reserved.<br>
                  This email was sent regarding your support conversation.
                </p>
              </div>
            </body>
          </html>
        `,
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.text();
      console.error("Resend API error:", errorData);
      throw new Error(`Failed to send email: ${errorData}`);
    }

    const data = await emailResponse.json();
    console.log("Email sent successfully:", data);

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-chat-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
