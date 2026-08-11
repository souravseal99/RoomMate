# Use official Node.js image
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/
RUN npm install
RUN npx prisma generate

COPY . .

# Expose backend port
EXPOSE 5000

# Start your server app
CMD ["npm", "run", "dev:serve"]

