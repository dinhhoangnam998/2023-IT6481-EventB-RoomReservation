const express = require('express');
const router = express.Router();
const { z } = require('zod');
const { Role } = require('./access-control/role');
const { connection, Collections } = require('../../db');
const { authen, author } = require('./access-control/protect-middleware');
const { ObjectId } = require('mongodb');
const { States } = require('./constant');

const roomSchema = z.object({
  name: z.string(),
  active: z.boolean().default(true),
});

const roomIdSchema = z.object({
  roomId: z.string(),
});

router.post('/', authen, author([Role.Admin]), async (req, res, next) => {
  try {
    const roomPayload = roomSchema.parse(req.body);
    const coll = (await connection).db().collection(Collections.ROOM);
    const result = await coll.insertOne(roomPayload);
    return res.json({ insertedId: result.insertedId });
  } catch (error) {
    next(error);
  }
});

router.get('/', authen, async (req, res, next) => {
  try {
    const coll = (await connection).db().collection(Collections.ROOM);
    const docs = await coll.find({}).toArray();
    return res.json(docs);
  } catch (error) {
    next(error);
  }
});

router.patch(
  '/deactivate',
  authen,
  author([Role.Admin]),
  async (req, res, next) => {
    try {
      const payload = roomIdSchema.parse(req.body);
      const coll = (await connection).db().collection(Collections.ROOM);
      const room = await coll.findOne({ _id: new ObjectId(payload.roomId) });
      if (!room)
        return res
          .status(400)
          .send(`Không tìm thấy phòng với id ${payload.roomId}`);

      if (room.active === false)
        return res.status(400).send(`Phòng đã dừng hoạt động rồi!`);

      const reservationColl = (await connection)
        .db()
        .collection(Collections.ROOM);
      const now = Date.now();
      const count = await reservationColl.countDocuments({
        state: States.enum.Reserved,
        startTime: { $lt: now },
        endTime: { $gt: now },
      });
      if (count > 0)
        return res.status(400).send('Có đơn đang sử dụng phòng này!');

      const result = await coll.updateOne(
        { _id: new ObjectId(payload.roomId) },
        { $set: { active: false } }
      );

      return res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  '/activate',
  authen,
  author([Role.Admin]),
  async (req, res, next) => {
    try {
      const payload = roomIdSchema.parse(req.body);
      const coll = (await connection).db().collection(Collections.ROOM);
      const room = await coll.findOne({ _id: new ObjectId(payload.roomId) });
      if (!room)
        return res
          .status(400)
          .send(`Không tìm thấy phòng với id ${payload.roomId}`);

      if (room.active === true)
        return res.status(400).send(`Phòng vẫn đang hoạt động!`);

      const result = await coll.updateOne(
        { _id: new ObjectId(payload.roomId) },
        { $set: { active: true } }
      );

      return res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
