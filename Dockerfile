FROM node:25-alpine3.23@sha256:bdf2cca6fe3dabd014ea60163eca3f0f7015fbd5c7ee1b0e9ccb4ced6eb02ef4

ADD package.json package-lock.json /
RUN npm ci --production
ADD entrypoint.js /
RUN chmod +x /entrypoint.js

ENTRYPOINT ["node", "/entrypoint.js"]
