
FROM node:20-alpine


WORKDIR /app

COPY package.json package-lock.json /app/

RUN npm install

COPY . .

EXPOSE 4000

CMD [ "npm" , "start"]

