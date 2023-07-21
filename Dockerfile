FROM node:16-slim

WORKDIR /usr/app

COPY package.json .

RUN npm install --production

COPY . .

CMD ["npm","start"]
