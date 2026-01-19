import { useParams, Link, Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/layout/Layout";
import { useBlogPost, useRecentBlogPosts, blogCategories } from "@/hooks/useBlogPosts";
import { BlogPostCard } from "@/components/blog/BlogPostCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Clock, Share2, User, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading, error } = useBlogPost(slug || "");
  const { data: recentPosts } = useRecentBlogPosts(3);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: post?.title, url });
    } else {
      await navigator.clipboard.writeText(url);
      toast({ title: "Link copied!", description: "Share this article with others." });
    }
  };

  if (error) {
    return <Navigate to="/blog" replace />;
  }

  const categoryLabel = blogCategories.find(c => c.value === post?.category)?.label || post?.category;

  const structuredData = post ? {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.meta_description || post.excerpt,
    "image": post.featured_image || "https://www.quantamesh.store/service-hero.png",
    "url": `https://www.quantamesh.store/blog/${post.slug}`,
    "datePublished": post.published_at,
    "dateModified": post.updated_at,
    "author": {
      "@type": "Organization",
      "name": post.author_name,
      "url": "https://www.quantamesh.store"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Quanta Mesh",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.quantamesh.store/android-chrome-512x512.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://www.quantamesh.store/blog/${post.slug}`
    },
    "articleSection": categoryLabel,
    "wordCount": post.content.split(/\s+/).length,
    "keywords": post.tags?.join(", ")
  } : null;

  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.quantamesh.store" },
      { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://www.quantamesh.store/blog" },
      ...(post ? [{ "@type": "ListItem", "position": 3, "name": post.title, "item": `https://www.quantamesh.store/blog/${post.slug}` }] : [])
    ]
  };

  return (
    <Layout>
      <Helmet>
        <title>{post?.meta_title || post?.title || "Loading..."} | Quanta Mesh Blog</title>
        <meta name="description" content={post?.meta_description || post?.excerpt || ""} />
        {post?.tags && <meta name="keywords" content={post.tags.join(", ")} />}
        <link rel="canonical" href={`https://www.quantamesh.store/blog/${slug}`} />
        <meta name="robots" content="index, follow, max-image-preview:large" />
        
        {/* Open Graph */}
        <meta property="og:type" content="article" />
        <meta property="og:title" content={post?.title || ""} />
        <meta property="og:description" content={post?.excerpt || ""} />
        <meta property="og:url" content={`https://www.quantamesh.store/blog/${slug}`} />
        <meta property="og:image" content={post?.featured_image || "https://www.quantamesh.store/service-hero.png"} />
        <meta property="article:published_time" content={post?.published_at || ""} />
        <meta property="article:modified_time" content={post?.updated_at || ""} />
        <meta property="article:section" content={categoryLabel} />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post?.title || ""} />
        <meta name="twitter:description" content={post?.excerpt || ""} />
        <meta name="twitter:image" content={post?.featured_image || "https://www.quantamesh.store/service-hero.png"} />

        {structuredData && (
          <script type="application/ld+json">
            {JSON.stringify(structuredData)}
          </script>
        )}
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbData)}
        </script>
      </Helmet>

      <main className="pt-28 md:pt-32 pb-20">
        <div className="container mx-auto px-4 md:px-6">
          {isLoading ? (
            <article className="max-w-4xl mx-auto">
              <Skeleton className="h-6 w-32 mb-4" />
              <Skeleton className="h-12 w-full mb-4" />
              <Skeleton className="h-6 w-64 mb-8" />
              <Skeleton className="h-64 w-full rounded-xl mb-8" />
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </article>
          ) : post ? (
            <>
              {/* Breadcrumb */}
              <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8 max-w-4xl mx-auto">
                <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
                <ChevronRight className="w-4 h-4" />
                <Link to="/blog" className="hover:text-foreground transition-colors">Blog</Link>
                <ChevronRight className="w-4 h-4" />
                <span className="text-foreground truncate">{post.title}</span>
              </nav>

              <article className="max-w-4xl mx-auto">
                {/* Header */}
                <header className="mb-8">
                  <Badge variant="secondary" className="mb-4">{categoryLabel}</Badge>
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                    {post.title}
                  </h1>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>{post.author_name}</span>
                    </div>
                    {post.published_at && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <time dateTime={post.published_at}>
                          {format(new Date(post.published_at), "MMMM d, yyyy")}
                        </time>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{post.reading_time_minutes} min read</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={handleShare} className="ml-auto">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>

                  {post.featured_image && (
                    <div className="rounded-xl overflow-hidden mb-8">
                      <img 
                        src={post.featured_image} 
                        alt={post.title}
                        className="w-full h-auto object-cover aspect-video"
                        loading="eager"
                      />
                    </div>
                  )}
                </header>

                {/* Content */}
                <div 
                  className="prose prose-invert prose-lg max-w-none 
                    prose-headings:font-bold prose-headings:text-foreground
                    prose-p:text-muted-foreground prose-p:leading-relaxed
                    prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                    prose-strong:text-foreground
                    prose-code:bg-secondary prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
                    prose-pre:bg-secondary/50 prose-pre:border prose-pre:border-border
                    prose-blockquote:border-l-primary prose-blockquote:bg-primary/5 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg
                    prose-ul:text-muted-foreground prose-ol:text-muted-foreground
                    prose-img:rounded-xl"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="mt-10 pt-6 border-t border-border">
                    <h4 className="text-sm font-medium mb-3">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Back to Blog */}
                <div className="mt-10 pt-6 border-t border-border">
                  <Button variant="outline" asChild>
                    <Link to="/blog">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Blog
                    </Link>
                  </Button>
                </div>
              </article>

              {/* Related Posts */}
              {recentPosts && recentPosts.length > 0 && (
                <section className="mt-20">
                  <h2 className="text-2xl font-bold mb-8 text-center">More Articles</h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    {recentPosts
                      .filter(p => p.slug !== post.slug)
                      .slice(0, 3)
                      .map((relatedPost) => (
                        <BlogPostCard key={relatedPost.id} post={relatedPost as any} />
                      ))}
                  </div>
                </section>
              )}
            </>
          ) : null}
        </div>
      </main>
    </Layout>
  );
}
