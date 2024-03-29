FROM node:18

# Create app directory
WORKDIR /

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY ["package.json", "package-lock.json*", "./"]

RUN npm install
RUN npm install @nestjs/swagger
# If you are building your code for production
# RUN npm ci --omit=dev

# Bundle app source
COPY . .
RUN npm run build


EXPOSE 3000
CMD [ "npm", "run" , "start" ]