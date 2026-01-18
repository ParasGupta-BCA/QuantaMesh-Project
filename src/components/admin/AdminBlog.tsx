import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Eye, EyeOff, Calendar, ExternalLink } from "lucide-react";
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

  return (
    <div className="space-y-6">
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
              <DialogTitle>{editingPost?.id ? "Edit Post" : "Create New Post"}</DialogTitle>
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
            <Button onClick={handleCreate}>Create your first post</Button>
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
