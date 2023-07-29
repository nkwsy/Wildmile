FROM node:16-slim

WORKDIR /usr/app

COPY wildmile/package.json .

RUN npm install

COPY wildmile .

CMD ["npm","run","dev"]
