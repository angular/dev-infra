FROM node:16-slim@sha256:25a81a735e584066d97e01df43d825a026dde33d6ca5ab6ff3718141da920397

WORKDIR /usr/src/app

COPY package.json ./

COPY credential-service.js ./

EXPOSE 8080

CMD ["node", "credential-service.js"]
