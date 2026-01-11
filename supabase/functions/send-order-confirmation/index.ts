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
    ? `
      <div style="background: #f5f5f7; border-radius: 12px; padding: 20px; margin: 24px 0; text-align: left;">
        <p style="font-size: 14px; font-weight: 600; color: #1d1d1f; margin: 0 0 12px 0;">Add-ons included:</p>
        <ul style="margin: 0; padding-left: 20px; color: #86868b;">
          ${addOns.map(addon => `<li style="font-size: 14px; margin-bottom: 4px;">${addon}</li>`).join('')}
        </ul>
      </div>
    `
    : '';

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
    
    .success-badge {
      display: inline-block;
      background: linear-gradient(135deg, #34c759 0%, #30d158 100%);
      color: #ffffff;
      font-size: 13px;
      font-weight: 600;
      padding: 8px 20px;
      border-radius: 100px;
      margin-bottom: 24px;
      letter-spacing: 0.3px;
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
    
    .order-card {
      background: linear-gradient(145deg, #f5f5f7 0%, #ffffff 100%);
      border: 1px solid #e5e5e5;
      border-radius: 16px;
      padding: 32px;
      margin: 32px 0;
      text-align: left;
    }
    
    .order-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid #e5e5e5;
    }
    
    .order-label {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #86868b;
    }
    
    .order-id {
      font-size: 14px;
      font-weight: 500;
      color: #1d1d1f;
      font-family: 'SF Mono', Monaco, monospace;
    }
    
    .order-row {
      display: table;
      width: 100%;
      margin-bottom: 12px;
    }
    
    .order-row-label {
      display: table-cell;
      font-size: 15px;
      color: #86868b;
      width: 40%;
    }
    
    .order-row-value {
      display: table-cell;
      font-size: 15px;
      font-weight: 500;
      color: #1d1d1f;
      text-align: right;
    }
    
    .order-total {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 2px solid #1d1d1f;
    }
    
    .order-total .order-row-label {
      font-size: 17px;
      font-weight: 600;
      color: #1d1d1f;
    }
    
    .order-total .order-row-value {
      font-size: 24px;
      font-weight: 700;
      color: #1d1d1f;
    }
    
    .timeline {
      margin: 40px 0;
      text-align: left;
    }
    
    .timeline-title {
      font-size: 17px;
      font-weight: 600;
      color: #1d1d1f;
      margin-bottom: 20px;
      text-align: center;
    }
    
    .timeline-item {
      display: table;
      width: 100%;
      margin-bottom: 16px;
    }
    
    .timeline-icon {
      display: table-cell;
      width: 40px;
      vertical-align: top;
    }
    
    .timeline-dot {
      width: 24px;
      height: 24px;
      background: linear-gradient(135deg, #0071e3 0%, #5ac8fa 100%);
      border-radius: 50%;
      text-align: center;
      line-height: 24px;
      color: #ffffff;
      font-size: 12px;
    }
    
    .timeline-content {
      display: table-cell;
      vertical-align: top;
      padding-left: 12px;
    }
    
    .timeline-step {
      font-size: 15px;
      font-weight: 600;
      color: #1d1d1f;
      margin-bottom: 2px;
    }
    
    .timeline-desc {
      font-size: 13px;
      color: #86868b;
    }
    
    .cta-section {
      padding: 32px 0;
      text-align: center;
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
    
    .cta-secondary {
      display: block;
      margin-top: 16px;
      font-size: 17px;
      color: #0071e3;
      text-decoration: none;
    }
    
    .help-text {
      font-size: 14px;
      color: #86868b;
      margin-top: 24px;
      line-height: 1.6;
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
    
    /* Responsive Styles */
    @media only screen and (max-width: 600px) {
      .wrapper {
        padding: 16px 12px;
      }
      
      .container {
        border-radius: 12px;
      }
      
      .content-wrapper {
        padding: 28px 20px 24px;
      }
      
      .headline {
        font-size: 28px;
        margin-bottom: 12px;
      }
      
      .subheadline {
        font-size: 17px;
        margin-bottom: 24px;
      }
      
      .success-badge {
        font-size: 12px;
        padding: 6px 16px;
        margin-bottom: 20px;
      }
      
      .order-card {
        padding: 20px;
        margin: 24px 0;
        border-radius: 12px;
      }
      
      .order-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }
      
      .order-id {
        font-size: 12px;
      }
      
      .order-row-label,
      .order-row-value {
        font-size: 14px;
      }
      
      .order-total .order-row-value {
        font-size: 20px;
      }
      
      .timeline {
        margin: 32px 0;
      }
      
      .timeline-title {
        font-size: 15px;
      }
      
      .timeline-step {
        font-size: 14px;
      }
      
      .timeline-desc {
        font-size: 12px;
      }
      
      .cta-button {
        display: block;
        width: 100%;
        padding: 18px 24px;
        font-size: 16px;
      }
      
      .cta-secondary {
        font-size: 15px;
        margin-top: 12px;
      }
      
      .help-text {
        font-size: 13px;
      }
      
      .divider {
        margin: 32px 20px;
      }
      
      .footer {
        padding: 0 20px 32px;
      }
      
      .footer-logo {
        font-size: 20px;
      }
      
      .footer-text {
        font-size: 11px;
      }
      
      .footer-link {
        font-size: 11px;
        margin: 0 6px;
      }
    }
    
    @media only screen and (max-width: 400px) {
      .wrapper {
        padding: 12px 8px;
      }
      
      .content-wrapper {
        padding: 24px 16px 20px;
      }
      
      .headline {
        font-size: 24px;
      }
      
      .subheadline {
        font-size: 15px;
      }
      
      .order-card {
        padding: 16px;
      }
    }
    
    /* Dark Mode Support */
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
      
      .headline,
      .order-row-value,
      .order-total .order-row-label,
      .timeline-step {
        color: #f5f5f7;
      }
      
      .order-card {
        background: linear-gradient(145deg, #2d2d2f 0%, #1d1d1f 100%);
        border-color: #424245;
      }
      
      .order-header {
        border-bottom-color: #424245;
      }
      
      .order-id {
        color: #f5f5f7;
      }
      
      .order-total {
        border-top-color: #f5f5f7;
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
        src="${BASE_URL}/order-confirmed-banner.png" 
        alt="Order Confirmed" 
        class="hero-image"
        width="680"
        style="width: 100%; height: auto; display: block;"
      />
      
      <!-- Main Content -->
      <div class="content-wrapper">
        <span class="success-badge">✓ Payment Successful</span>
        
        <h1 class="headline">Thank you, ${customerName}!</h1>
        <p class="subheadline">Your order has been confirmed and we're getting started right away.</p>
        
        <!-- Order Details Card -->
        <div class="order-card">
          <div class="order-header">
            <span class="order-label">Order Details</span>
            <span class="order-id">#${orderId.slice(0, 8).toUpperCase()}</span>
          </div>
          
          <div class="order-row">
            <span class="order-row-label">App Name</span>
            <span class="order-row-value">${appName}</span>
          </div>
          
          <div class="order-row">
            <span class="order-row-label">Service</span>
            <span class="order-row-value">Play Store Publishing</span>
          </div>
          
          ${addOnsHtml}
          
          <div class="order-row order-total">
            <span class="order-row-label">Total Paid</span>
            <span class="order-row-value">$${totalPrice.toFixed(2)}</span>
          </div>
        </div>
        
        <!-- Timeline -->
        <div class="timeline">
          <p class="timeline-title">What happens next?</p>
          
          <div class="timeline-item">
            <div class="timeline-icon">
              <div class="timeline-dot">1</div>
            </div>
            <div class="timeline-content">
              <p class="timeline-step">Review & Optimization</p>
              <p class="timeline-desc">We review your app and optimize the listing</p>
            </div>
          </div>
          
          <div class="timeline-item">
            <div class="timeline-icon">
              <div class="timeline-dot">2</div>
            </div>
            <div class="timeline-content">
              <p class="timeline-step">Submission to Google Play</p>
              <p class="timeline-desc">We submit your app with optimized metadata</p>
            </div>
          </div>
          
          <div class="timeline-item">
            <div class="timeline-icon">
              <div class="timeline-dot">3</div>
            </div>
            <div class="timeline-content">
              <p class="timeline-step">Live on Play Store</p>
              <p class="timeline-desc">Your app goes live within 24-48 hours</p>
            </div>
          </div>
        </div>
        
        <!-- CTA Section -->
        <div class="cta-section">
          <a href="${BASE_URL}/chat" class="cta-button">Track Your Order</a>
          <a href="${BASE_URL}/services" class="cta-secondary">View Our Services</a>
        </div>
        
        <p class="help-text">
          Questions? Just reply to this email or use our live chat. We're here to help!
        </p>
      </div>
      
      <div class="divider"></div>
      
      <!-- Footer -->
      <div class="footer">
        <p class="footer-logo">Quanta Mesh</p>
        <p class="footer-text">
          Android App Publishing Service<br/>
          Trusted by 500+ developers worldwide
        </p>
        <div class="footer-links">
          <a href="${BASE_URL}" class="footer-link">Website</a>
          <a href="${BASE_URL}/services" class="footer-link">Services</a>
          <a href="${BASE_URL}/contact" class="footer-link">Contact</a>
          <a href="${BASE_URL}/privacy" class="footer-link">Privacy</a>
        </div>
        <p class="footer-text" style="margin-top: 16px;">
          © ${new Date().getFullYear()} Quanta Mesh. All rights reserved.
        </p>
      </div>
    </div>
  </div>
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
