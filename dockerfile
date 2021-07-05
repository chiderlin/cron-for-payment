FROM node:12.18.1
MAINTAINER Chi Lin "chiderlin36@gmail.com"

COPY . /app
WORKDIR /app
RUN apt-get update \
    DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends tzdata
    
RUN TZ=Asia/Taipei \
    && ln -snf /usr/share/zoneinfo/$TZ /etc/localtime \
    && echo $TZ > /etc/timezone \
    && dpkg-reconfigure -f noninteractive tzdata 
RUN npm install
EXPOSE 3001
CMD ["node", "timer.js"]