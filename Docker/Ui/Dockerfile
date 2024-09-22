FROM alpine:3.20

WORKDIR /home/src/main/java/frontend

RUN apk add --update npm

ENTRYPOINT ["/bin/sh", "-c", "npm install && npm run dev"]
