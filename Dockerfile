# Use the official Node.js 18 Alpine image
FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Build stage
FROM node:18-alpine AS build
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Set working directory
WORKDIR /app

# Copy built application from build stage
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=build --chown=nextjs:nodejs /app/public ./public

# Copy necessary runtime files
COPY --chown=nextjs:nodejs healthcheck.js ./
COPY --chown=nextjs:nodejs start.sh ./
RUN chmod +x start.sh

# Install production dependencies that standalone build didn't trace
# (API route dependencies are sometimes missed by file tracing)
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Install missing dependencies
RUN npm install --production --ignore-scripts

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
  CMD node healthcheck.js

# Start the application
ENTRYPOINT ["dumb-init", "--"]
CMD ["./start.sh"]
