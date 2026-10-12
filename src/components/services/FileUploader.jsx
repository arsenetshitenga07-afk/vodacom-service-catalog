import { useRef, useState } from 'react';
import { ExternalLink, FileText, UploadCloud, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';
import {
  ACCEPT_ATTRIBUTE,
  ACCEPTED_EXTENSIONS,
  MAX_DOCUMENTS,
  MAX_FILE_SIZE_BYTES,
  MAX_FILE_SIZE_MB,
} from '@/utils/constants';
import { formatFileSize, getFileExtension } from '@/utils/format';

/**
 * Zone d'upload avec glisser-déposer.
 * Le total (documents existants + nouveaux fichiers) ne peut jamais dépasser `maxFiles`.
 */
export function FileUploader({
  existingDocuments = [],
  onRemoveExisting,
  files,
  onFilesChange,
  maxFiles = MAX_DOCUMENTS,
  disabled = false,
}) {
  const { t } = useTranslation();
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const used = existingDocuments.length + files.length;
  const remaining = Math.max(0, maxFiles - used);
  const isFull = remaining === 0;
  const isInactive = disabled || isFull;

  const addFiles = (fileList) => {
    const incoming = Array.from(fileList ?? []);
    if (incoming.length === 0) return;

    const accepted = [];
    for (const file of incoming) {
      if (!ACCEPTED_EXTENSIONS.includes(getFileExtension(file.name))) {
        toast.error(t('upload.invalidType', { name: file.name }));
        continue;
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        toast.error(t('upload.tooLarge', { name: file.name, size: MAX_FILE_SIZE_MB }));
        continue;
      }
      const isDuplicate = [...files, ...accepted].some(
        (other) => other.name === file.name && other.size === file.size,
      );
      if (isDuplicate) {
        toast.info(t('upload.duplicate', { name: file.name }));
        continue;
      }
      accepted.push(file);
    }

    if (accepted.length > remaining) {
      toast.warning(t('upload.limitReached', { max: maxFiles }));
    }

    const toAdd = accepted.slice(0, remaining);
    if (toAdd.length > 0) onFilesChange([...files, ...toAdd]);
  };

  const openPicker = () => {
    if (!isInactive) inputRef.current?.click();
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    if (!isInactive) setIsDragging(true);
  };

  const handleDragLeave = (event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setIsDragging(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    if (isFull) {
      toast.warning(t('upload.limitReached', { max: maxFiles }));
      return;
    }
    addFiles(event.dataTransfer.files);
  };

  return (
    <div className="space-y-3">
      <div
        role="button"
        tabIndex={isInactive ? -1 : 0}
        aria-disabled={isInactive}
        onClick={openPicker}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openPicker();
          }
        }}
        onDragEnter={handleDragOver}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-7 text-center transition-colors',
          'ring-offset-background focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden',
          isDragging && 'border-primary bg-primary/5',
          !isDragging && !isInactive && 'hover:border-primary/50 hover:bg-accent/50 cursor-pointer',
          isInactive && 'bg-muted/40 cursor-not-allowed opacity-70',
        )}
      >
        <span className="bg-primary/10 text-primary grid size-10 place-items-center rounded-full">
          <UploadCloud className="size-5" aria-hidden="true" />
        </span>

        {isFull ? (
          <>
            <p className="text-sm font-medium">{t('upload.full', { max: maxFiles })}</p>
            <p className="text-muted-foreground text-xs">{t('upload.fullHint')}</p>
          </>
        ) : (
          <>
            <p className="text-sm">
              {t('upload.dropzone')}{' '}
              <span className="text-primary font-medium underline-offset-4 hover:underline">
                {t('upload.browse')}
              </span>
            </p>
            <p className="text-muted-foreground text-xs">
              {t('upload.hint', { size: MAX_FILE_SIZE_MB })}
            </p>
          </>
        )}

        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPT_ATTRIBUTE}
          className="sr-only"
          tabIndex={-1}
          disabled={isInactive}
          onChange={(event) => {
            addFiles(event.target.files);
            event.target.value = '';
          }}
        />
      </div>

      {/* Jauge d'occupation */}
      <div className="flex items-center gap-3">
        <div className="flex flex-1 gap-1" aria-hidden="true">
          {Array.from({ length: maxFiles }, (_, index) => (
            <span
              key={index}
              className={cn(
                'h-1.5 flex-1 rounded-full transition-colors',
                index < used ? 'bg-primary' : 'bg-muted',
              )}
            />
          ))}
        </div>
        <span className="text-muted-foreground shrink-0 text-xs tabular-nums" aria-live="polite">
          {used}/{maxFiles} · {t('upload.remaining', { count: remaining })}
        </span>
      </div>

      {used > 0 && (
        <ul className="divide-y rounded-xl border">
          {existingDocuments.map((doc) => (
            <FileRow
              key={doc.id}
              name={doc.name}
              size={doc.size}
              url={doc.url}
              disabled={disabled}
              onRemove={() => onRemoveExisting?.(doc.id)}
            />
          ))}
          {files.map((file) => (
            <FileRow
              key={`${file.name}-${file.size}-${file.lastModified}`}
              name={file.name}
              size={file.size}
              isNew
              disabled={disabled}
              onRemove={() => onFilesChange(files.filter((item) => item !== file))}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function FileRow({ name, size, url, isNew, disabled, onRemove }) {
  const { t } = useTranslation();

  return (
    <li className="flex items-center gap-3 px-3 py-2">
      <FileText className="text-muted-foreground size-4 shrink-0" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{name}</p>
        {size != null && <p className="text-muted-foreground text-xs">{formatFileSize(size)}</p>}
      </div>
      {isNew && <Badge variant="brand">{t('upload.newBadge')}</Badge>}
      {url && (
        <Button variant="ghost" size="icon-sm" asChild>
          <a href={url} target="_blank" rel="noreferrer" aria-label={t('upload.open', { name })}>
            <ExternalLink />
          </a>
        </Button>
      )}
      <Button
        variant="ghost"
        size="icon-sm"
        disabled={disabled}
        onClick={onRemove}
        aria-label={t('upload.remove', { name })}
        className="text-muted-foreground hover:text-destructive"
      >
        <X />
      </Button>
    </li>
  );
}
