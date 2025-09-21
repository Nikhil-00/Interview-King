import React, { useState, useCallback } from 'react';
import { Upload, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  label: string;
  accept: string;
  onFileSelect: (file: File | null) => void;
  className?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  label,
  accept,
  onFileSelect,
  className
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selectedFile = e.dataTransfer.files[0];
      setFile(selectedFile);
      onFileSelect(selectedFile);
    }
  }, [onFileSelect]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      onFileSelect(selectedFile);
    }
  }, [onFileSelect]);

  const removeFile = useCallback(() => {
    setFile(null);
    onFileSelect(null);
  }, [onFileSelect]);

  return (
    <div className={cn("relative", className)}>
      <input
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
        id={`file-upload-${label}`}
      />
      
      <label
        htmlFor={`file-upload-${label}`}
        className={cn(
          "relative block w-full p-8 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-300",
          "bg-gradient-card hover:shadow-card",
          dragActive 
            ? "border-primary bg-primary/10" 
            : "border-muted-foreground/30 hover:border-primary/50",
          file ? "border-success bg-success/5" : ""
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="text-center">
          {file ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-success/20 rounded-full">
                <FileText className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  removeFile();
                }}
                className="mt-2"
              >
                <X className="w-4 h-4 mr-1" />
                Remove
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-primary/20 rounded-full">
                <Upload className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground">
                  Drag and drop your file here, or click to browse
                </p>
              </div>
            </div>
          )}
        </div>
      </label>
    </div>
  );
};