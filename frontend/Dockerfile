FROM node:latest

RUN npm install -g typescript
RUN npm install -g create-react-app

WORKDIR /app

COPY ./dev/app .

EXPOSE 3000

CMD ["npm", "start"]
