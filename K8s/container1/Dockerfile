From node:latest
WORKDIR /app1
ADD package.json ./
RUN npm i --production
RUN npm i -g pm2
COPY . .
EXPOSE 6000
CMD ["pm2", "start", "process.json", "--no-daemon"]