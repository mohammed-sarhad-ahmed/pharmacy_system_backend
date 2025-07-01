const fs = require('fs').promises;
const mjml = require('mjml');
const path = require('path');

async function renderTemplateAsync(templateName, data) {
  const filePath = path.join(__dirname, '..', 'emails', `${templateName}.mjml`);
  let template = await fs.readFile(filePath, 'utf-8');

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
