FROM node:20

WORKDIR /usr/app

COPY wildmile/package.json .
# COPY wildmile/package.json wildmile/package-lock.json ./

RUN apt-get update && apt-get install -y build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev
RUN npm install canvas --build-from-source

COPY wildmile .
# Set permissions for the .next directory
RUN mkdir -p .next && chown node:node .next

# Set the NODE_OPTIONS environment variable to enable debugging
ENV NODE_OPTIONS='--inspect=0.0.0.0:9229'
# USER node
EXPOSE 3000
EXPOSE 9229

CMD ["npm","run","dev"]
