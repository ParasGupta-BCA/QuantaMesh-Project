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
  sent_at: string;
}

// Daily engagement email topics that rotate
const DAILY_TOPICS = [
  "tip_aso",           // App Store Optimization tips
  "tip_screenshots",   // Screenshot best practices
  "tip_description",   // Description writing tips
  "tip_keywords",      // Keyword optimization
  "tip_updates",       // App update strategies
  "tip_reviews",       // Getting positive reviews
  "tip_monetization",  // Monetization strategies
];

function getDailyTopic(): string {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  return DAILY_TOPICS[dayOfYear % DAILY_TOPICS.length];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const now = new Date();
    const today = now.toISOString().split("T")[0]; // YYYY-MM-DD format
    
    // Get leads that haven't converted (status is not 'converted' or 'unsubscribed')
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
          .select("sequence_type, sent_at")
          .eq("lead_id", lead.id)
          .order("sent_at", { ascending: false });

        const sentTypes = new Set((sentEmails || []).map((e: EmailSequence) => e.sequence_type));
        const daysSinceSignup = Math.floor(
          (now.getTime() - new Date(lead.created_at).getTime()) / (1000 * 60 * 60 * 24)
        );

        // Check if we already sent an email today
        const lastEmail = sentEmails?.[0];
        if (lastEmail) {
          const lastSentDate = new Date(lastEmail.sent_at).toISOString().split("T")[0];
          if (lastSentDate === today) {
            console.log(`Already sent email to ${lead.email} today, skipping`);
            results.skipped++;
            continue;
          }
        }

        // Determine which email to send
        let sequenceType: string | null = null;

        // Priority 1: Core follow-up sequence (days 3, 7, 14)
        if (daysSinceSignup >= 14 && !sentTypes.has("follow_up_3")) {
          sequenceType = "follow_up_3";
        } else if (daysSinceSignup >= 7 && !sentTypes.has("follow_up_2")) {
          sequenceType = "follow_up_2";
        } else if (daysSinceSignup >= 3 && !sentTypes.has("follow_up")) {
          sequenceType = "follow_up";
        } else if (daysSinceSignup >= 1) {
          // Priority 2: Daily engagement emails (after day 1)
          // Get today's topic
          const dailyTopic = getDailyTopic();
          
          // Check if we've sent this specific topic in the last 7 days
          const recentTopicEmails = (sentEmails || []).filter((e: EmailSequence) => {
            const sentDate = new Date(e.sent_at);
            const daysSinceSent = Math.floor((now.getTime() - sentDate.getTime()) / (1000 * 60 * 60 * 24));
            return e.sequence_type === dailyTopic && daysSinceSent < 7;
          });
          
          if (recentTopicEmails.length === 0) {
            sequenceType = dailyTopic;
          }
        }

        if (!sequenceType) {
          results.skipped++;
          continue;
        }

        // Send the email via send-lead-email function
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
