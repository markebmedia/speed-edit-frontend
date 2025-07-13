'use client';

import { useState } from 'react';
import axios from 'axios';

export default function Upload() {
  const [file, setFile] = useState<File | null>(null);
  const [enhancedUrl, setEnhancedUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return alert('Please select a file.');

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('imageType', 'jpg');

    try {
      const response = await axios.post('https://speed-edit-backend.onrender.com/enhance', formData);
      const { imageUrl } = response.data;
      setEnhancedUrl(imageUrl);
    } catch (err) {
      alert('Enhancement failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!enhancedUrl) return;
    const res = await axios.post('https://speed-edit-backend.onrender.com/payment/create-checkout', {
      imageUrl: enhancedUrl,
    });
    window.location.href = res.data.url;
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Upload & Enhance</h1>
      <input type="file" accept="image/*" onChange={handleFileChange} className="mb-4" />
      <button onClick={handleUpload} className="bg-blue-600 text-white px-4 py-2 rounded">
        Enhance
      </button>

      {loading && <p>Enhancing image...</p>}

      {enhancedUrl && (
        <div className="mt-6">
          <img src={enhancedUrl} alt="Enhanced" className="rounded shadow" />
          <button onClick={handlePayment} className="mt-4 bg-green-600 text-white px-4 py-2 rounded">
            Pay £1.99 to Download
          </button>
        </div>
      )}
    </div>
  );
}
