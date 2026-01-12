# Stage 1: Build frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app/client

# Copy client package files
COPY client/package*.json ./

# Install client dependencies
RUN npm ci

# Copy client source code
COPY client/ ./

# Build the frontend
RUN npm run build


# Stage 2: Setup backend and serve
FROM node:20-alpine AS production

WORKDIR /app

# Copy server package files
COPY server/package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy server source code
COPY server/src ./src

# Copy built frontend from stage 1
COPY --from=frontend-builder /app/client/dist ./public

# Expose the port
EXPOSE 3001

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3001

# Start the server
CMD ["node", "src/index.js"]
