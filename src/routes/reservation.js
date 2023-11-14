const express = require('express');
const router = express.Router();
const { z } = require('zod');
const { Role } = require('./access-control/role');
const { connection, Collections } = require('../../db');
const { authen, author } = require('./access-control/protect-middleware');
const { ObjectId } = require('mongodb');
const { States } = require('./constant');

const reservationSchema = z
  .object({
    roomId: z.string(),
    startTime: z.number().int(),
    endTime: z.number().int(),
  })
  .refine((data) => data.startTime < data.endTime, {
    message: 'Thời gian kết thúc phải muộn hơn thời gian bắt đầu!',
  });

const reservationIdSchema = z.object({
  reservationId: z.string(),
});

router.post('/', authen, async (req, res, next) => {
  try {
    const payload = reservationSchema.parse(req.body);
    // check if room exists
    const roomColl = (await connection).db().collection(Collections.ROOM);
    const room = await roomColl.findOne({
      _id: new ObjectId(payload.roomId),
    });
    if (!room) {
      return res
        .status(400)
        .json(`Phòng với id ${payload.roomId} không tồn tại!`);
    }
    // check room active state
    if (room.active === false) {
      return res.status(400).json(`Phòng này đang dừng hoạt đông!`);
    }

    const coll = (await connection).db().collection(Collections.RESERVATION);
    const result = await coll.insertOne({
      ...payload,
      room,
      state: States.enum.Requested,
    });
    return res.json({ insertedId: result.insertedId });
  } catch (error) {
    next(error);
  }
});

router.get('/', authen, async (req, res, next) => {
  try {
    const coll = (await connection).db().collection(Collections.RESERVATION);
    const docs = await coll.find({}).toArray();
    return res.json(docs);
  } catch (error) {
    next(error);
  }
});

router.patch(
  '/accept',
  authen,
  author([Role.Director]),
  async (req, res, next) => {
    try {
      const payload = reservationIdSchema.parse(req.body);
      const rid = payload.reservationId;
      const coll = (await connection).db().collection(Collections.RESERVATION);
      // check rid exists
      const reservation = await coll.findOne({ _id: new ObjectId(rid) });
      if (!reservation)
        return res.status(400).send(`Đơn đăng ký với id: ${rid} không tồn tại`);
      // check status
      if (reservation.state !== States.enum.Requested)
        return res.status(400).send('Trạng thái đơn không phù hợp để xử lý!');

      const result = await coll.updateOne(
        { _id: new ObjectId(rid) },
        { $set: { state: States.enum.Accepted } }
      );
      return res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  '/decline',
  authen,
  author([Role.Director]),
  async (req, res, next) => {
    try {
      const payload = reservationIdSchema.parse(req.body);
      const rid = payload.reservationId;
      const coll = (await connection).db().collection(Collections.RESERVATION);
      // check rid exists
      const reservation = await coll.findOne({ _id: new ObjectId(rid) });
      if (!reservation)
        return res.status(400).send(`Đơn đăng ký với id: ${rid} không tồn tại`);
      // check status
      if (reservation.state !== States.enum.Requested)
        return res.status(400).send('Trạng thái đơn không phù hợp để xử lý!');

      const result = await coll.updateOne(
        { _id: new ObjectId(rid) },
        { $set: { state: States.enum.Declined } }
      );
      return res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  '/reserve',
  authen,
  author([Role.Secretary]),
  async (req, res, next) => {
    try {
      const payload = reservationIdSchema.parse(req.body);
      const rid = payload.reservationId;
      const coll = (await connection).db().collection(Collections.RESERVATION);
      // check rid exists
      const reservation = await coll.findOne({ _id: new ObjectId(rid) });
      if (!reservation)
        return res.status(400).send(`Đơn đăng ký với id: ${rid} không tồn tại`);
      // check status
      if (reservation.state !== States.enum.Accepted)
        return res.status(400).send('Trạng thái đơn không phù hợp để xử lý!');

      const roomColl = (await connection).db().collection(Collections.ROOM);
      const room = await roomColl.findOne({
        _id: new ObjectId(reservation.roomId),
      });
      // check room active state
      if (room.active === false) {
        return res.status(400).json(`Phòng này đang dừng hoạt đông!`);
      }

      // check không trùng lặp
      const count = await coll.countDocuments({
        roomId: reservation.roomId,
        state: States.enum.Reserved,
        $or: [
          {
            startTime: {
              $gte: reservation.startTime,
              $lte: reservation.endTime,
            },
          },
          {
            endTime: {
              $gte: reservation.startTime,
              $lte: reservation.endTime,
            },
          },
          {
            startTime: { $lte: reservation.startTime },
            endTime: { $gte: reservation.endTime },
          },
        ],
      });

      if (count > 0) return res.status(400).send('Có sự trùng lịch!');

      const result = await coll.updateOne(
        { _id: new ObjectId(rid) },
        { $set: { state: States.enum.Reserved } }
      );
      return res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  '/deny',
  authen,
  author([Role.Secretary]),
  async (req, res, next) => {
    try {
      const payload = reservationIdSchema.parse(req.body);
      const rid = payload.reservationId;
      const coll = (await connection).db().collection(Collections.RESERVATION);
      // check rid exists
      const reservation = await coll.findOne({ _id: new ObjectId(rid) });
      if (!reservation)
        return res.status(400).send(`Đơn đăng ký với id: ${rid} không tồn tại`);
      // check status
      if (reservation.state !== States.enum.Accepted)
        return res.status(400).send('Trạng thái đơn không phù hợp để xử lý!');

      const result = await coll.updateOne(
        { _id: new ObjectId(rid) },
        { $set: { state: States.enum.Denied } }
      );
      return res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
