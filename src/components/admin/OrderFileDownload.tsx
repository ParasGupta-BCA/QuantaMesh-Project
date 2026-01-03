import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Download, Loader2, FileIcon, Image, FileArchive } from 'lucide-react';

interface OrderFileDownloadProps {
  filePath: string | null | undefined;
  label: string;
  variant?: 'default' | 'compact';
}

export function OrderFileDownload({ filePath, label, variant = 'default' }: OrderFileDownloadProps) {
  const [loading, setLoading] = useState(false);

  if (!filePath) return null;

  const handleDownload = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.storage
        .from('order-files')
        .createSignedUrl(filePath, 3600); // 1 hour expiry

      if (error) throw error;
      
      window.open(data.signedUrl, '_blank');
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = () => {
    if (filePath.includes('/apk/')) return <FileArchive className="h-4 w-4" />;
    if (filePath.includes('/icon/') || filePath.includes('/feature-graphic/') || filePath.includes('/screenshots/')) {
      return <Image className="h-4 w-4" />;
    }
    return <FileIcon className="h-4 w-4" />;
  };

  if (variant === 'compact') {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDownload}
        disabled={loading}
        className="h-8 px-2 text-xs gap-1.5 hover:bg-primary/10 hover:text-primary"
      >
        {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}
        {label}
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDownload}
      disabled={loading}
      className="gap-2 bg-background/50 border-border/50 hover:bg-primary/5 hover:border-primary/30 hover:text-primary transition-all"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : getIcon()}
      {label}
      <Download className="h-3 w-3 opacity-50" />
    </Button>
  );
}

interface OrderFilesListProps {
  apkFilePath?: string | null;
  iconFilePath?: string | null;
  featureGraphicPath?: string | null;
  screenshotPaths?: string[] | null;
}

export function OrderFilesList({ apkFilePath, iconFilePath, featureGraphicPath, screenshotPaths }: OrderFilesListProps) {
  const hasFiles = apkFilePath || iconFilePath || featureGraphicPath || (screenshotPaths && screenshotPaths.length > 0);
  
  if (!hasFiles) {
    return (
      <p className="text-sm text-muted-foreground italic">No files uploaded</p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      <OrderFileDownload filePath={apkFilePath} label="APK" />
      <OrderFileDownload filePath={iconFilePath} label="Icon" />
      <OrderFileDownload filePath={featureGraphicPath} label="Feature Graphic" />
      {screenshotPaths?.map((path, i) => (
        <OrderFileDownload key={path} filePath={path} label={`Screenshot ${i + 1}`} variant="compact" />
      ))}
    </div>
  );
}
