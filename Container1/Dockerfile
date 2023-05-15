FROM node:latest
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 6000
CMD ["node", "api1.js"]