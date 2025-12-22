import { cn } from "@/lib/utils";
import React, { useRef, useState } from "react";
import { motion } from "motion/react";
import { IconUpload, IconX, IconFile, IconCheck, IconAlertTriangle } from "@tabler/icons-react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DocumentUploadProps {
  title: string;
  description: string;
  acceptedTypes?: string[];
  maxSize?: number; // in MB
  onChange?: (files: File[]) => void;
  required?: boolean;
}

export const DocumentUpload = ({
  title,
  description,
  acceptedTypes = ["image/*", "application/pdf"],
  maxSize = 5,
  onChange,
  required = false,
}: DocumentUploadProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [sizeError, setSizeError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFileSize = (file: File): boolean => {
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > maxSize) {
      setSizeError(`File "${file.name}" is too large (${sizeMB.toFixed(2)}MB). Maximum size is ${maxSize}MB.`);
      return false;
    }
    setSizeError("");
    return true;
  };

  const handleFileChange = (newFiles: File[]) => {
    if (newFiles.length > 0) {
      const validFiles = newFiles.filter(file => validateFileSize(file));
      if (validFiles.length === newFiles.length) {
        setFiles(validFiles);
        onChange && onChange(validFiles);
      }
    } else {
      setFiles(newFiles);
      onChange && onChange(newFiles);
    }
  };

  const handleClick = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const removeFile = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    onChange && onChange(updatedFiles);
  };

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    accept: acceptedTypes.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {} as any),
    maxSize: maxSize * 1024 * 1024,
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      handleFileChange(acceptedFiles);
      setIsDragOver(false);
    },
    onDragEnter: () => setIsDragOver(true),
    onDragLeave: () => setIsDragOver(false),
    noClick: true, // Disable default click to handle manually
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconFile className="h-5 w-5" />
          {title}
          {required && <Badge variant="destructive" className="text-xs">Required</Badge>}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Hidden file input */}
        <input 
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes.join(',')}
          onChange={(e) => {
            const selectedFiles = Array.from(e.target.files || []);
            if (selectedFiles.length > 0) {
              handleFileChange(selectedFiles);
            }
          }}
          style={{ display: 'none' }}
          multiple={false}
        />
        
        <div
          {...getRootProps()}
          onClick={(e) => {
            e.preventDefault();
            if (files.length === 0) {
              handleClick(e);
            }
          }}
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 cursor-pointer",
            isDragActive || isDragOver
              ? "border-primary bg-primary/5 scale-105"
              : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30",
            files.length > 0 ? "border-success bg-success/5" : ""
          )}
        >
          
          {files.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-4"
            >
              <div className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center transition-colors",
                isDragActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}>
                <IconUpload className="h-8 w-8" />
              </div>
              
              <div className="space-y-2">
                <p className="text-lg font-medium">
                  {isDragActive ? "Drop your file here" : "Upload your document"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Drag and drop or click to browse
                </p>
                <p className="text-xs text-muted-foreground">
                  Supports: {acceptedTypes.join(", ")} • Max size: {maxSize}MB
                </p>
              </div>
              
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClick();
                }}
              >
                Choose File
              </Button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-background rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                      <IconCheck className="h-5 w-5 text-success" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-sm truncate max-w-[200px]">
                        {file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)} • {file.type}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(index);
                    }}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <IconX className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClick();
                }}
                className="w-full"
              >
                Change File
              </Button>
            </motion.div>
          )}
        </div>

        {/* File Size Error Alert */}
        {sizeError && (
          <Alert className="mt-4 border-destructive/50 bg-destructive/10">
            <IconAlertTriangle className="h-4 w-4 text-destructive" />
            <AlertDescription className="text-destructive">
              {sizeError}
            </AlertDescription>
          </Alert>
        )}

        {fileRejections.length > 0 && (
          <div className="mt-4 space-y-2">
            {fileRejections.map(({ file, errors }, index) => (
              <div key={index} className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                <p className="font-medium">{file.name}</p>
                <ul className="list-disc list-inside mt-1">
                  {errors.map((error) => (
                    <li key={error.code}>{error.message}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
