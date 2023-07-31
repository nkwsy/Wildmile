FROM node:16-slim

WORKDIR /usr/app

COPY package.json .

RUN npm install

COPY . .

CMD ["npm","start"]
