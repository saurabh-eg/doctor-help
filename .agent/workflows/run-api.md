---
description: Run the API Gateway backend server
---

# Run API Gateway

// turbo-all

## Prerequisites
- Bun runtime installed (`npm install -g bun`)
- MongoDB running locally or connection string configured

## Steps

1. Navigate to API directory
```bash
cd services/api-gateway
```

2. Install dependencies
```bash
bun install
```

3. Start the server
```bash
bun run index.ts
```

4. Server runs at http://localhost:3001

## Environment Variables (create .env)
```
MONGO_URI=mongodb://localhost:27017/doctor-help
JWT_SECRET=your-secret-key
PORT=3001
```

## Verify
```bash
curl http://localhost:3001
# Should return: Hello from Doctor Help API
```
