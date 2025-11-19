# Use an official Node.js image
FROM node:20-alpine

# Set working directory inside container
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy rest of the code
COPY . .

# Expose port for React dev server
EXPOSE 5173

# Start the React dev server with host flag (important for Docker)
CMD ["npm", "run", "dev", "--", "--host"]
