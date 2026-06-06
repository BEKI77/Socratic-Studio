FROM node:20-alpine

RUN apk update && apk upgrade --no-cache

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ENV NEXT_FONT_GOOGLE_MOCKED=true

RUN npm run build

CMD ["npm", "start"]