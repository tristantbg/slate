const fs = require('fs');
const path = require('path');
const parse = require('./parser');

module.exports = function(content) {
  this.cacheable();

  const matches = content.match(/{% +component +'(.+?)'(, +?.*?) *%}/);

  if (matches === null) {
    return content;
  }

  const componentName = matches[1];
  const componentPath = path.resolve(
    `src/components/${componentName}.component.liquid`
  );

  const componentContent = fs.readFileSync(componentPath, 'utf-8');

  const parts = parse(
    componentContent,
    componentName,
    this.sourceMap,
    componentPath,
    false
  );

  console.log(parts);

  return content;
};
