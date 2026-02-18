'use client';

import React, { useState, useCallback } from 'react';
import { Camera, Upload, X, Loader2 } from 'lucide-react';
import api from '@/lib/api';

interface PhotoUploadProps {
  photoUrl?: string | null;
  onPhotoChange: (url: string | null) => void;
}

export const PhotoUpload: React.FC<PhotoUploadProps> = ({ photoUrl, onPhotoChange }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileUpload = async (file: File) => {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Please use JPG, PNG, or WebP');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('File too large. Maximum size is 5MB');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const response = await api.uploadPhoto(file);

      onPhotoChange(response.data?.photoUrl || (response as any).photoUrl);
    } catch (err: any) {
      console.error('Photo upload error:', err);
      setError(err.response?.data?.error || 'Failed to upload photo');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  }, []);

  const handleRemove = () => {
    onPhotoChange(null);
    setError(null);
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Profile Photo (Optional)
      </label>

      {photoUrl ? (
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={photoUrl}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover border-2 border-gray-300 dark:border-gray-600"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-lg transition-colors"
              title="Remove photo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p className="font-medium">Photo uploaded successfully</p>
            <button
              type="button"
              onClick={() => document.getElementById('photo-input')?.click()}
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline mt-1"
            >
              Change photo
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
              <p className="text-sm text-gray-600 dark:text-gray-400">Uploading photo...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-4">
                <Camera className="w-8 h-8 text-gray-600 dark:text-gray-400" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Drag and drop your photo here
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  or
                </p>
                <button
                  type="button"
                  onClick={() => document.getElementById('photo-input')?.click()}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  Choose File
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                JPG, PNG, or WebP (max 5MB)
              </p>
            </div>
          )}
        </div>
      )}

      <input
        id="photo-input"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <p className="text-xs text-gray-500 dark:text-gray-500">
        A professional headshot works best. Your photo will be displayed on photo-enabled resume templates.
      </p>
    </div>
  );
};
