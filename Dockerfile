FROM node:20-slim

WORKDIR /usr/app

# COPY wildmile/package.json .
COPY wildmile/package.json wildmile/package-lock.json ./

RUN npm install

COPY wildmile .
# Set permissions for the .next directory
RUN mkdir -p .next && chown node:node .next

# USER node

CMD ["npm","run","dev"]
