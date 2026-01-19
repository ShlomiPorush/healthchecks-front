# Use Node.js 16 LTS (compatible with Next.js 11)
FROM node:16-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code and build
COPY . .
RUN npm run build

# Production mode
ENV NODE_ENV=production

EXPOSE 3000

# Start Next.js - environment variables are read at runtime by the API route
CMD ["npm", "start"]



