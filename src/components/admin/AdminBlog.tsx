import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Eye, EyeOff, Calendar, ExternalLink, Sparkles, Wand2, Bot, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { blogCategories } from "@/hooks/useBlogPosts";

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  featured_image: string | null;
  category: string;
  tags: string[];
  author_name: string;
  is_published: boolean;
  published_at: string | null;
  meta_title: string | null;
  meta_description: string | null;
  reading_time_minutes: number;
  created_at: string;
  updated_at: string;
}

const defaultPost: Partial<BlogPost> = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  featured_image: "",
  category: "general",
  tags: [],
  author_name: "Quanta Mesh Team",
  is_published: false,
  meta_title: "",
  meta_description: "",
  reading_time_minutes: 5,
};

export function AdminBlog() {
  const [editingPost, setEditingPost] = useState<Partial<BlogPost> | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [tagsInput, setTagsInput] = useState("");
  const [aiTopic, setAiTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAutoPublishing, setIsAutoPublishing] = useState(false);
  const queryClient = useQueryClient();

  const { data: posts, isLoading } = useQuery({
    queryKey: ["admin-blog-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as BlogPost[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (post: Partial<BlogPost>) => {
      const slug = post.slug || generateSlug(post.title || "");
      const publishedAt = post.is_published && !post.published_at ? new Date().toISOString() : post.published_at;
      const readingTime = Math.max(1, Math.ceil((post.content?.split(/\s+/).length || 0) / 200));

      if (post.id) {
        const { error } = await supabase
          .from("blog_posts")
          .update({
            title: post.title,
            slug,
            excerpt: post.excerpt,
            content: post.content,
            featured_image: post.featured_image,
            category: post.category,
            tags: post.tags,
            author_name: post.author_name,
            is_published: post.is_published,
            published_at: publishedAt,
            meta_title: post.meta_title,
            meta_description: post.meta_description,
            reading_time_minutes: readingTime,
          })
          .eq("id", post.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("blog_posts")
          .insert([{
            title: post.title!,
            slug,
            excerpt: post.excerpt!,
            content: post.content!,
            featured_image: post.featured_image || null,
            category: post.category || "general",
            tags: post.tags || [],
            author_name: post.author_name || "Quanta Mesh Team",
            is_published: post.is_published || false,
            published_at: publishedAt,
            meta_title: post.meta_title || null,
            meta_description: post.meta_description || null,
            reading_time_minutes: readingTime,
          }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
      setIsDialogOpen(false);
      setEditingPost(null);
      toast({ title: "Post saved successfully!" });
    },
    onError: (error: any) => {
      toast({ title: "Error saving post", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("blog_posts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
      toast({ title: "Post deleted" });
    },
  });

  const togglePublishMutation = useMutation({
    mutationFn: async ({ id, is_published }: { id: string; is_published: boolean }) => {
      const { error } = await supabase
        .from("blog_posts")
        .update({ 
          is_published, 
          published_at: is_published ? new Date().toISOString() : null 
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
      toast({ title: "Post status updated" });
    },
  });

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setTagsInput(post.tags?.join(", ") || "");
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingPost({ ...defaultPost });
    setTagsInput("");
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!editingPost?.title || !editingPost?.content) {
      toast({ title: "Title and content are required", variant: "destructive" });
      return;
    }
    const tags = tagsInput.split(",").map(t => t.trim()).filter(Boolean);
    saveMutation.mutate({ ...editingPost, tags });
  };

  // AI-powered blog generation
  const generateWithAI = async (topic?: string, autoPublish: boolean = false) => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-blog-post", {
        body: { 
          topic: topic || aiTopic || undefined,
          category: editingPost?.category,
          autoPublish,
        },
      });

      if (error) throw error;

      if (data.error) {
        if (data.error.includes("Rate limit")) {
          toast({ title: "Rate limited", description: "Please wait a moment and try again.", variant: "destructive" });
        } else if (data.error.includes("credits")) {
          toast({ title: "AI credits exhausted", description: "Please add funds to continue using AI.", variant: "destructive" });
        } else {
          throw new Error(data.error);
        }
        return;
      }

      if (autoPublish) {
        queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
        queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
        toast({ 
          title: "Blog post published!", 
          description: `"${data.post.title}" has been auto-published.` 
        });
      } else {
        // Fill the form with generated content
        setEditingPost({
          ...defaultPost,
          ...data.post,
        });
        setTagsInput(data.post.tags?.join(", ") || "");
        setIsDialogOpen(true);
        toast({ title: "Content generated!", description: "Review and edit before publishing." });
      }
    } catch (error: any) {
      console.error("AI generation error:", error);
      toast({ 
        title: "Generation failed", 
        description: error.message || "Failed to generate content", 
        variant: "destructive" 
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Trigger auto-publish check
  const triggerAutoPublish = async () => {
    setIsAutoPublishing(true);
    try {
      const { data, error } = await supabase.functions.invoke("auto-publish-blog");

      if (error) throw error;

      if (data.message?.includes("already published")) {
        toast({ 
          title: "Already published today", 
          description: `Post: ${data.existingPost || "exists"}` 
        });
      } else if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
        queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
        toast({ 
          title: "Auto-published!", 
          description: `"${data.post?.title}" has been published.` 
        });
      }
    } catch (error: any) {
      toast({ 
        title: "Auto-publish failed", 
        description: error.message, 
        variant: "destructive" 
      });
    } finally {
      setIsAutoPublishing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Automation Card */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bot className="w-5 h-5 text-primary" />
            AI Blog Automation
          </CardTitle>
          <CardDescription>
            Let AI help you create blog content or automatically publish daily posts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 flex gap-2">
              <Input
                placeholder="Enter a topic (optional - AI will choose if empty)"
                value={aiTopic}
                onChange={(e) => setAiTopic(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={() => generateWithAI(aiTopic, false)}
                disabled={isGenerating}
                variant="outline"
              >
                {isGenerating ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Wand2 className="w-4 h-4 mr-2" />
                )}
                Generate Draft
              </Button>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => generateWithAI(aiTopic, true)}
                disabled={isGenerating}
                className="bg-primary"
              >
                {isGenerating ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-2" />
                )}
                Generate & Publish
              </Button>
              <Button 
                onClick={triggerAutoPublish}
                disabled={isAutoPublishing}
                variant="secondary"
              >
                {isAutoPublishing ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Bot className="w-4 h-4 mr-2" />
                )}
                Check Auto-Publish
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            💡 Auto-publish runs daily at 9 AM UTC. If no blog is published that day, AI will automatically create and publish one.
          </p>
        </CardContent>
      </Card>

      {/* Blog Sitemap Info */}
      <Card className="border-muted">
        <CardContent className="py-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Blog Sitemap URL:</span>
            <a 
              href={`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-blog-sitemap`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline flex items-center gap-1"
            >
              {import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-blog-sitemap
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Blog Posts</h2>
          <p className="text-muted-foreground">Manage your blog content</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreate}>
              <Plus className="w-4 h-4 mr-2" />
              New Post
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>{editingPost?.id ? "Edit Post" : "Create New Post"}</span>
                {!editingPost?.id && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => generateWithAI()}
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Wand2 className="w-4 h-4 mr-2" />
                    )}
                    Generate with AI
                  </Button>
                )}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input
                    value={editingPost?.title || ""}
                    onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })}
                    placeholder="Post title"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Slug</Label>
                  <Input
                    value={editingPost?.slug || ""}
                    onChange={(e) => setEditingPost({ ...editingPost, slug: e.target.value })}
                    placeholder="auto-generated-from-title"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Excerpt *</Label>
                <Textarea
                  value={editingPost?.excerpt || ""}
                  onChange={(e) => setEditingPost({ ...editingPost, excerpt: e.target.value })}
                  placeholder="Brief description for cards and previews"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Content * (HTML supported)</Label>
                <Textarea
                  value={editingPost?.content || ""}
                  onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
                  placeholder="<p>Your blog post content...</p>"
                  rows={12}
                  className="font-mono text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={editingPost?.category || "general"}
                    onValueChange={(v) => setEditingPost({ ...editingPost, category: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {blogCategories.filter(c => c.value !== "all").map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Featured Image URL</Label>
                  <Input
                    value={editingPost?.featured_image || ""}
                    onChange={(e) => setEditingPost({ ...editingPost, featured_image: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tags (comma separated)</Label>
                  <Input
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="android, play store, tips"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Author Name</Label>
                  <Input
                    value={editingPost?.author_name || ""}
                    onChange={(e) => setEditingPost({ ...editingPost, author_name: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Meta Title (SEO)</Label>
                  <Input
                    value={editingPost?.meta_title || ""}
                    onChange={(e) => setEditingPost({ ...editingPost, meta_title: e.target.value })}
                    placeholder="Custom SEO title"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Meta Description (SEO)</Label>
                  <Input
                    value={editingPost?.meta_description || ""}
                    onChange={(e) => setEditingPost({ ...editingPost, meta_description: e.target.value })}
                    placeholder="Custom meta description"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <Switch
                  checked={editingPost?.is_published || false}
                  onCheckedChange={(checked) => setEditingPost({ ...editingPost, is_published: checked })}
                />
                <Label>Publish immediately</Label>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? "Saving..." : "Save Post"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-10 text-muted-foreground">Loading posts...</div>
      ) : posts?.length === 0 ? (
        <Card className="py-10 text-center">
          <CardContent>
            <p className="text-muted-foreground mb-4">No blog posts yet</p>
            <div className="flex justify-center gap-3">
              <Button onClick={handleCreate}>Create manually</Button>
              <Button variant="outline" onClick={() => generateWithAI(undefined, false)} disabled={isGenerating}>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate with AI
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {posts?.map((post) => (
            <Card key={post.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {post.featured_image && (
                    <img
                      src={post.featured_image}
                      alt={post.title}
                      className="w-24 h-16 object-cover rounded"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold truncate">{post.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-1">{post.excerpt}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant={post.is_published ? "default" : "secondary"}>
                            {post.is_published ? "Published" : "Draft"}
                          </Badge>
                          <Badge variant="outline">{blogCategories.find(c => c.value === post.category)?.label}</Badge>
                          {post.published_at && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {format(new Date(post.published_at), "MMM d, yyyy")}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => togglePublishMutation.mutate({ id: post.id, is_published: !post.is_published })}
                        >
                          {post.is_published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                        {post.is_published && (
                          <Button variant="ghost" size="icon" asChild>
                            <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(post)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => {
                            if (confirm("Delete this post?")) deleteMutation.mutate(post.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
