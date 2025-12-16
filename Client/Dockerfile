# --------------------------------------
# Stage 1: Build React (Vite) application
# --------------------------------------
FROM node:18-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy all source code
COPY . .

# Build production static files
RUN npm run build

# --------------------------------------
# Stage 2: Serve with Nginx
# --------------------------------------
FROM nginx:alpine

# Copy the build output from the previous stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
