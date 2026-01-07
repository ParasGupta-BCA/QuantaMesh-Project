import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface GenerateLeadsRequest {
  niches: string[];
}

interface GeneratedLead {
  name: string;
  email: string;
  niche: string;
  source: string;
}

async function generateLeadsWithAI(niches: string[]): Promise<GeneratedLead[]> {
  const nicheDescriptions = {
    app_developers: "indie Android app developers, mobile developers looking to publish apps",
    startups: "tech startups, mobile-first companies, app-based businesses",
    agencies: "mobile app development agencies, software houses, freelance app developers",
  };

  const nicheList = niches
    .map((n) => nicheDescriptions[n as keyof typeof nicheDescriptions] || n)
    .join(", ");

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
            content: `You are a B2B lead generation expert. Generate realistic-looking sample lead data for testing purposes.

IMPORTANT: These are SAMPLE/FICTIONAL leads for demonstration. Do NOT generate real people's data.

For each lead, provide:
- A realistic but fictional business name
- A fictional business email (use domains like example-app.com, devstudio.test, etc.)
- The niche category

Return ONLY valid JSON array in this format:
[{"name": "Sample App Studio", "email": "hello@sample-app.test", "niche": "app_developers"}]

Generate 5 sample leads.`,
          },
          {
            role: "user",
            content: `Generate sample business leads for these niches: ${nicheList}. Remember these are fictional samples for testing.`,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Parse JSON from response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const leads = JSON.parse(jsonMatch[0]);
      return leads.map((lead: { name: string; email: string; niche: string }) => ({
        ...lead,
        source: "google_search",
      }));
    }

    return [];
  } catch (error) {
    console.error("AI generation error:", error);
    return [];
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify admin authorization
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Verify user is admin
    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    // Check admin role
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();

    if (!roleData) {
      throw new Error("Admin access required");
    }

    const { niches }: GenerateLeadsRequest = await req.json();

    console.log("Generating leads for niches:", niches);

    // Generate leads with AI
    const generatedLeads = await generateLeadsWithAI(niches);

    console.log(`Generated ${generatedLeads.length} leads`);

    // Store the search results
    const { error: searchError } = await supabase.from("ai_generated_leads").insert({
      search_query: niches.join(", "),
      results: generatedLeads,
      processed: false,
    });

    if (searchError) {
      console.error("Failed to save search results:", searchError);
    }

    // Insert leads into the leads table (skip duplicates)
    let insertedCount = 0;
    for (const lead of generatedLeads) {
      const { error } = await supabase.from("leads").insert({
        name: lead.name,
        email: lead.email,
        source: "google_search",
        niche: lead.niche,
        status: "new",
      });

      if (!error) {
        insertedCount++;

        // Send welcome email to new lead
        try {
          await fetch(`${SUPABASE_URL}/functions/v1/send-lead-email`, {
            method: "POST",
            headers: {
              Authorization: authHeader,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: lead.email,
              name: lead.name,
              sequenceType: "welcome",
            }),
          });
        } catch (emailError) {
          console.error("Failed to send welcome email:", emailError);
        }
      } else if (error.code !== "23505") {
        // Log non-duplicate errors
        console.error("Failed to insert lead:", error);
      }
    }

    // Mark search as processed
    await supabase
      .from("ai_generated_leads")
      .update({ processed: true })
      .eq("search_query", niches.join(", "))
      .eq("processed", false);

    return new Response(
      JSON.stringify({
        success: true,
        leadsFound: generatedLeads.length,
        leadsInserted: insertedCount,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error in generate-leads:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
