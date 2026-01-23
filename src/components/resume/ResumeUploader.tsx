'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { cn, getErrorMessage } from '@/lib/utils';
import Button from '@/components/ui/Button';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface ResumeUploaderProps {
  onUploadComplete?: (resume: any) => void;
}

export default function ResumeUploader({ onUploadComplete }: ResumeUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setIsUploading(true);
      setUploadStatus('idle');

      try {
        const response = await api.uploadResume(file);
        if (response.success && response.data) {
          setUploadStatus('success');
          toast.success('Resume uploaded successfully!');
          onUploadComplete?.(response.data);
        } else {
          throw new Error(response.error || 'Upload failed');
        }
      } catch (error: any) {
        setUploadStatus('error');
        toast.error(getErrorMessage(error, 'Failed to upload resume'));
      } finally {
        setIsUploading(false);
      }
    },
    [onUploadComplete]
  );

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: isUploading,
  });

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors',
          isDragActive
            ? 'border-blue-500 bg-blue-50'
            : uploadStatus === 'success'
            ? 'border-green-500 bg-green-50'
            : uploadStatus === 'error'
            ? 'border-red-500 bg-red-50'
            : 'border-gray-300 hover:border-gray-400',
          isUploading && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center">
          {isUploading ? (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4" />
              <p className="text-gray-600">Uploading and parsing your resume...</p>
            </>
          ) : uploadStatus === 'success' ? (
            <>
              <CheckCircle className="h-12 w-12 text-green-600 mb-4" />
              <p className="text-green-600 font-medium">Resume uploaded successfully!</p>
              <p className="text-gray-500 text-sm mt-2">Drop another file to replace</p>
            </>
          ) : uploadStatus === 'error' ? (
            <>
              <AlertCircle className="h-12 w-12 text-red-600 mb-4" />
              <p className="text-red-600 font-medium">Upload failed</p>
              <p className="text-gray-500 text-sm mt-2">Click or drop to try again</p>
            </>
          ) : (
            <>
              <Upload className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600">
                {isDragActive ? (
                  'Drop your resume here...'
                ) : (
                  <>
                    <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
                  </>
                )}
              </p>
              <p className="text-gray-500 text-sm mt-2">PDF or DOCX (max 10MB)</p>
            </>
          )}
        </div>
      </div>

      {acceptedFiles.length > 0 && !isUploading && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg flex items-center">
          <FileText className="h-5 w-5 text-gray-500 mr-2" />
          <span className="text-sm text-gray-600">{acceptedFiles[0].name}</span>
          <span className="text-sm text-gray-400 ml-2">
            ({(acceptedFiles[0].size / 1024).toFixed(1)} KB)
          </span>
        </div>
      )}
    </div>
  );
}
