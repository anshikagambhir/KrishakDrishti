# Multi-stage production build for KrishakDrishti Backend
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json tsconfig.json ./
RUN npm ci

COPY src ./src
COPY data ./data

RUN npm run build

# Production runtime stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/data ./data

RUN mkdir -p /app/data/uploads

EXPOSE 5000

CMD ["node", "dist/server.js"]

