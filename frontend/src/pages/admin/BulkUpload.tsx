import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/services/admin.service';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Download, FileText, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/utils/cn';
import { API_BASE_URL, STORAGE_KEYS } from '@/constants';

export const BulkUpload: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: adminService.bulkUploadQuestions,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-questions'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      setUploadResult(data);
      toast.success(`Upload completed! ${data.success} questions added.`);
      setSelectedFile(null);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Upload failed');
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const validateAndSetFile = (file: File) => {
    const validTypes = ['text/csv', 'application/json'];
    const validExtensions = ['.csv', '.json'];
    const fileExt = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));

    if (!validTypes.includes(file.type) && !validExtensions.includes(fileExt)) {
      toast.error('Please upload a CSV or JSON file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setSelectedFile(file);
    setUploadResult(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const handleUpload = () => {
    if (!selectedFile) {
      toast.error('Please select a file');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    uploadMutation.mutate(formData);
  };

  const downloadTemplate = async (format: 'csv' | 'json') => {
    setIsDownloading(true);
    
    try {
      const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      
      console.log('Downloading template...', { format, token: token ? 'exists' : 'missing' });
      
      const url = `${API_BASE_URL}/admin/questions/template?format=${format}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        throw new Error(`Failed to download: ${response.statusText}`);
      }

      const blob = await response.blob();
      console.log('Blob received:', blob.size, 'bytes');

      // Create blob URL
      const blobUrl = window.URL.createObjectURL(blob);

      // Create temporary link and trigger download
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `questions_template.${format}`;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      toast.success(`Template downloaded successfully!`);
    } catch (error: any) {
      console.error('Download error:', error);
      toast.error(error.message || 'Failed to download template');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/admin/questions')}
          className="btn-secondary btn-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bulk Upload Questions</h1>
          <p className="text-gray-600 mt-1">Upload multiple questions at once</p>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-semibold text-blue-900 mb-3">📋 Instructions:</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
          <li>Download the template file (CSV or JSON format)</li>
          <li>Fill in your questions following the template format</li>
          <li>Upload the completed file below</li>
          <li>Review the upload results</li>
        </ol>
      </div>

      {/* Template Download */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Download Template</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => downloadTemplate('csv')}
            disabled={isDownloading}
            className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all disabled:opacity-50"
          >
            <FileText className="w-8 h-8 text-green-600" />
            <div className="text-left">
              <p className="font-medium text-gray-900">CSV Template</p>
              <p className="text-sm text-gray-600">For Excel, Google Sheets</p>
            </div>
            <Download className="w-5 h-5 text-gray-400 ml-auto" />
          </button>

          <button
            onClick={() => downloadTemplate('json')}
            disabled={isDownloading}
            className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all disabled:opacity-50"
          >
            <FileText className="w-8 h-8 text-blue-600" />
            <div className="text-left">
              <p className="font-medium text-gray-900">JSON Template</p>
              <p className="text-sm text-gray-600">For developers</p>
            </div>
            <Download className="w-5 h-5 text-gray-400 ml-auto" />
          </button>
        </div>
      </div>

      {/* File Upload */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Upload File</h3>

        {/* Drag & Drop Area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            'border-2 border-dashed rounded-xl p-12 text-center transition-all',
            isDragging
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-300 hover:border-gray-400'
          )}
        >
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-900 mb-2">
            {selectedFile ? selectedFile.name : 'Drop your file here'}
          </p>
          <p className="text-sm text-gray-600 mb-4">
            or click to browse (CSV or JSON, max 5MB)
          </p>
          <input
            type="file"
            accept=".csv,.json"
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="btn-secondary cursor-pointer">
            Choose File
          </label>
        </div>

        {/* Selected File Info */}
        {selectedFile && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-blue-600" />
              <div>
                <p className="font-medium text-gray-900">{selectedFile.name}</p>
                <p className="text-sm text-gray-600">
                  {(selectedFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedFile(null)}
              className="text-red-600 hover:text-red-700"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        )}

        {/* Upload Button */}
        {selectedFile && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleUpload}
              disabled={uploadMutation.isPending}
              className="btn-primary"
            >
              {uploadMutation.isPending ? 'Uploading...' : 'Upload Questions'}
            </button>
          </div>
        )}
      </div>

      {/* Upload Results */}
      {uploadResult && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Upload Results</h3>

          {/* Summary */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-gray-50 rounded-lg text-center">
              <p className="text-2xl font-bold text-gray-900">{uploadResult.total}</p>
              <p className="text-sm text-gray-600">Total</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg text-center">
              <p className="text-2xl font-bold text-green-600">{uploadResult.success}</p>
              <p className="text-sm text-gray-600">Success</p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg text-center">
              <p className="text-2xl font-bold text-red-600">{uploadResult.failed}</p>
              <p className="text-sm text-gray-600">Failed</p>
            </div>
          </div>

          {/* Errors */}
          {uploadResult.errors && uploadResult.errors.length > 0 && (
            <div>
              <h4 className="font-medium text-red-900 mb-3">Errors:</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {uploadResult.errors.map((error: any, index: number) => (
                  <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm font-medium text-red-900">
                      Row {error.row}: {error.error}
                    </p>
                    <p className="text-xs text-red-700 mt-1">{error.question}...</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Success Message */}
          {uploadResult.success > 0 && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <p className="text-green-900">
                {uploadResult.success} question(s) successfully uploaded!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
