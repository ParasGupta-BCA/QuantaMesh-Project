import { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/layout/Layout";
import { useBlogPosts, blogCategories } from "@/hooks/useBlogPosts";
import { BlogPostCard } from "@/components/blog/BlogPostCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Rss, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function Blog() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { data: posts, isLoading } = useBlogPosts(selectedCategory);

  const filteredPosts = posts?.filter(post => 
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "Quanta Mesh Blog",
    "description": "Latest insights on Android app publishing, Google Play policies, CGI video ads, and industry updates from Quanta Mesh.",
    "url": "https://www.quantamesh.store/blog",
    "publisher": {
      "@type": "Organization",
      "name": "Quanta Mesh",
      "url": "https://www.quantamesh.store",
      "logo": "https://www.quantamesh.store/android-chrome-512x512.png"
    },
    "blogPost": posts?.slice(0, 10).map(post => ({
      "@type": "BlogPosting",
      "headline": post.title,
      "description": post.excerpt,
      "url": `https://www.quantamesh.store/blog/${post.slug}`,
      "datePublished": post.published_at,
      "dateModified": post.updated_at,
      "author": {
        "@type": "Organization",
        "name": post.author_name
      }
    })) || []
  };

  return (
    <Layout>
      <Helmet>
        <title>Blog - App Publishing Tips & Industry Insights | Quanta Mesh</title>
        <meta name="description" content="Stay updated with the latest Android app publishing tips, Google Play policy changes, CGI video trends, and industry insights. Expert advice from Quanta Mesh." />
        <meta name="keywords" content="app publishing blog, google play updates, android developer tips, CGI video trends, app store optimization, ASO tips" />
        <link rel="canonical" href="https://www.quantamesh.store/blog" />
        <link rel="alternate" type="application/rss+xml" title="Quanta Mesh Blog RSS" href="https://www.quantamesh.store/blog-sitemap.xml" />
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <main className="pt-28 md:pt-32 pb-20">
        <div className="container mx-auto px-4 md:px-6">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <BookOpen className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Quanta Mesh Blog</span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              <span className="gradient-text">Insights</span> & Updates
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Stay ahead with expert tips on app publishing, Google Play policies, CGI trends, and industry news.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-10">
            <div className="relative flex-1 max-w-md mx-auto md:mx-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              {blogCategories.map((cat) => (
                <Button
                  key={cat.value}
                  variant={selectedCategory === cat.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(cat.value)}
                  className="text-xs"
                >
                  {cat.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Blog Grid */}
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="glass-card rounded-xl p-4">
                  <Skeleton className="h-48 w-full rounded-lg mb-4" />
                  <Skeleton className="h-4 w-20 mb-3" />
                  <Skeleton className="h-6 w-full mb-2" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3 mt-2" />
                </div>
              ))}
            </div>
          ) : filteredPosts && filteredPosts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post) => (
                <BlogPostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <Rss className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No posts found</h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery 
                  ? "Try adjusting your search terms"
                  : "We're working on fresh content. Check back soon!"}
              </p>
              <Button variant="outline" asChild>
                <Link to="/contact">Get Notified</Link>
              </Button>
            </div>
          )}
        </div>
      </main>
    </Layout>
  );
}
