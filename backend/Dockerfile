FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .
RUN npx prisma generate

ENV PORT=5000
EXPOSE 5000

CMD ["node", "src/index.js"]
