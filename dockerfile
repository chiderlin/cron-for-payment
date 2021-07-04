FROM node:12.18.1
MAINTAINER Chi Lin "chiderlin36@gmail.com"

COPY . /app
WORKDIR /app
RUN npm install
EXPOSE 3001
CMD ["node", "timer.js"]