import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Upload, Trash2, Video, Loader2, Eye, EyeOff, GripVertical } from 'lucide-react';

interface AdminVideo {
  id: string;
  title: string;
  description: string | null;
  video_path: string;
  thumbnail_path: string | null;
  category: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

interface AdminVideosProps {
  videos: AdminVideo[];
  onVideosChange: () => void;
}

const CATEGORIES = [
  { value: 'product', label: 'Product' },
  { value: 'brand', label: 'Brand' },
  { value: 'motion', label: 'Motion' },
  { value: 'general', label: 'General' },
];

export function AdminVideos({ videos, onVideosChange }: AdminVideosProps) {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'general',
  });
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 100 * 1024 * 1024) {
        toast.error('Video file must be less than 100MB');
        return;
      }
      setVideoFile(file);
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Thumbnail must be less than 5MB');
        return;
      }
      setThumbnailFile(file);
    }
  };

  const handleUpload = async () => {
    if (!videoFile || !formData.title.trim()) {
      toast.error('Please provide a title and video file');
      return;
    }

    setUploading(true);
    try {
      // Upload video
      const videoExt = videoFile.name.split('.').pop();
      const videoPath = `${Date.now()}-${Math.random().toString(36).substring(7)}.${videoExt}`;
      
      const { error: videoError } = await supabase.storage
        .from('admin-videos')
        .upload(videoPath, videoFile);

      if (videoError) throw videoError;

      // Upload thumbnail if provided
      let thumbnailPath = null;
      if (thumbnailFile) {
        const thumbExt = thumbnailFile.name.split('.').pop();
        thumbnailPath = `thumbnails/${Date.now()}-${Math.random().toString(36).substring(7)}.${thumbExt}`;
        
        const { error: thumbError } = await supabase.storage
          .from('admin-videos')
          .upload(thumbnailPath, thumbnailFile);

        if (thumbError) {
          console.error('Thumbnail upload failed:', thumbError);
        }
      }

      // Insert record into database
      const { error: dbError } = await supabase
        .from('admin_videos')
        .insert({
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          video_path: videoPath,
          thumbnail_path: thumbnailPath,
          category: formData.category,
          display_order: videos.length,
        });

      if (dbError) throw dbError;

      toast.success('Video uploaded successfully!');
      setFormData({ title: '', description: '', category: 'general' });
      setVideoFile(null);
      setThumbnailFile(null);
      onVideosChange();
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload video');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (video: AdminVideo) => {
    if (!confirm('Are you sure you want to delete this video?')) return;

    setDeleting(video.id);
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('admin-videos')
        .remove([video.video_path]);

      if (storageError) console.error('Storage delete error:', storageError);

      if (video.thumbnail_path) {
        await supabase.storage
          .from('admin-videos')
          .remove([video.thumbnail_path]);
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('admin_videos')
        .delete()
        .eq('id', video.id);

      if (dbError) throw dbError;

      toast.success('Video deleted successfully');
      onVideosChange();
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error(error.message || 'Failed to delete video');
    } finally {
      setDeleting(null);
    }
  };

  const toggleActive = async (video: AdminVideo) => {
    try {
      const { error } = await supabase
        .from('admin_videos')
        .update({ is_active: !video.is_active })
        .eq('id', video.id);

      if (error) throw error;

      toast.success(video.is_active ? 'Video hidden' : 'Video visible');
      onVideosChange();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update video');
    }
  };

  const getVideoUrl = (path: string) => {
    const { data } = supabase.storage.from('admin-videos').getPublicUrl(path);
    return data.publicUrl;
  };

  return (
    <div className="space-y-6">
      {/* Upload Form */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload New Video
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter video title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter video description (optional)"
              rows={2}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="video">Video File * (max 100MB)</Label>
              <Input
                id="video"
                type="file"
                accept="video/*"
                onChange={handleVideoChange}
                className="cursor-pointer"
              />
              {videoFile && (
                <p className="text-sm text-muted-foreground">
                  Selected: {videoFile.name} ({(videoFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="thumbnail">Thumbnail (optional, max 5MB)</Label>
              <Input
                id="thumbnail"
                type="file"
                accept="image/*"
                onChange={handleThumbnailChange}
                className="cursor-pointer"
              />
              {thumbnailFile && (
                <p className="text-sm text-muted-foreground">
                  Selected: {thumbnailFile.name}
                </p>
              )}
            </div>
          </div>

          <Button 
            onClick={handleUpload} 
            disabled={uploading || !videoFile || !formData.title.trim()}
            className="w-full md:w-auto"
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload Video
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Videos List */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Uploaded Videos ({videos.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {videos.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No videos uploaded yet. Upload your first video above.
            </p>
          ) : (
            <div className="space-y-4">
              {videos.map((video) => (
                <div
                  key={video.id}
                  className="flex flex-col md:flex-row gap-4 p-4 rounded-lg border border-border/50 bg-background/50"
                >
                  {/* Video Preview */}
                  <div className="w-full md:w-48 flex-shrink-0">
                    <video
                      src={getVideoUrl(video.video_path)}
                      className="w-full h-32 object-cover rounded-lg bg-muted"
                      muted
                      preload="metadata"
                    />
                  </div>

                  {/* Video Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-medium truncate">{video.title}</h4>
                        {video.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {video.description}
                          </p>
                        )}
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary capitalize flex-shrink-0">
                        {video.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={video.is_active}
                          onCheckedChange={() => toggleActive(video)}
                        />
                        <span className="text-sm text-muted-foreground">
                          {video.is_active ? (
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" /> Visible
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <EyeOff className="h-3 w-3" /> Hidden
                            </span>
                          )}
                        </span>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(video)}
                        disabled={deleting === video.id}
                      >
                        {deleting === video.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Uploaded: {new Date(video.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
