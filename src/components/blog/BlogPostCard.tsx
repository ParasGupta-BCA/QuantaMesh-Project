import { Link } from "react-router-dom";
import { BlogPost, blogCategories } from "@/hooks/useBlogPosts";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { format } from "date-fns";

interface BlogPostCardProps {
  post: BlogPost;
  featured?: boolean;
}

export function BlogPostCard({ post, featured = false }: BlogPostCardProps) {
  const categoryLabel = blogCategories.find(c => c.value === post.category)?.label || post.category;

  return (
    <Link 
      to={`/blog/${post.slug}`}
      className={`group glass-card rounded-xl overflow-hidden border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 flex flex-col ${featured ? "md:flex-row md:col-span-2" : ""}`}
    >
      {/* Image */}
      <div className={`relative overflow-hidden ${featured ? "md:w-1/2" : "aspect-video"}`}>
        {post.featured_image ? (
          <img 
            src={post.featured_image} 
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary flex items-center justify-center min-h-[200px]">
            <span className="text-4xl font-bold text-primary/30">QM</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content */}
      <div className={`p-5 flex flex-col flex-1 ${featured ? "md:w-1/2 md:p-8" : ""}`}>
        <Badge variant="secondary" className="w-fit mb-3 text-xs">
          {categoryLabel}
        </Badge>
        
        <h3 className={`font-bold mb-2 line-clamp-2 group-hover:text-primary transition-colors ${featured ? "text-2xl" : "text-lg"}`}>
          {post.title}
        </h3>
        
        <p className={`text-muted-foreground mb-4 line-clamp-2 flex-1 ${featured ? "text-base" : "text-sm"}`}>
          {post.excerpt}
        </p>

        <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto pt-4 border-t border-border/50">
          <div className="flex items-center gap-4">
            {post.published_at && (
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <time dateTime={post.published_at}>
                  {format(new Date(post.published_at), "MMM d, yyyy")}
                </time>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>{post.reading_time_minutes} min</span>
            </div>
          </div>
          <span className="flex items-center gap-1 text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            Read <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
