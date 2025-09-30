"use client";

import React, { useState, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle, Loader2 } from 'lucide-react';
import { ImageUploadService } from '@/lib/services/imageUploadService';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string | undefined) => void;
  className?: string;
  disabled?: boolean;
}

export function ImageUpload({ value, onChange, className = "", disabled = false }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const uploadImage = useCallback(async (file: File) => {
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      const result = await ImageUploadService.uploadImage(file);
      
      if (result.error) {
        setError(result.error);
      } else if (result.url) {
        onChange(result.url);
      }
    } catch (err) {
      console.error('Image upload error:', err);
      setError('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }, [onChange]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadImage(file);
    }
  }, [uploadImage]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      uploadImage(file);
    }
  }, [uploadImage]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const removeImage = useCallback(() => {
    onChange(undefined);
    setError(null);
  }, [onChange]);

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Current Image Display */}
      {value && (
        <div className="relative group">
          <img
            src={value}
            alt="Product"
            className="w-32 h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
            onError={(e) => {
              e.currentTarget.src = '/placeholder-image.svg';
            }}
          />
          <button
            type="button"
            onClick={removeImage}
            disabled={disabled || isUploading}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Upload Area */}
      {!value && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            border-2 border-dashed rounded-lg p-6 text-center transition-colors
            ${dragActive 
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          <label className="cursor-pointer block">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              disabled={disabled || isUploading}
              className="hidden"
            />
            
            <div className="flex flex-col items-center space-y-2">
              {isUploading ? (
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              ) : (
                <Upload className="w-8 h-8 text-gray-400" />
              )}
              
              <div className="text-sm">
                {isUploading ? (
                  <span className="text-blue-600 dark:text-blue-400">Uploading...</span>
                ) : (
                  <>
                    <span className="font-medium text-blue-600 dark:text-blue-400">
                      Click to upload
                    </span>
                    <span className="text-gray-500 dark:text-gray-400"> or drag and drop</span>
                  </>
                )}
              </div>
              
              {!isUploading && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  PNG, JPG, GIF, WebP up to 5MB
                </p>
              )}
            </div>
          </label>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="flex items-center space-x-2 text-red-600 dark:text-red-400 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* URL Input Fallback */}
      <div className="pt-3 border-t border-gray-200 dark:border-gray-600">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Or paste image URL
        </label>
        <input
          type="url"
          value={value || ''}
          onChange={(e) => onChange(e.target.value || undefined)}
          disabled={disabled || isUploading}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
          placeholder="https://example.com/image.jpg"
        />
      </div>
    </div>
  );
}