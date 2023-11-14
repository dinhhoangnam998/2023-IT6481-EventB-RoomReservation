const jwt = require('jsonwebtoken');

function authen(req, res, next) {
  console.log(req.headers['authorization'])
  if (!req.headers['authorization'])
    return res
      .status(401)
      .send('Access Denied. Authorization header is required!');
  const token = req.headers['authorization'].split(' ')[1];
  if (!token)
    return res
      .status(401)
      .send(
        'Access Denied. Check your Authorization header format! (Bearer token)'
      );
  try {
    const verified = jwt.verify(token, process.env.JWT_TOKEN_SECRET);
    req.user = verified;
    console.log({user: verified, path: req.originalUrl});
    next();
  } catch (err) {
    next(err);
  }
}

function author(roles) {
  return function (req, res, next) {
    if (!roles.includes(req.user.role))
      return res.status(403).send('Forbidden!');
    next();
  };
}

module.exports = { authen, author };
