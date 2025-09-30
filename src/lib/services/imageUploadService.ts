import { supabase } from '@/lib/supabase';

export interface UploadResult {
  url?: string;
  error?: string;
}

export class ImageUploadService {
  private static readonly BUCKET_NAME = 'product-images';
  private static readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  private static readonly ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  static async uploadImage(file: File): Promise<UploadResult> {
    try {
      // Validate file type
      if (!this.ALLOWED_TYPES.includes(file.type)) {
        return { error: 'Invalid file type. Please use JPG, PNG, GIF, or WebP.' };
      }

      // Validate file size
      if (file.size > this.MAX_FILE_SIZE) {
        return { error: 'File too large. Maximum size is 5MB.' };
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `products/${fileName}`;

      // Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        return { error: uploadError.message || 'Failed to upload image' };
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(filePath);

      return { url: publicUrl };
    } catch (error) {
      console.error('Image upload service error:', error);
      return { error: error instanceof Error ? error.message : 'Upload failed' };
    }
  }

  static async deleteImage(url: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Extract path from URL
      const urlParts = url.split('/');
      const pathIndex = urlParts.findIndex(part => part === this.BUCKET_NAME);
      
      if (pathIndex === -1) {
        return { success: false, error: 'Invalid image URL' };
      }

      const filePath = urlParts.slice(pathIndex + 1).join('/');

      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([filePath]);

      if (error) {
        console.error('Delete error:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Image delete service error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Delete failed' };
    }
  }

  static isValidImageUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  }

  static optimizeImageUrl(url: string, width?: number, height?: number): string {
    // If it's a Supabase storage URL, we can add optimization parameters
    if (url.includes('supabase')) {
      const params = new URLSearchParams();
      if (width) params.append('width', width.toString());
      if (height) params.append('height', height.toString());
      params.append('quality', '80');
      
      const separator = url.includes('?') ? '&' : '?';
      return `${url}${separator}${params.toString()}`;
    }
    
    return url;
  }
}