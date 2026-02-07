import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ADMIN_EMAILS = ["parasgupta4494@gmail.com", "sanchitsaggi07@gmail.com"];

// Escape HTML entities for email content
const escapeHtml = (text: string): string => {
  const htmlEntities: Record<string, string> = {
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  };
  return text.replace(/[&<>"']/g, (char) => htmlEntities[char] || char);
};

async function sendEmailNotification(
  resendApiKey: string,
  to: string[],
  subject: string,
  htmlContent: string
) {
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "QuantaMesh Chat <onboarding@resend.dev>",
        to,
        subject,
        html: htmlContent,
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      console.error("Resend error:", err);
    } else {
      console.log("Email sent to:", to.join(", "));
    }
  } catch (e) {
    console.error("Failed to send email:", e);
  }
}

function buildAdminNotificationEmail(clientName: string, clientEmail: string, messageContent: string): string {
  const safeContent = escapeHtml(messageContent);
  const safeName = escapeHtml(clientName);
  return `
    <!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0a0b; color: #ffffff; padding: 40px 20px; margin: 0;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #18181b; border-radius: 16px; padding: 32px; border: 1px solid #27272a;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #a855f7; margin: 0; font-size: 24px;">⚡ New Chat Message</h1>
        </div>
        <h2 style="color: #ffffff; margin: 0 0 8px 0; font-size: 18px;">New message from ${safeName}</h2>
        <p style="color: #a1a1aa; margin: 0 0 24px 0; font-size: 14px;">${escapeHtml(clientEmail)}</p>
        <div style="background-color: #27272a; border-radius: 12px; padding: 20px; margin-bottom: 24px; border-left: 4px solid #a855f7;">
          <p style="color: #ffffff; margin: 0; line-height: 1.6; white-space: pre-wrap;">${safeContent}</p>
        </div>
        <p style="color: #fbbf24; font-size: 14px; font-weight: 600; margin-bottom: 16px;">🤖 AI assistant is handling the initial response. Please connect with the client as soon as possible.</p>
        <div style="text-align: center;">
          <a href="https://quantamesh.lovable.app/admin" style="display: inline-block; background: linear-gradient(135deg, #a855f7, #8b5cf6); color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">Open Admin Chat</a>
        </div>
        <hr style="border: none; border-top: 1px solid #27272a; margin: 32px 0;">
        <p style="color: #71717a; font-size: 12px; text-align: center;">© ${new Date().getFullYear()} QuantaMesh</p>
      </div>
    </body></html>`;
}

function buildClientNotificationEmail(clientName: string): string {
  const safeName = escapeHtml(clientName);
  return `
    <!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0a0b; color: #ffffff; padding: 40px 20px; margin: 0;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #18181b; border-radius: 16px; padding: 32px; border: 1px solid #27272a;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #a855f7; margin: 0; font-size: 24px;">QuantaMesh</h1>
        </div>
        <h2 style="color: #ffffff; margin: 0 0 16px 0; font-size: 20px;">Hi${safeName ? ` ${safeName}` : ''}! 👋</h2>
        <p style="color: #a1a1aa; margin: 0 0 16px 0; line-height: 1.6;">
          Thanks for reaching out! We've received your message and our AI assistant is helping you right away.
        </p>
        <p style="color: #a1a1aa; margin: 0 0 24px 0; line-height: 1.6;">
          Our team has also been notified and will connect with you personally as soon as possible for any further assistance.
        </p>
        <div style="text-align: center;">
          <a href="https://quantamesh.lovable.app/chat" style="display: inline-block; background: linear-gradient(135deg, #a855f7, #8b5cf6); color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">Continue Chatting</a>
        </div>
        <hr style="border: none; border-top: 1px solid #27272a; margin: 32px 0;">
        <p style="color: #71717a; font-size: 12px; text-align: center;">© ${new Date().getFullYear()} QuantaMesh. All rights reserved.</p>
      </div>
    </body></html>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

    // Verify auth
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUser = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY") ?? "", {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { conversationId, messageContent } = await req.json();
    if (!conversationId || !messageContent) {
      return new Response(JSON.stringify({ error: "Missing conversationId or messageContent" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get conversation details
    const { data: conversation } = await supabase
      .from("conversations")
      .select("*")
      .eq("id", conversationId)
      .single();

    if (!conversation) {
      return new Response(JSON.stringify({ error: "Conversation not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get recent conversation history for context
    const { data: recentMessages } = await supabase
      .from("messages")
      .select("content, sender_type")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .limit(20);

    // Check if this is the first message (for email notifications)
    const isFirstMessage = !recentMessages || recentMessages.length <= 1;

    // Generate AI response
    let aiResponse = "Thank you for reaching out! Our team has been notified and will connect with you shortly. Is there anything else I can help you with in the meantime?";

    if (LOVABLE_API_KEY) {
      try {
        const chatHistory = (recentMessages || []).map(m => ({
          role: m.sender_type === "client" ? "user" as const : "assistant" as const,
          content: m.content,
        }));

        const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              {
                role: "system",
                content: `You are the AI assistant for Quanta Mesh, a company specializing in:
1. Android App Publishing to Google Play Store (starting at $25)
2. CGI Video Advertisement Production

Your role:
- Greet the client warmly and help them with their queries
- Answer questions about services, pricing, process, timelines
- Be professional, friendly, and concise (keep responses under 150 words)
- If you can't answer something specific, let them know a team member will follow up
- Never make up pricing beyond the base $25 app publishing fee
- Mention that a human team member will be connecting with them soon for personalized help
- Do NOT use markdown formatting. Write plain text only.
- Be helpful and conversational like a real support agent

Key info:
- App publishing starts at $25
- We handle the entire Google Play Store submission process
- CGI video ads are custom-quoted based on requirements
- Typical app publishing turnaround: 24-48 hours`
              },
              ...chatHistory,
            ],
            temperature: 0.7,
            max_tokens: 300,
          }),
        });

        if (aiRes.ok) {
          const aiData = await aiRes.json();
          const content = aiData.choices?.[0]?.message?.content;
          if (content) {
            aiResponse = content;
          }
        } else {
          console.error("AI API error:", aiRes.status);
          if (aiRes.status === 429) {
            aiResponse = "Thanks for reaching out! Our team has been notified and will be with you shortly. In the meantime, feel free to share more details about what you need help with!";
          }
        }
      } catch (e) {
        console.error("AI generation error:", e);
      }
    }

    // Insert AI response as an admin message (with a special sender_id to identify as AI)
    const AI_SENDER_ID = "00000000-0000-0000-0000-000000000000";

    const { error: insertError } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: AI_SENDER_ID,
      sender_type: "admin",
      content: aiResponse,
      is_read: false,
    });

    if (insertError) {
      console.error("Failed to insert AI message:", insertError);
      return new Response(JSON.stringify({ error: "Failed to save AI response" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update conversation last_message_at
    await supabase
      .from("conversations")
      .update({ last_message_at: new Date().toISOString() })
      .eq("id", conversationId);

    console.log("AI response sent for conversation:", conversationId);

    // Send email notifications (only on first message or every few messages)
    if (RESEND_API_KEY && isFirstMessage) {
      const clientName = conversation.user_name || "";
      const clientEmail = conversation.user_email;

      // Notify admins
      await sendEmailNotification(
        RESEND_API_KEY,
        ADMIN_EMAILS,
        `🔔 New Chat: ${clientName || clientEmail} needs help`,
        buildAdminNotificationEmail(clientName, clientEmail, messageContent)
      );

      // Notify client
      await sendEmailNotification(
        RESEND_API_KEY,
        [clientEmail],
        "We received your message! - QuantaMesh",
        buildClientNotificationEmail(clientName)
      );

      console.log("Email notifications sent to both parties");
    } else if (RESEND_API_KEY && !isFirstMessage) {
      // For subsequent messages, only notify admins
      const clientName = conversation.user_name || "";
      const clientEmail = conversation.user_email;

      await sendEmailNotification(
        RESEND_API_KEY,
        ADMIN_EMAILS,
        `💬 New message from ${clientName || clientEmail}`,
        buildAdminNotificationEmail(clientName, clientEmail, messageContent)
      );
    }

    return new Response(
      JSON.stringify({ success: true, aiResponse }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in chat-ai-respond:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
