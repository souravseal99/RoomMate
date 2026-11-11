# Use official Node.js image
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/
RUN npm install
RUN DATABASE_URL="postgresql://dummy:dummy@dummy:5432/dummy" npx prisma generate

COPY . .

ENV PATH="/app/node_modules/.bin:$PATH"

# Expose backend port
EXPOSE 5000

# Run database migrations and start server (if SEED_ON_BOOT=true, runs non-destructive idempotent seed)
CMD ["sh", "-c", "(npx prisma migrate deploy || npx prisma db push) && if [ \"$SEED_ON_BOOT\" = \"true\" ]; then npm run db:seed:idempotent; fi && npx vite-node src/server.ts"]


