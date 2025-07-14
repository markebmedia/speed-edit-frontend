# Speed Edit

Speed Edit is an AI-powered photo enhancement platform built by [Markeb Media](https://www.markebmedia.com).

## 🌐 Frontend

- Built with Next.js
- Hosted on Vercel
- File: `Upload.tsx`

## ⚙️ Backend

- NestJS API (Render)
- Stripe for payments
- FastAPI for AI Enhancement (SwinIR)

## 📦 How to Deploy

### Backend on Render

1. Set Environment Variables:
   - `STRIPE_SECRET_KEY`
   - `FRONTEND_URL=https://www.markebmedia.com/speed-edit-upload`
2. Add build command:
   ```bash
   npm install && pip install -r ./SwinIR/requirements.txt

