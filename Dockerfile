FROM node:20-alpine

RUN apk update && apk upgrade --no-cache && apk add curl

WORKDIR /app

COPY package*.json ./
RUN npm i

COPY . .

RUN npm run build

EXPOSE 8001

CMD ["node", "dist/main"]
