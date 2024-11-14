FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json /app/

RUN  npm install

COPY . .

EXPOSE 5004

CMD [ "npm" , "start" ]
