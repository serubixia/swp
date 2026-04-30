FROM node:20-alpine

WORKDIR /app

# Dependencias necesarias para sharp
RUN apk add --no-cache libc6-compat

COPY package.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
