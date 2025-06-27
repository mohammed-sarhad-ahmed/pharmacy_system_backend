const fs = require('fs').promises;
const mjml = require('mjml');

async function renderTemplateAsync(templatePath, data) {
  let template = await fs.readFile(templatePath, 'utf8');

  // eslint-disable-next-line guard-for-in
  for (const key in data) {
    template = template.replace(new RegExp(`{{${key}}}`, 'g'), data[key]);
  }

  const { html, errors } = mjml(template);
  if (errors.length) {
    console.error('MJML errors:', errors);
  }

  return html;
}

module.exports = renderTemplateAsync;
