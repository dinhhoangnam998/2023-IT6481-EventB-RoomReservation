const { z } = require('zod');

const Role = {
  Admin: 'Admin',
  Director: 'Director',
  Secretary: 'Secretary',
  Staff: 'Staff',
};

const RoleEnum = z.enum(['Admin', 'Director', 'Secretary', 'Staff']);
module.exports = { Role, RoleEnum };
