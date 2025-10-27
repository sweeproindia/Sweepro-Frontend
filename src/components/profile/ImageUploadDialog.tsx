import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Camera, Upload, Loader2, X } from 'lucide-react';
import { apiRequest, API_ENDPOINTS, HttpMethod } from '@/services/api';
import { toast } from 'sonner';

interface ImageUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageType: 'profile' | 'cover';
  currentImage?: string;
  onImageUpdated: () => void;
}

export const ImageUploadDialog: React.FC<ImageUploadDialogProps> = ({
  open,
  onOpenChange,
  imageType,
  currentImage,
  onImageUpdated
}) => {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!imageFile && !preview) {
      toast.error('Please select an image');
      return;
    }

    setLoading(true);
    try {
      // In a real application, you would upload to a cloud storage service
      // For now, we'll use a base64 string or a placeholder URL
      let imageUrl = preview;

      // If using a real file upload service (like AWS S3, Cloudinary, etc.)
      // you would upload the file here and get back a URL
      // Example:
      // const formData = new FormData();
      // formData.append('image', imageFile);
      // const uploadResponse = await uploadToCloudStorage(formData);
      // imageUrl = uploadResponse.url;

      const response = await apiRequest(API_ENDPOINTS.PROFILE.UPLOAD_IMAGE, {
        method: HttpMethod.POST,
        body: {
          imageUrl,
          imageType
        },
        requiresAuth: true
      });

      if (response.success) {
        toast.success(`${imageType === 'profile' ? 'Profile' : 'Cover'} image updated successfully`);
        onImageUpdated();
        onOpenChange(false);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload image');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const endpoint = API_ENDPOINTS.PROFILE.DELETE_IMAGE.replace(':imageType', imageType);
      const response = await apiRequest(endpoint, {
        method: HttpMethod.DELETE,
        requiresAuth: true
      });

      if (response.success) {
        toast.success(`${imageType === 'profile' ? 'Profile' : 'Cover'} image deleted successfully`);
        setPreview(null);
        setImageFile(null);
        onImageUpdated();
        onOpenChange(false);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete image');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {imageType === 'profile' ? 'Update Profile Picture' : 'Update Cover Image'}
          </DialogTitle>
          <DialogDescription>
            Upload a new {imageType === 'profile' ? 'profile picture' : 'cover image'} or delete the current one.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Preview */}
          <div className="relative">
            {preview ? (
              <div className="relative">
                <img
                  src={preview}
                  alt="Preview"
                  className={`w-full object-cover rounded-lg ${
                    imageType === 'profile' ? 'h-64' : 'h-48'
                  }`}
                />
                <button
                  onClick={() => {
                    setPreview(null);
                    setImageFile(null);
                  }}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors ${
                  imageType === 'profile' ? 'h-64' : 'h-48'
                }`}
              >
                <Camera className="h-12 w-12 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">Click to select an image</p>
                <p className="text-xs text-gray-400 mt-1">Max size: 5MB</p>
              </div>
            )}
          </div>

          {/* File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="flex-1"
              disabled={loading}
            >
              <Upload className="h-4 w-4 mr-2" />
              Choose Image
            </Button>
            {currentImage && (
              <Button
                onClick={handleDelete}
                variant="destructive"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <X className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={loading || !preview}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
