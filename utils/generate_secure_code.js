const crypto = require('crypto');

function generateSecureCode(length = 6) {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < length; i += 1) {
    const index = crypto.randomInt(0, letters.length);
    code += letters[index];
  }
  return code;
}

module.exports = generateSecureCode;
