import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BlogPostRequest {
  topic?: string;
  category?: string;
  autoPublish?: boolean;
  isScheduled?: boolean;
}

const BLOG_TOPICS = [
  { topic: "How to optimize your Android app listing for better visibility", category: "app-publishing" },
  { topic: "Understanding Google Play Store policy updates for 2025", category: "google-play" },
  { topic: "Top 5 mistakes developers make when publishing apps", category: "app-publishing" },
  { topic: "CGI advertising trends that are dominating social media", category: "cgi-ads" },
  { topic: "How to write compelling app descriptions that convert", category: "tutorials" },
  { topic: "The importance of app screenshots and feature graphics", category: "tutorials" },
  { topic: "Google Play Console alternatives for indie developers", category: "app-publishing" },
  { topic: "Why your app might get rejected and how to fix it", category: "google-play" },
  { topic: "Latest mobile app marketing strategies for 2025", category: "industry-updates" },
  { topic: "How CGI ads are revolutionizing brand marketing", category: "cgi-ads" },
  { topic: "Step-by-step guide to preparing your app for Play Store", category: "tutorials" },
  { topic: "Understanding content ratings and age restrictions", category: "google-play" },
  { topic: "App Store Optimization (ASO) tips for beginners", category: "tutorials" },
  { topic: "How to create a privacy policy for your Android app", category: "tutorials" },
  { topic: "The future of app publishing: trends to watch", category: "industry-updates" },
];

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: BlogPostRequest = await req.json().catch(() => ({}));
    const { topic, category, autoPublish = false, isScheduled = false } = body;

    // If scheduled, check if a post was already published today
    if (isScheduled) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { data: todayPosts } = await supabase
        .from("blog_posts")
        .select("id")
        .gte("published_at", today.toISOString())
        .eq("is_published", true)
        .limit(1);

      if (todayPosts && todayPosts.length > 0) {
        return new Response(
          JSON.stringify({ message: "Blog post already published today, skipping auto-generation" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Select topic - either provided or random from list
    let selectedTopic = topic;
    let selectedCategory = category || "general";

    if (!selectedTopic) {
      // Get existing post titles to avoid duplicates
      const { data: existingPosts } = await supabase
        .from("blog_posts")
        .select("title")
        .order("created_at", { ascending: false })
        .limit(50);

      const existingTitles = new Set(existingPosts?.map(p => p.title.toLowerCase()) || []);
      
      // Filter out topics that are too similar to existing posts
      const availableTopics = BLOG_TOPICS.filter(t => 
        !existingTitles.has(t.topic.toLowerCase())
      );

      const topicToUse = availableTopics.length > 0 
        ? availableTopics[Math.floor(Math.random() * availableTopics.length)]
        : BLOG_TOPICS[Math.floor(Math.random() * BLOG_TOPICS.length)];

      selectedTopic = topicToUse.topic;
      selectedCategory = topicToUse.category;
    }

    console.log(`Generating blog post about: ${selectedTopic}`);

    // Generate blog post content using AI
    const systemPrompt = `You are a professional blog writer for Quanta Mesh, a company that specializes in:
1. Android app publishing services (publishing apps to Google Play Store for $25)
2. CGI video advertisement production

Write engaging, informative, and SEO-optimized blog posts. Your writing style should be:
- Professional but approachable
- Informative and actionable
- Well-structured with clear headings
- Include practical tips and examples
- Optimized for search engines

Always sign off as "The Quanta Mesh Team" and include a subtle call-to-action related to our services when relevant.

Format your response as JSON with these exact fields:
{
  "title": "SEO-optimized title (50-60 characters)",
  "excerpt": "Compelling excerpt for previews (150-160 characters)",
  "content": "Full HTML content with proper <h2>, <h3>, <p>, <ul>, <li> tags",
  "meta_title": "SEO meta title (50-60 characters)",
  "meta_description": "SEO meta description (150-160 characters)",
  "tags": ["tag1", "tag2", "tag3"]
}`;

    const userPrompt = `Write a comprehensive blog post about: "${selectedTopic}"

Category: ${selectedCategory}

Requirements:
- Title should be catchy and SEO-optimized
- Content should be 800-1200 words
- Include at least 3-4 subheadings (h2/h3)
- Add bullet points or numbered lists where appropriate
- Include practical tips and actionable advice
- End with a brief mention of how Quanta Mesh can help (if relevant)
- Make it current and relevant for 2025

Return ONLY valid JSON, no markdown code blocks.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI API error:", aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content;

    if (!aiContent) {
      throw new Error("No content received from AI");
    }

    // Parse the AI response - handle potential markdown code blocks
    let blogData;
    try {
      // Remove markdown code blocks if present
      let cleanContent = aiContent.trim();
      if (cleanContent.startsWith("```json")) {
        cleanContent = cleanContent.slice(7);
      } else if (cleanContent.startsWith("```")) {
        cleanContent = cleanContent.slice(3);
      }
      if (cleanContent.endsWith("```")) {
        cleanContent = cleanContent.slice(0, -3);
      }
      blogData = JSON.parse(cleanContent.trim());
    } catch (parseError) {
      console.error("Failed to parse AI response:", aiContent);
      throw new Error("Failed to parse AI response as JSON");
    }

    // Calculate reading time
    const wordCount = blogData.content?.split(/\s+/).length || 0;
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));

    // Create the blog post
    const slug = generateSlug(blogData.title);
    const now = new Date().toISOString();

    const newPost = {
      title: blogData.title,
      slug: slug,
      excerpt: blogData.excerpt,
      content: blogData.content,
      category: selectedCategory,
      tags: blogData.tags || [],
      author_name: "Quanta Mesh Team",
      is_published: autoPublish,
      published_at: autoPublish ? now : null,
      meta_title: blogData.meta_title || blogData.title,
      meta_description: blogData.meta_description || blogData.excerpt,
      reading_time_minutes: readingTime,
    };

    if (autoPublish) {
      // Insert directly to database for auto-publish
      const { data: insertedPost, error: insertError } = await supabase
        .from("blog_posts")
        .insert([newPost])
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      console.log(`Auto-published blog post: ${insertedPost.title}`);

      return new Response(
        JSON.stringify({
          success: true,
          message: "Blog post generated and published",
          post: insertedPost,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Return the generated content for admin review
    return new Response(
      JSON.stringify({
        success: true,
        message: "Blog post generated successfully",
        post: newPost,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error generating blog post:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
