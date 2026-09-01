# Use Node.js 20 (LTS) as the base image
FROM node:20-alpine

# Set working directory inside the container
WORKDIR /app

# Copy package files first (Docker caches this layer)
COPY package.json package-lock.json* ./

# Install only production dependencies (no devDependencies)
RUN npm ci --omit=dev

# Copy the rest of the backend code
COPY . .

# Create uploads directory
RUN mkdir -p uploads

# The app listens on port 5000
EXPOSE 5000

# Start the server
CMD ["node", "server.js"]
