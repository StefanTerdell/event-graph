docker stop eventstore-node
docker rm eventstore-node
docker run --name eventstore-node -it -d -p 2113:2113 -p 1113:1113 eventstore/eventstore
npm start