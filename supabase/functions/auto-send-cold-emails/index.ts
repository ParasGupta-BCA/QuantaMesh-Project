import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const now = new Date();
    const today = now.toISOString().split("T")[0];

    // Get prospects that need emails (not unsubscribed/converted, max 3 emails)
    const { data: prospects, error } = await supabase
      .from("cold_outreach")
      .select("*")
      .in("status", ["pending", "sent", "opened"])
      .lt("emails_sent", 3);

    if (error) throw error;

    console.log(`Found ${prospects?.length || 0} prospects for daily cold emails`);

    let sent = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const prospect of prospects || []) {
      try {
        // Skip if already sent today
        if (prospect.last_sent_at) {
          const lastDate = new Date(prospect.last_sent_at).toISOString().split("T")[0];
          if (lastDate === today) {
            skipped++;
            continue;
          }

          // Wait at least 2 days between emails
          const daysSinceLast = Math.floor(
            (now.getTime() - new Date(prospect.last_sent_at).getTime()) / (1000 * 60 * 60 * 24)
          );
          if (daysSinceLast < 2) {
            skipped++;
            continue;
          }
        }

        // Send via send-cold-email function
        const response = await fetch(`${SUPABASE_URL}/functions/v1/send-cold-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          },
          body: JSON.stringify({ prospectId: prospect.id }),
        });

        if (!response.ok) {
          const errText = await response.text();
          errors.push(`Failed for ${prospect.email}: ${errText}`);
          continue;
        }

        sent++;
        console.log(`Cold email sent to ${prospect.email} (email #${prospect.emails_sent + 1})`);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        errors.push(`Error for ${prospect.email}: ${msg}`);
      }
    }

    console.log(`Cold email cron done: ${sent} sent, ${skipped} skipped, ${errors.length} errors`);

    return new Response(
      JSON.stringify({ success: true, sent, skipped, errors, timestamp: now.toISOString() }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in auto-send-cold-emails:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
