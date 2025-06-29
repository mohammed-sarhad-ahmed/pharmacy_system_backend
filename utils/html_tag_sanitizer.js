const sanitizeHtml = require('sanitize-html');

function htmlTagSanitizer(obj) {
  if (typeof obj === 'string') {
    return sanitizeHtml(obj, {
      allowedTags: [],
      allowedAttributes: {}
    });
  }
  if (Array.isArray(obj)) {
    return obj.map(htmlTagSanitizer);
  }
  if (typeof obj === 'object' && obj !== null) {
    const cleanObj = {};
    for (const key in obj) {
      cleanObj[key] = htmlTagSanitizer(obj[key]);
    }
    return cleanObj;
  }
  return obj;
}

module.exports = htmlTagSanitizer;
