FROM library/node

RUN mkdir /broker
WORKDIR /broker
COPY . /broker/
RUN npm install 

CMD npm start
