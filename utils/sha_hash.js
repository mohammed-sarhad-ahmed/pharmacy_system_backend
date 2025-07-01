const crypto = require('crypto');

module.exports = function (code) {
  return crypto.createHash('sha256').update(code).digest('hex');
};
