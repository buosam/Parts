FROM node:20-slim

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install dependencies cleanly
RUN npm ci

# Copy all source files
COPY . .

# Build Vite frontend and Express server bundle
RUN npm run build

# Expose port (overridden by Railway PORT env var at runtime)
EXPOSE 3000

ENV NODE_ENV=production

CMD ["node", "dist/server.cjs"]
