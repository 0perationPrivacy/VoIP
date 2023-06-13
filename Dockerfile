FROM docker.io/library/node:alpine

# Choose the port 
EXPOSE 3000

# Environment variables
ENV NPM_CONFIG_PREFIX=/home/node/.npm-global
ENV PATH=$PATH:/home/node/.npm-global/bin

# Install app dependencies
WORKDIR /home/node/app
#COPY ./VoIP/package*.json .
COPY . .
#RUN npm install 

# Install app 
#COPY ./VoIP .
RUN chown -R node:node .
RUN npm install 
USER node

#CMD [ "node", "app.js" ]
CMD [ "npm", "run", "start" ]
