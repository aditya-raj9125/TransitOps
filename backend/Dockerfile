# Base image
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
RUN apk add --no-cache openssl
COPY package*.json ./
COPY prisma ./prisma/
RUN npm install

# Copy source code
COPY . .

# Build application
RUN npx prisma generate
RUN npm run build

# Production image
FROM node:20-alpine AS runner

WORKDIR /app

RUN apk add --no-cache openssl

# Copy built assets and dependencies
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Expose port
EXPOSE 3000

# Start server
CMD ["npm", "run", "start:prod"]
