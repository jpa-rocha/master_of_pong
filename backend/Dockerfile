FROM node:latest

RUN npm install -g typescript
RUN npm install -g @nestjs/cli

WORKDIR /app

COPY ./example/ .

WORKDIR /app/example/chat
RUN ls
RUN npm install

CMD ["npm", "run", "start:dev"]
