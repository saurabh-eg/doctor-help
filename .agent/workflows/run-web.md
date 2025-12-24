---
description: Run the web-admin Vite app locally
---

# Run Web Admin App

// turbo-all

## Steps

1. Navigate to web admin directory
```bash
cd apps/web-admin
```

2. Install dependencies (if needed)
```bash
npm install
```

3. Create .env.local if using Gemini AI features
```bash
echo "GEMINI_API_KEY=your-api-key-here" > .env.local
```

4. Start Vite development server
```bash
npm run dev
```

5. Open browser at http://localhost:5173

## Build for Production

```bash
npm run build
npm run preview
```
