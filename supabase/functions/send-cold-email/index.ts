import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const ADMIN_TEAM = [
  { name: "Paras Gupta", role: "Founder & Lead Developer" },
  { name: "Sanchit Saggi", role: "Co-Founder & Business Strategist" },
];

const PORTFOLIO_ITEMS = [
  { name: "Play Store App Publishing", desc: "End-to-end app listing optimization & publishing on Google Play Store" },
  { name: "ASO Optimization", desc: "Keyword research, screenshot design & listing optimization for maximum visibility" },
  { name: "CGI Ad Creation", desc: "High-quality CGI advertisements that drive engagement & conversions" },
  { name: "App Store Strategy", desc: "Complete strategy for app growth, ratings & user acquisition" },
];

function buildColdEmailHtml(prospect: {
  client_name: string;
  job_title: string;
  company_name: string;
}, emailNumber: number): string {
  const subject = emailNumber <= 1
    ? `Elevate ${prospect.company_name}'s Digital Presence`
    : emailNumber === 2
    ? `Quick follow-up for ${prospect.company_name}`
    : `Last chance: Exclusive offer for ${prospect.company_name}`;

  const greeting = emailNumber <= 1
    ? `I noticed ${prospect.company_name} and wanted to reach out personally.`
    : emailNumber === 2
    ? `I wanted to follow up on my previous email about helping ${prospect.company_name} grow.`
    : `This is my final follow-up — I truly believe we can make a difference for ${prospect.company_name}.`;

  const portfolioHtml = PORTFOLIO_ITEMS.map(item => `
    <tr>
      <td style="padding:12px 20px;border-bottom:1px solid #f0f0f0;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr>
            <td width="8" style="padding-right:12px;vertical-align:top;">
              <div style="width:8px;height:8px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#8b5cf6);margin-top:6px;"></div>
            </td>
            <td>
              <p style="margin:0;font-weight:600;color:#1a1a2e;font-size:15px;">${item.name}</p>
              <p style="margin:4px 0 0;color:#64748b;font-size:13px;line-height:1.4;">${item.desc}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `).join("");

  const teamHtml = ADMIN_TEAM.map(admin => `
    <tr>
      <td style="padding:8px 20px;">
        <table cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="width:40px;height:40px;background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:50%;text-align:center;vertical-align:middle;color:#ffffff;font-weight:700;font-size:16px;">
              ${admin.name.charAt(0)}
            </td>
            <td style="padding-left:12px;">
              <p style="margin:0;font-weight:600;color:#1a1a2e;font-size:14px;">${admin.name}</p>
              <p style="margin:2px 0 0;color:#6366f1;font-size:12px;font-weight:500;">${admin.role}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `).join("");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<meta http-equiv="X-UA-Compatible" content="IE=edge"/>
<!--[if mso]>
<noscript>
<xml>
<o:OfficeDocumentSettings>
<o:AllowPNG/>
<o:PixelsPerInch>96</o:PixelsPerInch>
</o:OfficeDocumentSettings>
</xml>
</noscript>
<![endif]-->
<style>
  @media only screen and (max-width:620px){
    .email-container{width:100%!important;padding:0!important;}
    .content-cell{padding:20px 16px!important;}
    .hero-cell{padding:30px 16px!important;}
    .portfolio-table{width:100%!important;}
    .cta-button{width:100%!important;text-align:center!important;}
    .footer-cell{padding:20px 16px!important;}
  }
</style>
</head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;">

<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f8fafc;">
<tr><td align="center" style="padding:20px 10px;">

<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" class="email-container" style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

<!-- Header -->
<tr>
<td class="hero-cell" style="padding:40px 40px 30px;background:linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%);text-align:center;">
  <table cellpadding="0" cellspacing="0" border="0" width="100%">
    <tr>
      <td align="center">
        <div style="width:56px;height:56px;background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:14px;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;">
          <img src="https://quantamesh.lovable.app/logo.png" alt="QuantaMesh" width="40" height="40" style="display:block;border-radius:10px;" />
        </div>
        <h1 style="margin:0;font-size:24px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">QuantaMesh</h1>
        <p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,0.7);letter-spacing:0.5px;">DIGITAL GROWTH PARTNER</p>
      </td>
    </tr>
  </table>
</td>
</tr>

<!-- Greeting -->
<tr>
<td class="content-cell" style="padding:32px 40px 16px;">
  <p style="margin:0;font-size:18px;font-weight:600;color:#1a1a2e;">Hi ${prospect.client_name},</p>
  <p style="margin:12px 0 0;font-size:15px;line-height:1.6;color:#475569;">${greeting}</p>
  <p style="margin:12px 0 0;font-size:15px;line-height:1.6;color:#475569;">
    As ${prospect.job_title} at <strong>${prospect.company_name}</strong>, you understand the importance of a strong digital presence. At <strong>QuantaMesh</strong>, we specialize in helping businesses like yours dominate the app marketplace.
  </p>
</td>
</tr>

<!-- Portfolio Section -->
<tr>
<td class="content-cell" style="padding:16px 40px;">
  <div style="background:linear-gradient(135deg,#f8fafc,#eef2ff);border-radius:12px;overflow:hidden;border:1px solid #e0e7ff;">
    <table cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr>
        <td style="padding:16px 20px 8px;">
          <p style="margin:0;font-size:11px;font-weight:700;color:#6366f1;letter-spacing:1.5px;text-transform:uppercase;">What We've Delivered</p>
        </td>
      </tr>
      ${portfolioHtml}
    </table>
  </div>
</td>
</tr>

<!-- CTA -->
<tr>
<td class="content-cell" style="padding:20px 40px;" align="center">
  <table cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center" style="background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:12px;">
        <a href="https://quantamesh.lovable.app/contact" target="_blank" class="cta-button" style="display:inline-block;padding:14px 40px;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;letter-spacing:0.3px;">
          Let's Talk Growth →
        </a>
      </td>
    </tr>
  </table>
</td>
</tr>

<!-- Team Section -->
<tr>
<td class="content-cell" style="padding:16px 40px;">
  <div style="background:#fafafa;border-radius:12px;overflow:hidden;border:1px solid #f0f0f0;">
    <table cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr>
        <td style="padding:16px 20px 8px;">
          <p style="margin:0;font-size:11px;font-weight:700;color:#6366f1;letter-spacing:1.5px;text-transform:uppercase;">Your Dedicated Team</p>
        </td>
      </tr>
      ${teamHtml}
      <tr><td style="padding:8px;"></td></tr>
    </table>
  </div>
</td>
</tr>

<!-- Footer -->
<tr>
<td class="footer-cell" style="padding:24px 40px 32px;border-top:1px solid #f0f0f0;text-align:center;">
  <p style="margin:0;font-size:13px;color:#94a3b8;">Warm regards,</p>
  <p style="margin:4px 0 0;font-size:15px;font-weight:600;color:#1a1a2e;">The QuantaMesh Team</p>
  <p style="margin:16px 0 0;font-size:11px;color:#cbd5e1;">
    QuantaMesh • Digital Growth Partner<br/>
    <a href="https://quantamesh.lovable.app" style="color:#6366f1;text-decoration:none;">quantamesh.lovable.app</a>
  </p>
  <p style="margin:12px 0 0;font-size:10px;color:#cbd5e1;">
    Don't want to receive these emails? <a href="https://quantamesh.lovable.app" style="color:#94a3b8;text-decoration:underline;">Unsubscribe</a>
  </p>
</td>
</tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

function getSubject(prospect: { company_name: string }, emailNumber: number): string {
  if (emailNumber <= 1) return `Elevate ${prospect.company_name}'s Digital Presence | QuantaMesh`;
  if (emailNumber === 2) return `Quick follow-up for ${prospect.company_name} | QuantaMesh`;
  return `Last chance: Exclusive offer for ${prospect.company_name} | QuantaMesh`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { prospectId } = await req.json();

    if (!prospectId) {
      throw new Error("prospectId is required");
    }

    const { data: prospect, error: fetchError } = await supabase
      .from("cold_outreach")
      .select("*")
      .eq("id", prospectId)
      .single();

    if (fetchError || !prospect) {
      throw new Error("Prospect not found");
    }

    if (prospect.status === "unsubscribed") {
      throw new Error("Prospect has unsubscribed");
    }

    const emailNumber = (prospect.emails_sent || 0) + 1;
    const subject = getSubject(prospect, emailNumber);
    const html = buildColdEmailHtml(prospect, emailNumber);

    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY not configured");
    }

    console.log(`Sending cold email #${emailNumber} to ${prospect.email}`);

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "QuantaMesh <hello@quantamesh.store>",
        to: [prospect.email],
        subject,
        html,
      }),
    });

    if (!emailRes.ok) {
      const errText = await emailRes.text();
      console.error("Resend error:", errText);
      throw new Error(`Email send failed: ${errText}`);
    }

    const emailResult = await emailRes.json();
    console.log("Email sent successfully:", emailResult);

    // Update prospect
    await supabase
      .from("cold_outreach")
      .update({
        emails_sent: emailNumber,
        last_sent_at: new Date().toISOString(),
        status: prospect.status === "pending" ? "sent" : prospect.status,
      })
      .eq("id", prospectId);

    return new Response(
      JSON.stringify({ success: true, emailId: emailResult.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in send-cold-email:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
