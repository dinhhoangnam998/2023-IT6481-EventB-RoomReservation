const { MongoClient } = require('mongodb');
const client = new MongoClient(process.env.MONGODB_CONNECT_STRING, {
  useUnifiedTopology: true,
});
const connection = client.connect();

const Collections = {
  USER: 'User',
  ROOM: 'Room',
  RESERVATION: 'Reservation',
};

module.exports = { connection, Collections };
