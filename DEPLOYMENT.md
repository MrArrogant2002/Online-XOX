# Deployment Guide

## What Was Fixed

The original Vercel error occurred because you cannot use both `builds` (legacy) and `functions` (modern) properties in the same `vercel.json` file.

### The Error
```
The `functions` property cannot be used in conjunction with the `builds` property. Please remove one of them.
```

### The Solution
1. **Removed legacy `builds` configuration**
2. **Created API route for Socket.IO** (`src/pages/api/socket.ts`)
3. **Updated frontend to use API route** instead of custom server
4. **Simplified `vercel.json`** for modern Next.js deployment

## Deployment Options

### Option 1: Vercel (Recommended for Frontend)
```bash
# 1. Deploy to Vercel
vercel

# 2. Set environment variables in Vercel dashboard:
NEXT_PUBLIC_SERVER_URL=https://your-domain.vercel.app
NODE_ENV=production
```

**Note**: Vercel has limitations with persistent Socket.IO connections. The API route approach works but may have timeouts.

### Option 2: Railway/Render (Recommended for Full Stack)
For better Socket.IO support, consider these platforms:

**Railway:**
```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Deploy
railway login
railway init
railway up
```

**Render:**
1. Connect your GitHub repo
2. Choose "Web Service"
3. Build command: `npm run build`
4. Start command: `npm run dev:custom`

### Option 3: Custom Server on Vercel
If you need the custom server approach:

1. Use the custom server script: `npm run dev:custom`
2. Deploy with different configuration for persistent connections

## Environment Variables

### Development (.env.local)
```env
NEXT_PUBLIC_SERVER_URL=http://localhost:3001
NODE_ENV=development
```

### Production
```env
NEXT_PUBLIC_SERVER_URL=https://your-production-url.com
NODE_ENV=production
CORS_ORIGIN=https://your-production-url.com
```

## Current Setup

### For Development
```bash
npm run dev        # Next.js with API routes (port 3001)
npm run dev:custom # Custom server with Socket.IO (port 3001)
```

### For Production
```bash
npm run build
npm run start      # Next.js production server
```

## Testing the Deployment

1. **Local test**: `npm run dev` → http://localhost:3001
2. **Production test**: Create two browser tabs and test real-time gameplay
3. **Mobile test**: Use network IP (e.g., http://192.168.x.x:3001)

## Troubleshooting

### Vercel Issues
- Socket.IO connections may timeout after 10 seconds (serverless limitation)
- Use WebSocket polling as fallback
- Consider upgrading to Vercel Pro for longer function execution

### CORS Issues
- Ensure CORS_ORIGIN matches your domain
- Add your domain to Socket.IO CORS settings

### Build Issues
- Check TypeScript errors: `npm run lint`
- Verify all dependencies are installed: `npm install`

## Alternative: Docker Deployment

For full control, use Docker:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "run", "dev:custom"]
```

Deploy to any Docker-compatible platform (DigitalOcean, AWS, etc.).