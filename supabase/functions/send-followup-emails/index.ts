import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface Lead {
  id: string;
  email: string;
  name: string;
  status: string;
  created_at: string;
  last_contacted_at: string | null;
}

interface EmailSequence {
  sequence_type: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const now = new Date();
    
    // Get leads that haven't converted (status is not 'converted')
    const { data: leads, error: leadsError } = await supabase
      .from("leads")
      .select("id, email, name, status, created_at, last_contacted_at")
      .neq("status", "converted")
      .neq("status", "unsubscribed");

    if (leadsError) {
      throw leadsError;
    }

    console.log(`Found ${leads?.length || 0} leads to process`);

    const results: { sent: number; skipped: number; errors: string[] } = {
      sent: 0,
      skipped: 0,
      errors: [],
    };

    for (const lead of leads || []) {
      try {
        // Get emails already sent to this lead
        const { data: sentEmails } = await supabase
          .from("email_sequences")
          .select("sequence_type")
          .eq("lead_id", lead.id);

        const sentTypes = new Set((sentEmails || []).map((e: EmailSequence) => e.sequence_type));
        const daysSinceSignup = Math.floor(
          (now.getTime() - new Date(lead.created_at).getTime()) / (1000 * 60 * 60 * 24)
        );

        // Determine which follow-up to send based on days since signup
        let sequenceType: string | null = null;

        if (daysSinceSignup >= 14 && !sentTypes.has("follow_up_3")) {
          sequenceType = "follow_up_3";
        } else if (daysSinceSignup >= 7 && !sentTypes.has("follow_up_2")) {
          sequenceType = "follow_up_2";
        } else if (daysSinceSignup >= 3 && !sentTypes.has("follow_up")) {
          sequenceType = "follow_up";
        }

        if (!sequenceType) {
          results.skipped++;
          continue;
        }

        // Send the follow-up email via send-lead-email function
        console.log(`Sending ${sequenceType} to ${lead.email} (${daysSinceSignup} days old)`);
        
        const response = await fetch(`${SUPABASE_URL}/functions/v1/send-lead-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          },
          body: JSON.stringify({
            leadId: lead.id,
            email: lead.email,
            name: lead.name,
            sequenceType,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          results.errors.push(`Failed to send to ${lead.email}: ${errorText}`);
          continue;
        }

        results.sent++;
        console.log(`Successfully sent ${sequenceType} to ${lead.email}`);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        results.errors.push(`Error processing ${lead.email}: ${message}`);
      }
    }

    console.log(`Cron job complete: ${results.sent} sent, ${results.skipped} skipped, ${results.errors.length} errors`);

    return new Response(
      JSON.stringify({
        success: true,
        results,
        timestamp: now.toISOString(),
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error in send-followup-emails:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
