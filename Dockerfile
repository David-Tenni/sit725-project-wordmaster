FROM node:22

WORKDIR /app

COPY . .

EXPOSE 3000

RUN npm install

CMD ["npm", "start"]