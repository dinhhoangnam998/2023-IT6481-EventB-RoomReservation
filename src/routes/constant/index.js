const { z } = require('zod');

const States = z.enum([
  'Requested',
  'Accepted',
  'Declined',
  'Reserved',
  'Denied',
]);

module.exports = {States}