require('dotenv').config();
const express = require('express');
const router = express.Router();
const { z } = require('zod');
const { Role, RoleEnum } = require('./access-control/role');
const { authen, author } = require('./access-control/protect-middleware');

const jwt = require('jsonwebtoken');
const { connection, Collections } = require('../../db');

const userSchema = z.object({ name: z.string(), role: RoleEnum });
const loginSchema = z.object({ name: z.string() });

router.post('/login', async (req, res, next) => {
  try {
    const payload = loginSchema.parse(req.body);
    const coll = (await connection).db().collection(Collections.USER);
    const user = await coll.findOne({ name: payload.name });
    if (!user)
      return res
        .status(400)
        .send(`Không tìm thấy người dùng với tên ${payload.name}`);
    const tokenContent = {
      name: user.name,
      role: user.role,
    };
    const token = jwt.sign(tokenContent, process.env.JWT_TOKEN_SECRET);
    return res.json(token);
  } catch (error) {
    next(error);
  }
});

router.post('/', authen, author([Role.Admin]), async (req, res, next) => {
  try {
    const userPayload = userSchema.parse(req.body);
    const coll = (await connection).db().collection(Collections.USER);
    const result = await coll.insertOne(userPayload);
    return res.json({ insertedId: result.insertedId });
  } catch (error) {
    next(error);
  }
});

router.get('/', authen, author([Role.Admin]), async (req, res, next) => {
  try {
    const coll = (await connection).db().collection(Collections.USER);
    const docs = await coll.find({}).toArray();
    return res.json(docs);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
