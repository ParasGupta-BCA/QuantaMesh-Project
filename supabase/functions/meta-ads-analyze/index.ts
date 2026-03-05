import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { budget, currency, targetRegion, businessGoal } = await req.json();

    const systemPrompt = `You are an expert Meta Ads (Facebook & Instagram) campaign strategist specializing in digital services businesses. You analyze websites and create profitable ad campaigns.

The business is QuantaMesh (quantamesh.lovable.app) - a digital services company offering:
- App Publishing on Google Play Store ($25)
- CGI Video Advertisements
- Website Development (Landing pages, E-commerce, Full web apps)
- Full-stack App Development (Android, iOS, Cross-platform)

They serve Indian clients AND international clients. Their USP is affordable, high-quality digital services with fast turnaround.

You MUST respond with ONLY valid JSON (no markdown, no code blocks, no extra text). The JSON must match this exact structure:
{
  "website_analysis": {
    "strengths": ["string array of 3-5 strengths"],
    "weaknesses": ["string array of 2-4 areas to improve"],
    "usp": "unique selling proposition string",
    "target_market": "target market description"
  },
  "campaigns": [
    {
      "campaign_name": "string",
      "objective": "string",
      "target_audience": "detailed audience description",
      "ad_copy": "the ad body text",
      "headline": "ad headline",
      "cta": "call to action button text",
      "budget_daily": "amount with currency symbol",
      "budget_monthly": "amount with currency symbol",
      "expected_reach": "estimated reach range",
      "expected_ctr": "estimated CTR percentage",
      "platforms": ["Facebook", "Instagram"],
      "regions": ["region names"],
      "tips": ["2-3 optimization tips"]
    }
  ],
  "overall_strategy": "comprehensive strategy paragraph",
  "estimated_roi": "ROI estimate string like 3x-5x"
}

Generate 3-4 different campaign suggestions optimized for profitability. Include campaigns for both Indian market (in INR) and international markets. Make budgets realistic and ensure ad copies are compelling.`;

    const userPrompt = `Generate a Meta Ads campaign strategy with:
- Monthly budget: ${budget} ${currency}
- Target region: ${targetRegion === "india" ? "India only" : targetRegion === "global" ? "Global (excluding India)" : targetRegion === "india-global" ? "India + International" : targetRegion === "us-uk" ? "US & UK" : "Southeast Asia"}
- Primary goal: ${businessGoal || "leads"}
- Currency for budgets: ${currency}

Analyze the QuantaMesh website and services, then provide profitable campaign strategies with realistic metrics for the ${currency === "INR" ? "Indian" : "international"} market. Split the budget wisely across campaigns.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits in Settings." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI analysis failed");
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content;

    if (!content) throw new Error("No response from AI");

    // Parse JSON from the response, handling potential markdown code blocks
    let analysisJson: string = content;
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      analysisJson = jsonMatch[1].trim();
    }

    const analysis = JSON.parse(analysisJson);

    return new Response(JSON.stringify({ success: true, analysis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Meta ads analysis error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Analysis failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
