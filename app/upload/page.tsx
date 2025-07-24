'use client';

import React, { useState } from 'react';

const Upload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [method, setMethod] = useState<'localcv' | 'swinir' | 'both'>('localcv');
  const [loading, setLoading] = useState<boolean>(false);

  const backendUrl: string = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);

    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('method', method);

      const response = await fetch(`${backendUrl}/upload/test-upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Enhancement failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'enhanced.jpg';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.message || 'Something went wrong');
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
          <img
            src={previewUrl}
            alt="Preview"
            className="max-w-full h-auto rounded"
          />
        </div>
      )}

      <button
        disabled={!file || loading}
        onClick={handleSubmit}
        className="px-6 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
      >
        {loading ? 'Processing...' : 'Enhance & Download'}
      </button>
    </div>
  );
};

export default Upload;

