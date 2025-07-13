import { useState } from 'react';
import axios from 'axios';

export default function Home() {
  const [files, setFiles] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);
  const [enhancedPreviews, setEnhancedPreviews] = useState<string[]>([]);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiles(e.target.files);
    setEnhancedPreviews([]);
    setCheckoutUrl(null);
  };

  const handleEnhance = async () => {
    if (!files || files.length === 0) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', files[0]); // Only the first image for now

    try {
      // 1. Enhance the image using FastAPI
      const res = await axios.post('http://localhost:8000/enhance', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const relativeUrl = res.data?.enhanced_url;
      if (!relativeUrl || typeof relativeUrl !== 'string') {
        throw new Error('Invalid enhancement response');
      }

      const fullUrl = `http://localhost:8000${relativeUrl}`;
      setEnhancedPreviews([fullUrl]);

      // 2. Create Stripe Checkout Session (NestJS)
      console.log('Sending imageUrl to backend:', fullUrl);

      const checkout = await axios.post('https://speed-edit.onrender.com/payment/create-checkout', {
        imageUrl: fullUrl,
      });

      if (checkout.data?.url) {
        setCheckoutUrl(checkout.data.url);
      } else {
        throw new Error('Failed to generate Stripe session');
      }
    } catch (err) {
      console.error('Enhance or payment error:', err);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg p-6 space-y-6">
        <h1 className="text-3xl font-bold text-center text-gray-800">Speed Edit</h1>

        <input
          type="file"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-600
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />

        {checkoutUrl ? (
          <a
            href={checkoutUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-block text-center bg-green-600 text-white py-2 rounded hover:bg-green-700"
          >
            Proceed to Payment
          </a>
        ) : (
          <button
            onClick={handleEnhance}
            disabled={!files || loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Enhancing...' : 'Enhance Photo'}
          </button>
        )}

        {enhancedPreviews.length > 0 && (
          <div className="grid grid-cols-1 gap-4">
            {enhancedPreviews.map((url, i) => (
              <img key={i} src={url} alt={`Preview ${i + 1}`} className="rounded border shadow" />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

