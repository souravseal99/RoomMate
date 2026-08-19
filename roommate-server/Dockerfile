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

# Start server app with database migrations & seed sequence
CMD ["sh", "-c", "npx prisma generate && npx prisma db push && npm run db:seed && npm run dev:serve"]


