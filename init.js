const { connection, Collections } = require('./db');
const { Role } = require('./src/routes/access-control/role');

async function init() {
  const userColl = (await connection).db().collection(Collections.USER);
  const roomColl = (await connection).db().collection(Collections.ROOM);
  await userColl.createIndex({ name: 1 }, { unique: true });
  await roomColl.createIndex({ name: 1 }, { unique: true });

  // init root role Admin
  const count = await userColl.countDocuments({});
  if (count === 0) {
    const root = { name: 'Root', role: Role.Admin };
    await userColl.insertOne(root);
  }
}

module.exports = { init };
