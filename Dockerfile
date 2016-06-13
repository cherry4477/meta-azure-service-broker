FROM library/node

RUN mkdir /broker
WORKDIR /broker
COPY . /broker/
RUN npm install 
ENV environment=AzureCloud
RUN apt-get update && apt-get install -y python-pip && pip install envtpl
CMD ./start.sh
