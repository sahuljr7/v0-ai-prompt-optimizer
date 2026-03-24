'use client';

import { useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FileUploadProps {
  onFileSelect: (files: Array<{ name: string; size: number; type: string }>) => void;
}

const ALLOWED_TYPES = ['application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const ALLOWED_EXTENSIONS = ['pdf', 'txt', 'docx'];

export function FileUpload({ onFileSelect }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<Array<{ name: string; size: number; type: string }>>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter((file) => {
      const extension = file.name.split('.').pop()?.toLowerCase();
      return ALLOWED_TYPES.includes(file.type) || ALLOWED_EXTENSIONS.includes(extension || '');
    });

    const fileData = validFiles.map((file) => ({
      name: file.name,
      size: file.size,
      type: file.type,
    }));

    setSelectedFiles((prev) => [...prev, ...fileData]);
    onFileSelect([...selectedFiles, ...fileData]);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    onFileSelect(newFiles);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={ALLOWED_EXTENSIONS.map((ext) => `.${ext}`).join(',')}
        onChange={handleFileChange}
        className="hidden"
      />
      <Button
        variant="outline"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        className="gap-2"
      >
        <Upload className="w-4 h-4" />
        Attach Files
      </Button>

      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          {selectedFiles.map((file, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2 rounded border border-border bg-secondary/20 text-sm"
            >
              <div>
                <p className="font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeFile(idx)}
                className="h-auto p-1"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
