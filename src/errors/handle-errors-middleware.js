const { BaseError } = require("./errors");

function handleError(err, req, res, next) {
  if (err instanceof BaseError) {
    return res.status(err.statusCode || 500).json(err.message);
  }
  // other error
  console.error(err);
  return res.status(500).json(err.toString());
}

module.exports = { handleError };
