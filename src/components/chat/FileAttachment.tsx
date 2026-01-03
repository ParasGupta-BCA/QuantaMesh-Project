import { useSignedUrl } from '@/hooks/useSignedUrl';
import { FileIcon, Download, Loader2 } from 'lucide-react';

interface FileAttachmentProps {
  fileUrl: string | null | undefined;
  fileName: string | null | undefined;
  fileType: string | null | undefined;
  fileSize: number | null | undefined;
  isClientMessage?: boolean;
  maxImageWidth?: string;
  maxImageHeight?: string;
}

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

const isImageFile = (type: string | null | undefined) => type?.startsWith('image/');

export function FileAttachment({
  fileUrl,
  fileName,
  fileType,
  fileSize,
  isClientMessage = false,
  maxImageWidth = '200px',
  maxImageHeight = '200px',
}: FileAttachmentProps) {
  const { signedUrl, loading, error } = useSignedUrl(fileUrl);

  if (!fileUrl) return null;

  if (loading) {
    return (
      <div className="flex items-center gap-2 mt-2 p-2 rounded-lg bg-secondary/50">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-xs text-muted-foreground">Loading file...</span>
      </div>
    );
  }

  if (error || !signedUrl) {
    return (
      <div className="flex items-center gap-2 mt-2 p-2 rounded-lg bg-destructive/10 text-destructive">
        <FileIcon className="h-4 w-4" />
        <span className="text-xs">Failed to load attachment</span>
      </div>
    );
  }

  const isImage = isImageFile(fileType);

  if (isImage) {
    return (
      <a href={signedUrl} target="_blank" rel="noopener noreferrer" className="block mt-2">
        <img
          src={signedUrl}
          alt={fileName || 'Image'}
          className="rounded-lg object-cover border border-border/20 cursor-pointer hover:opacity-90 transition-opacity"
          style={{ maxWidth: maxImageWidth, maxHeight: maxImageHeight }}
        />
      </a>
    );
  }

  return (
    <a
      href={signedUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center gap-2 mt-2 p-2 rounded-lg transition-colors ${
        isClientMessage
          ? 'bg-primary-foreground/10 hover:bg-primary-foreground/20'
          : 'bg-secondary hover:bg-secondary/80'
      }`}
    >
      <FileIcon className="h-4 w-4 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate">{fileName}</p>
        {fileSize && <p className="text-xs opacity-70">{formatFileSize(fileSize)}</p>}
      </div>
      <Download className="h-4 w-4 shrink-0" />
    </a>
  );
}
