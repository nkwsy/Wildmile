FROM node:20

WORKDIR /usr/app

COPY wildmile/package.json .
# COPY wildmile/package.json wildmile/package-lock.json ./

RUN apt-get update && apt-get install -y build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev
RUN npm install canvas --build-from-source
RUN npm install

COPY wildmile .
# Set permissions for the .next directory
RUN mkdir -p .next && chown node:node .next

# USER node

CMD ["npm","run","dev"]
