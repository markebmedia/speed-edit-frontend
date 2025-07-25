'use client';

import React, { useState } from 'react';

const Upload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(''); // Original preview
  const [enhancedUrl, setEnhancedUrl] = useState<string>(''); // Enhanced image preview
  const [method, setMethod] = useState<'localcv' | 'swinir' | 'both'>('localcv');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Use environment variable (set this in Vercel)
  const backendUrl: string =
    process.env.NEXT_PUBLIC_BACKEND_URL || 'https://speed-edit-backend.onrender.com';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    setEnhancedUrl('');
    setError('');

    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    setEnhancedUrl('');

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('method', method);

      const response = await fetch(`${backendUrl}/upload/test-upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Enhancement failed');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setEnhancedUrl(url); // ✅ Show enhanced image instead of auto-downloading
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Upload Property Photo</h1>

      <select
        value={method}
        onChange={(e) => setMethod(e.target.value as 'localcv' | 'swinir' | 'both')}
        className="mb-4 block border border-gray-300 rounded p-2"
      >
        <option value="localcv">Local CV</option>
        <option value="swinir">SwinIR</option>
        <option value="both">Both (AI + CV)</option>
      </select>

      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="mb-4"
      />

      {previewUrl && (
        <div className="mb-4">
          <p className="font-medium">Original Preview:</p>
          <img src={previewUrl} alt="Preview" className="max-w-full h-auto rounded mt-2" />
        </div>
      )}

      <button
        disabled={!file || loading}
        onClick={handleSubmit}
        className="px-6 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
      >
        {loading ? 'Processing...' : 'Enhance Image'}
      </button>

      {error && <p className="text-red-600 mt-4">{error}</p>}

      {enhancedUrl && (
        <div className="mt-6">
          <p className="font-medium">Enhanced Image:</p>
          <img src={enhancedUrl} alt="Enhanced" className="max-w-full h-auto rounded mt-2" />
          <a
            href={enhancedUrl}
            download="enhanced.jpg"
            className="block mt-4 px-4 py-2 bg-green-600 text-white text-center rounded"
          >
            Download Enhanced Image
          </a>
        </div>
      )}
    </div>
  );
};

export default Upload;
