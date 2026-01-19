import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// This function is triggered daily by pg_cron to auto-publish blog posts
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      console.log("LOVABLE_API_KEY not configured, skipping auto-publish");
      return new Response(
        JSON.stringify({ message: "AI not configured, skipping" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if any blog post was published today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { data: todayPosts } = await supabase
      .from("blog_posts")
      .select("id, title")
      .gte("published_at", today.toISOString())
      .eq("is_published", true)
      .limit(1);

    if (todayPosts && todayPosts.length > 0) {
      console.log(`Blog post already published today: ${todayPosts[0].title}`);
      return new Response(
        JSON.stringify({ 
          message: "Blog post already published today", 
          existingPost: todayPosts[0].title 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("No blog post published today, generating one automatically...");

    // Call the generate-blog-post function with autoPublish=true
    const generateResponse = await fetch(`${supabaseUrl}/functions/v1/generate-blog-post`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${supabaseServiceKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        autoPublish: true,
        isScheduled: true,
      }),
    });

    const result = await generateResponse.json();

    if (!generateResponse.ok) {
      console.error("Failed to generate blog post:", result);
      return new Response(
        JSON.stringify({ error: "Failed to generate blog post", details: result }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Auto-published blog post successfully:", result.post?.title);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Auto-published blog post",
        post: result.post,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in auto-publish-blog:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
