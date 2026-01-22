---
description: Run the Express.js backend API server
---

# Run Backend API

## Prerequisites
- Node.js 20+ LTS
- MongoDB running locally or Atlas connection string

## Steps

### 1. Navigate to API directory
```bash
cd services/api
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment
Create `.env` file:
```env
PORT=3001
MONGO_URI=mongodb://127.0.0.1:27017/doctor-help
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-refresh-secret-key
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### 4. Start the server
```bash
npm run dev
```

Server runs at http://localhost:3001

## Seed Sample Data

```bash
# Seed sample doctors (required for app to show doctors)
npm run seed:doctors

# Seed admin user
npm run seed:admin
```

## Verify API is Running

```bash
curl http://localhost:3001
# Returns: { "status": "ok", "message": "🏥 Doctor Help API is running" }

curl http://localhost:3001/health
# Returns health status with MongoDB connection state
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/send-otp | Send OTP |
| POST | /api/auth/verify-otp | Verify OTP & login |
| GET | /api/doctors | List doctors |
| GET | /api/doctors/:id | Get doctor |
| POST | /api/appointments | Create appointment |
| GET | /api/appointments/patient/:id | Patient appointments |
| GET | /api/appointments/doctor/:id | Doctor appointments |

## Troubleshooting

### MongoDB connection failed
- Make sure MongoDB is running: `mongod`
- Or use MongoDB Atlas and update MONGO_URI

### Port already in use
```bash
# Windows - find process using port
netstat -ano | findstr :3001

# Kill process
taskkill /PID <pid> /F
```

### OTP not received
- In development, OTP is logged to console (not sent via SMS)
- Check terminal output for OTP code
