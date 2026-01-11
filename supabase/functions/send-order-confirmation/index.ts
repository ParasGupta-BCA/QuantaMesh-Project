import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// Base URL for hosted images
const BASE_URL = "https://www.quantamesh.store";

interface OrderConfirmationRequest {
  email: string;
  customerName: string;
  appName: string;
  orderId: string;
  totalPrice: number;
  addOns?: string[];
}

function generateOrderConfirmationEmail(
  customerName: string,
  appName: string,
  orderId: string,
  totalPrice: number,
  addOns: string[] = []
): string {
  const addOnsHtml = addOns.length > 0
    ? addOns.map(addon => `
      <tr>
        <td style="padding: 8px 0; font-size: 14px; color: #86868b;">• ${addon}</td>
      </tr>
    `).join('')
    : '';

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
  <title>Order Confirmed - Quanta Mesh</title>
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
      .dark-card { background-color: #2d2d2f !important; border-color: #424245 !important; }
    }
    
    [data-ogsc] .dark-bg { background-color: #1d1d1f !important; }
    [data-ogsc] .dark-text { color: #f5f5f7 !important; }
    [data-ogsc] .dark-card { background-color: #2d2d2f !important; }
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
              <img src="${BASE_URL}/order-confirmed-banner.png" alt="Order Confirmed" width="600" style="width: 100%; max-width: 600px; height: auto; display: block;">
            </td>
          </tr>
          
          <!-- Success Badge + Header -->
          <tr>
            <td style="padding: 32px 24px 16px; text-align: center;">
              
              <!-- Success Badge -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td align="center" style="padding-bottom: 20px;">
                    <span style="display: inline-block; background: linear-gradient(135deg, #34c759 0%, #30d158 100%); color: #ffffff; font-size: 12px; font-weight: 600; padding: 8px 20px; border-radius: 50px;">
                      ✓ Payment Successful
                    </span>
                  </td>
                </tr>
              </table>
              
              <!-- Headline -->
              <h1 style="margin: 0 0 12px; font-size: 26px; font-weight: 700; line-height: 1.15; color: #1d1d1f; letter-spacing: -0.5px;" class="dark-text">
                Thank you, ${customerName}!
              </h1>
              
              <!-- Subheadline -->
              <p style="margin: 0; font-size: 15px; font-weight: 400; line-height: 1.4; color: #86868b;">
                Your order is confirmed and we're getting started right away.
              </p>
              
            </td>
          </tr>
          
          <!-- Order Details Card -->
          <tr>
            <td style="padding: 16px 24px 24px;">
              
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f5f5f7; border-radius: 12px; border: 1px solid #e5e5e5;" class="dark-card">
                
                <!-- Card Header -->
                <tr>
                  <td style="padding: 20px 20px 16px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #86868b;">
                          Order Details
                        </td>
                        <td align="right" style="font-size: 12px; font-weight: 500; color: #1d1d1f; font-family: 'SF Mono', Monaco, Consolas, monospace;" class="dark-text">
                          #${orderId.slice(0, 8).toUpperCase()}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Divider -->
                <tr>
                  <td style="padding: 0 20px;">
                    <div style="height: 1px; background-color: #e5e5e5;"></div>
                  </td>
                </tr>
                
                <!-- Order Rows -->
                <tr>
                  <td style="padding: 16px 20px;">
                    
                    <!-- App Name Row -->
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 12px;">
                      <tr>
                        <td style="font-size: 14px; color: #86868b; width: 40%;">App Name</td>
                        <td align="right" style="font-size: 14px; font-weight: 500; color: #1d1d1f;" class="dark-text">${appName}</td>
                      </tr>
                    </table>
                    
                    <!-- Service Row -->
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 12px;">
                      <tr>
                        <td style="font-size: 14px; color: #86868b; width: 40%;">Service</td>
                        <td align="right" style="font-size: 14px; font-weight: 500; color: #1d1d1f;" class="dark-text">Play Store Publishing</td>
                      </tr>
                    </table>
                    
                    ${addOns.length > 0 ? `
                    <!-- Add-ons -->
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 12px;">
                      <tr>
                        <td colspan="2" style="font-size: 13px; font-weight: 600; color: #1d1d1f; padding-bottom: 8px;" class="dark-text">Add-ons:</td>
                      </tr>
                      ${addOnsHtml}
                    </table>
                    ` : ''}
                    
                  </td>
                </tr>
                
                <!-- Total Divider -->
                <tr>
                  <td style="padding: 0 20px;">
                    <div style="height: 2px; background-color: #1d1d1f;"></div>
                  </td>
                </tr>
                
                <!-- Total Row -->
                <tr>
                  <td style="padding: 16px 20px 20px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td style="font-size: 15px; font-weight: 600; color: #1d1d1f;" class="dark-text">Total Paid</td>
                        <td align="right" style="font-size: 22px; font-weight: 700; color: #1d1d1f;" class="dark-text">$${totalPrice.toFixed(2)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
              </table>
              
            </td>
          </tr>
          
          <!-- What Happens Next Section -->
          <tr>
            <td style="padding: 0 24px 24px;">
              
              <p style="margin: 0 0 16px; font-size: 15px; font-weight: 600; color: #1d1d1f; text-align: center;" class="dark-text">
                What happens next?
              </p>
              
              <!-- Timeline Step 1 -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 12px;">
                <tr>
                  <td width="36" valign="top">
                    <div style="width: 24px; height: 24px; background: linear-gradient(135deg, #0071e3 0%, #5ac8fa 100%); border-radius: 50%; text-align: center; line-height: 24px; color: #ffffff; font-size: 12px; font-weight: 600;">1</div>
                  </td>
                  <td style="padding-left: 8px;">
                    <p style="margin: 0 0 2px; font-size: 14px; font-weight: 600; color: #1d1d1f;" class="dark-text">Review & Optimization</p>
                    <p style="margin: 0; font-size: 12px; color: #86868b;">We review your app and optimize the listing</p>
                  </td>
                </tr>
              </table>
              
              <!-- Timeline Step 2 -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 12px;">
                <tr>
                  <td width="36" valign="top">
                    <div style="width: 24px; height: 24px; background: linear-gradient(135deg, #0071e3 0%, #5ac8fa 100%); border-radius: 50%; text-align: center; line-height: 24px; color: #ffffff; font-size: 12px; font-weight: 600;">2</div>
                  </td>
                  <td style="padding-left: 8px;">
                    <p style="margin: 0 0 2px; font-size: 14px; font-weight: 600; color: #1d1d1f;" class="dark-text">Submission to Play Store</p>
                    <p style="margin: 0; font-size: 12px; color: #86868b;">We submit with optimized metadata</p>
                  </td>
                </tr>
              </table>
              
              <!-- Timeline Step 3 -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td width="36" valign="top">
                    <div style="width: 24px; height: 24px; background: linear-gradient(135deg, #0071e3 0%, #5ac8fa 100%); border-radius: 50%; text-align: center; line-height: 24px; color: #ffffff; font-size: 12px; font-weight: 600;">3</div>
                  </td>
                  <td style="padding-left: 8px;">
                    <p style="margin: 0 0 2px; font-size: 14px; font-weight: 600; color: #1d1d1f;" class="dark-text">Live on Play Store</p>
                    <p style="margin: 0; font-size: 12px; color: #86868b;">Your app goes live within 24-48 hours</p>
                  </td>
                </tr>
              </table>
              
            </td>
          </tr>
          
          <!-- CTA Section -->
          <tr>
            <td style="padding: 0 24px 24px; text-align: center;">
              
              <!-- Primary CTA -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td align="center">
                    <a href="${BASE_URL}/chat" target="_blank" style="display: inline-block; background-color: #0071e3; color: #ffffff; font-size: 15px; font-weight: 500; text-decoration: none; padding: 14px 36px; border-radius: 50px; min-width: 180px;">
                      Track Your Order
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Secondary Link -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td align="center" style="padding-top: 14px;">
                    <a href="${BASE_URL}/services" target="_blank" style="color: #0071e3; font-size: 14px; text-decoration: none;">
                      View Our Services
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Help Text -->
              <p style="margin: 20px 0 0; font-size: 13px; color: #86868b; line-height: 1.5;">
                Questions? Reply to this email or use our live chat.
              </p>
              
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
              <p style="margin: 0 0 12px; font-size: 18px; font-weight: 700; color: #1d1d1f; letter-spacing: -0.5px;" class="dark-text">
                Quanta Mesh
              </p>
              
              <!-- Footer Text -->
              <p style="margin: 0 0 6px; font-size: 11px; color: #86868b; line-height: 1.5;">
                Android App Publishing Service
              </p>
              <p style="margin: 0 0 14px; font-size: 11px; color: #86868b;">
                Trusted by 500+ developers worldwide
              </p>
              
              <!-- Footer Links -->
              <p style="margin: 0 0 14px; font-size: 11px;">
                <a href="${BASE_URL}" target="_blank" style="color: #0071e3; text-decoration: none; margin: 0 6px;">Website</a>
                <a href="${BASE_URL}/services" target="_blank" style="color: #0071e3; text-decoration: none; margin: 0 6px;">Services</a>
                <a href="${BASE_URL}/contact" target="_blank" style="color: #0071e3; text-decoration: none; margin: 0 6px;">Contact</a>
                <a href="${BASE_URL}/privacy-policy" target="_blank" style="color: #0071e3; text-decoration: none; margin: 0 6px;">Privacy</a>
              </p>
              
              <p style="margin: 0; font-size: 10px; color: #adadad;">
                © ${new Date().getFullYear()} Quanta Mesh. All rights reserved.
              </p>
              
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

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, customerName, appName, orderId, totalPrice, addOns }: OrderConfirmationRequest = await req.json();

    // Validate required fields
    if (!email || !customerName || !appName || !orderId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Sending order confirmation to ${email} for order ${orderId}`);

    const emailHtml = generateOrderConfirmationEmail(
      customerName,
      appName,
      orderId,
      totalPrice || 25,
      addOns
    );

    const emailResponse = await resend.emails.send({
      from: "Quanta Mesh <noreply@quantamesh.store>",
      to: [email],
      subject: `Order Confirmed! Your app "${appName}" is being processed 🚀`,
      html: emailHtml,
    });

    console.log("Order confirmation email sent:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, emailResponse }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error sending order confirmation:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
