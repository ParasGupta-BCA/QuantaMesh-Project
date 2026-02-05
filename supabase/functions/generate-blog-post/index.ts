import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;

interface BlogPostRequest {
  topic?: string;
  category?: string;
  autoPublish?: boolean;
  isScheduled?: boolean;
}

interface UnsplashImage {
  urls: {
    regular: string;
    small: string;
  };
  alt_description: string | null;
  user: {
    name: string;
    links: {
      html: string;
    };
  };
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

// Try to fetch a relevant image from Unsplash
async function fetchImageFromUnsplash(topic: string, category: string): Promise<string | null> {
  try {
    // Use Unsplash Source API (no API key needed for basic usage)
    const searchTerms = getSearchTermsForCategory(category, topic);
    const imageUrl = `https://source.unsplash.com/1200x630/?${encodeURIComponent(searchTerms)}`;
    
    // Verify the image is accessible
    const response = await fetch(imageUrl, { method: 'HEAD' });
    if (response.ok && response.url && !response.url.includes('source.unsplash.com')) {
      console.log(`Found Unsplash image: ${response.url}`);
      return response.url;
    }
    return null;
  } catch (error) {
    console.error("Error fetching Unsplash image:", error);
    return null;
  }
}

// Get search terms based on category and topic
function getSearchTermsForCategory(category: string, topic: string): string {
  const categoryTerms: Record<string, string> = {
    "app-publishing": "mobile app,smartphone,technology",
    "google-play": "android,mobile,google,technology",
    "cgi-ads": "3d render,cgi,digital art,advertising",
    "industry-updates": "technology,business,innovation",
    "tutorials": "coding,developer,computer,workspace",
  };
  
  const baseTerms = categoryTerms[category] || "technology,digital";
  // Extract key words from topic
  const topicWords = topic.toLowerCase().split(' ').slice(0, 3).join(',');
  return `${baseTerms},${topicWords}`;
}

// Generate image using AI if Unsplash fails
async function generateImageWithAI(topic: string, category: string, LOVABLE_API_KEY: string): Promise<string | null> {
  try {
    const imagePrompt = generateImagePrompt(topic, category);
    console.log(`Generating AI image with prompt: ${imagePrompt}`);
    
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [
          { role: "user", content: imagePrompt }
        ],
        modalities: ["image", "text"],
      }),
    });

    if (!response.ok) {
      console.error("AI image generation failed:", response.status);
      return null;
    }

    const data = await response.json();
    const imageData = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    
    if (imageData) {
      console.log("AI image generated successfully");
      return imageData;
    }
    return null;
  } catch (error) {
    console.error("Error generating AI image:", error);
    return null;
  }
}

// Generate a good prompt for blog featured image
function generateImagePrompt(topic: string, category: string): string {
  const styleGuide = "Professional, modern, clean design. 16:9 aspect ratio blog header image. Minimalist style with subtle gradients. No text overlays.";
  
  const categoryStyles: Record<string, string> = {
    "app-publishing": "A sleek smartphone displaying a colorful app interface with abstract floating app icons around it. Gradient background in blue and purple tones.",
    "google-play": "An Android robot mascot with Play Store elements, modern 3D render style with soft lighting. Green and white color scheme.",
    "cgi-ads": "A stunning CGI product shot with dramatic lighting, floating geometric shapes, and vibrant neon accents. Cinematic quality.",
    "industry-updates": "Abstract technology visualization with connected nodes, data streams, and futuristic elements. Blue and cyan color palette.",
    "tutorials": "A clean developer workspace with code on screens, surrounded by floating UI elements and icons. Warm, inviting lighting.",
  };
  
  const categoryStyle = categoryStyles[category] || "Modern technology concept with abstract digital elements and professional aesthetic.";
  
  return `${styleGuide} ${categoryStyle} Topic context: ${topic}. Ultra high resolution.`;
}

// Wrap content with responsive CSS styling
function wrapContentWithStyles(content: string): string {
  // CSS styles that will be embedded inline for the blog content
  const styledContent = `
<style>
  .blog-content {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
    line-height: 1.8;
    color: inherit;
  }
  .blog-content h2 {
    font-size: clamp(1.5rem, 4vw, 2rem);
    font-weight: 700;
    margin: 2.5rem 0 1rem;
    line-height: 1.3;
    color: inherit;
    border-bottom: 2px solid hsl(var(--primary) / 0.2);
    padding-bottom: 0.5rem;
  }
  .blog-content h3 {
    font-size: clamp(1.25rem, 3vw, 1.5rem);
    font-weight: 600;
    margin: 2rem 0 0.75rem;
    line-height: 1.4;
    color: inherit;
  }
  .blog-content p {
    margin: 1.25rem 0;
    font-size: clamp(1rem, 2.5vw, 1.125rem);
    color: inherit;
    opacity: 0.9;
  }
  .blog-content ul, .blog-content ol {
    margin: 1.5rem 0;
    padding-left: 1.5rem;
  }
  .blog-content li {
    margin: 0.75rem 0;
    font-size: clamp(1rem, 2.5vw, 1.125rem);
    line-height: 1.7;
    color: inherit;
    opacity: 0.9;
  }
  .blog-content ul li {
    list-style-type: disc;
  }
  .blog-content ol li {
    list-style-type: decimal;
  }
  .blog-content ul li::marker {
    color: hsl(var(--primary));
  }
  .blog-content ol li::marker {
    color: hsl(var(--primary));
    font-weight: 600;
  }
  .blog-content strong, .blog-content b {
    font-weight: 600;
    color: inherit;
  }
  .blog-content em, .blog-content i {
    font-style: italic;
  }
  .blog-content a {
    color: hsl(var(--primary));
    text-decoration: underline;
    text-underline-offset: 2px;
    transition: opacity 0.2s;
  }
  .blog-content a:hover {
    opacity: 0.8;
  }
  .blog-content blockquote {
    border-left: 4px solid hsl(var(--primary));
    padding: 1rem 1.5rem;
    margin: 2rem 0;
    background: hsl(var(--primary) / 0.05);
    border-radius: 0 0.5rem 0.5rem 0;
    font-style: italic;
  }
  .blog-content blockquote p {
    margin: 0;
  }
  .blog-content code {
    background: hsl(var(--muted));
    padding: 0.2rem 0.4rem;
    border-radius: 0.25rem;
    font-family: 'Fira Code', 'Monaco', monospace;
    font-size: 0.9em;
  }
  .blog-content pre {
    background: hsl(var(--muted));
    padding: 1.5rem;
    border-radius: 0.75rem;
    overflow-x: auto;
    margin: 1.5rem 0;
  }
  .blog-content pre code {
    background: none;
    padding: 0;
  }
  .blog-content img {
    max-width: 100%;
    height: auto;
    border-radius: 0.75rem;
    margin: 2rem auto;
    display: block;
    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  }
  .blog-content hr {
    border: none;
    height: 2px;
    background: linear-gradient(to right, transparent, hsl(var(--primary) / 0.3), transparent);
    margin: 3rem 0;
  }
  .blog-content .highlight-box {
    background: linear-gradient(135deg, hsl(var(--primary) / 0.1), hsl(var(--primary) / 0.05));
    border: 1px solid hsl(var(--primary) / 0.2);
    border-radius: 0.75rem;
    padding: 1.5rem;
    margin: 2rem 0;
  }
  .blog-content .cta-box {
    background: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.8));
    color: white;
    border-radius: 1rem;
    padding: 2rem;
    margin: 2.5rem 0;
    text-align: center;
  }
  .blog-content .cta-box p {
    color: white;
    opacity: 1;
  }
  .blog-content .cta-box a {
    color: white;
    font-weight: 600;
  }
  @media (max-width: 640px) {
    .blog-content h2 {
      margin: 2rem 0 0.75rem;
    }
    .blog-content h3 {
      margin: 1.5rem 0 0.5rem;
    }
    .blog-content ul, .blog-content ol {
      padding-left: 1.25rem;
    }
    .blog-content blockquote {
      padding: 0.75rem 1rem;
      margin: 1.5rem 0;
    }
    .blog-content pre {
      padding: 1rem;
      font-size: 0.875rem;
    }
    .blog-content .cta-box {
      padding: 1.5rem;
    }
  }
</style>
<div class="blog-content">
${content}
</div>`;
  
  return styledContent;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = SUPABASE_URL;
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

    // Step 1: Try to fetch image from Unsplash first
    console.log("Attempting to fetch image from Unsplash...");
    let featuredImage = await fetchImageFromUnsplash(selectedTopic, selectedCategory);
    
    // Step 2: If Unsplash fails, generate with AI
    if (!featuredImage) {
      console.log("Unsplash fetch failed, generating image with AI...");
      featuredImage = await generateImageWithAI(selectedTopic, selectedCategory, LOVABLE_API_KEY);
    }
    
    if (featuredImage) {
      console.log("Featured image obtained successfully");
    } else {
      console.log("No featured image available, proceeding without one");
    }

    // Step 3: Generate blog post content using AI
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

IMPORTANT: Write the content using proper semantic HTML tags. Use:
- <h2> for main section headings
- <h3> for sub-section headings  
- <p> for paragraphs
- <ul> and <li> for unordered lists
- <ol> and <li> for numbered lists
- <strong> or <b> for bold text
- <em> or <i> for italic text
- <blockquote> for quotes or important callouts
- <a href="..."> for links

For the call-to-action section, wrap it in: <div class="cta-box">...</div>
For highlighting important tips, use: <div class="highlight-box">...</div>

Format your response as JSON with these exact fields:
{
  "title": "SEO-optimized title (50-60 characters)",
  "excerpt": "Compelling excerpt for previews (150-160 characters)",
  "content": "Full HTML content with proper semantic HTML tags as described above",
  "meta_title": "SEO meta title (50-60 characters)",
  "meta_description": "SEO meta description (150-160 characters)",
  "tags": ["tag1", "tag2", "tag3"]
}`;

    const userPrompt = `Write a comprehensive blog post about: "${selectedTopic}"

Category: ${selectedCategory}

Requirements:
- Title should be catchy and SEO-optimized
- Content should be 800-1200 words
- Include at least 3-4 subheadings using <h2> and <h3> tags
- Add bullet points (<ul><li>) or numbered lists (<ol><li>) where appropriate
- Include practical tips and actionable advice in a <div class="highlight-box">
- End with a brief mention of how Quanta Mesh can help (if relevant)
- Wrap the final call-to-action in a <div class="cta-box">
- Make it current and relevant for 2025
- Use <strong> for important terms and <blockquote> for key insights

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
      
      // Handle ```json or ``` at the start
      const jsonBlockMatch = cleanContent.match(/^```(?:json)?\s*\n?([\s\S]*?)```\s*$/);
      if (jsonBlockMatch) {
        cleanContent = jsonBlockMatch[1];
      } else {
        // Fallback: manually strip code blocks
        if (cleanContent.startsWith("```json")) {
          cleanContent = cleanContent.slice(7);
        } else if (cleanContent.startsWith("```")) {
          cleanContent = cleanContent.slice(3);
        }
        if (cleanContent.endsWith("```")) {
          cleanContent = cleanContent.slice(0, -3);
        }
      }
      
      blogData = JSON.parse(cleanContent.trim());
    } catch (parseError) {
      console.error("Failed to parse AI response:", aiContent);
      console.error("Parse error:", parseError);
      throw new Error("Failed to parse AI response as JSON");
    }

    // Step 4: Wrap content with responsive CSS styling
    const styledContent = wrapContentWithStyles(blogData.content);

    // Calculate reading time
    const wordCount = blogData.content?.replace(/<[^>]*>/g, ' ').split(/\s+/).length || 0;
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));

    // Create the blog post
    const slug = generateSlug(blogData.title);
    const now = new Date().toISOString();

    const newPost = {
      title: blogData.title,
      slug: slug,
      excerpt: blogData.excerpt,
      content: styledContent,
      featured_image: featuredImage || null,
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
