# Use official Node.js image
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Expose backend port
EXPOSE 5000

# Start your server app (adjust if needed)
CMD ["npm", "run", "dev"]
