'use client';

import React, { useState } from 'react';
import axios from 'axios';

type UploadResponse = {
  enhancedUrl: string;
};

type CheckoutResponse = {
  url: string;
};

const Upload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [imageType, setImageType] = useState<'standard' | 'bracketed'>('standard');
  const [loading, setLoading] = useState<boolean>(false);

  // ✅ Make sure this matches your backend deployment
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
      formData.append('file', file);
      formData.append('imageType', imageType);

      // ✅ Step 1: Send to /enhance instead of /upload
      const uploadRes = await axios.post<UploadResponse>(
        `${backendUrl}/enhance`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      const enhancedUrl = uploadRes.data?.enhancedUrl;
      if (!enhancedUrl) throw new Error('No enhanced URL returned from backend');

      // ✅ Step 2: Send enhanced image URL to create Stripe checkout
      const checkoutRes = await axios.post<CheckoutResponse>(
        `${backendUrl}/payment/create-checkout`,
        { imageUrl: enhancedUrl }
      );

      const checkoutUrl = checkoutRes.data?.url;
      if (!checkoutUrl) throw new Error('No checkout URL returned');

      // ✅ Step 3: Redirect to Stripe checkout
      window.location.href = checkoutUrl;
    } catch (err: any) {
      console.error('Upload error:', err);
      alert(err?.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Upload Property Photo</h1>

      <select
        value={imageType}
        onChange={(e) => setImageType(e.target.value as 'standard' | 'bracketed')}
        className="mb-4 block border border-gray-300 rounded p-2"
      >
        <option value="standard">Standard</option>
        <option value="bracketed">Bracketed HDR</option>
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
        className="px-6 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        disabled={!file || loading}
        onClick={handleSubmit}
      >
        {loading ? 'Processing...' : 'Enhance & Pay £1.99'}
      </button>
    </div>
  );
};

export default Upload;

