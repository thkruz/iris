FROM node:alpine 

WORKDIR /app

COPY . /app
RUN npm install -g nodemon@2.0.15 &&\
    npm install

EXPOSE 8082

CMD ["npm", "start"]