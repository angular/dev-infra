FROM node:16-slim

WORKDIR /usr/src/app

COPY package.json ./

COPY credential-service.js ./

EXPOSE 8080

CMD ["node", "credential-service.js"]
