module.exports = (phoneNumber) => {
  phoneNumber = phoneNumber.replace(/^0/gim, '');
  return `+964${phoneNumber}`;
};
