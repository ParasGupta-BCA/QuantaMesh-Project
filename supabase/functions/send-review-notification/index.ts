import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Admin emails to notify
const ADMIN_EMAILS = [
  "parasgupta4494@gmail.com",
  "sanchitsaggi07@gmail.com"
];

interface ReviewNotificationRequest {
  customerName: string;
  rating: number;
  reviewText: string;
  orderId?: string;
}

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

const generateStars = (rating: number): string => {
  return "★".repeat(rating) + "☆".repeat(5 - rating);
};

const handler = async (req: Request): Promise<Response> => {
  console.log("Review notification function called");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { customerName, rating, reviewText, orderId }: ReviewNotificationRequest = await req.json();

    console.log("Review notification request:", { customerName, rating, orderId });

    if (!customerName || !rating || !reviewText) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: customerName, rating, or reviewText' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const safeCustomerName = escapeHtml(customerName);
    const safeReviewText = escapeHtml(reviewText);
    const stars = generateStars(rating);

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Review Submitted</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">🌟 New Review Submitted!</h1>
        </div>
        
        <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
          <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <p style="margin: 0 0 15px; font-size: 16px;">
              <strong>Customer:</strong> ${safeCustomerName}
            </p>
            
            <p style="margin: 0 0 15px; font-size: 16px;">
              <strong>Rating:</strong> <span style="color: #f59e0b; font-size: 20px;">${stars}</span> (${rating}/5)
            </p>
            
            ${orderId ? `<p style="margin: 0 0 15px; font-size: 14px; color: #6b7280;"><strong>Order ID:</strong> ${escapeHtml(orderId)}</p>` : ''}
            
            <div style="background: #f3f4f6; padding: 15px; border-radius: 6px; margin-top: 15px;">
              <p style="margin: 0 0 5px; font-weight: bold; color: #374151;">Review:</p>
              <p style="margin: 0; color: #4b5563; font-style: italic;">"${safeReviewText}"</p>
            </div>
          </div>
          
          <div style="margin-top: 25px; text-align: center;">
            <p style="color: #6b7280; font-size: 14px; margin: 0 0 15px;">
              This review is pending approval. Please log in to the admin panel to approve or reject it.
            </p>
            <a href="https://hnnlhddnettfaapyjggx.lovableproject.com/admin" 
               style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: bold;">
              Go to Admin Panel
            </a>
          </div>
        </div>
        
        <p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 20px;">
          This is an automated notification from Play Store Publisher.
        </p>
      </body>
      </html>
    `;

    // Send email to all admins using fetch
    const emailPromises = ADMIN_EMAILS.map(email => 
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Play Store Publisher <onboarding@resend.dev>",
          to: [email],
          subject: `⭐ New ${rating}-Star Review from ${safeCustomerName}`,
          html: emailHtml,
        }),
      })
    );

    const results = await Promise.allSettled(emailPromises);
    
    const successCount = results.filter(r => r.status === 'fulfilled' && (r.value as Response).ok).length;
    const failCount = results.length - successCount;

    console.log(`Email notifications sent: ${successCount} success, ${failCount} failed`);

    if (failCount > 0) {
      const failures = results
        .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
        .map(r => r.reason);
      console.error("Failed emails:", failures);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Notifications sent to ${successCount} admin(s)`,
        successCount,
        failCount
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Error in send-review-notification:", errorMessage);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
