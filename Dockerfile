FROM node:25-alpine3.23@sha256:f4769ca6eeb6ebbd15eb9c8233afed856e437b75f486f7fccaa81d7c8ad56007

ADD package.json package-lock.json /
RUN npm ci --production
ADD entrypoint.js /
RUN chmod +x /entrypoint.js

ENTRYPOINT ["node", "/entrypoint.js"]
