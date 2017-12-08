const fs = require('fs');
const path = require('path');
const parse = require('./parser');

function findComponentDeclarations(source) {
  const regex = /\{%\s*component '(.*?)',?\s?(.*?)%\}/g;
  const matches = [];
  let match;

  while ((match = regex.exec(source)) !== null) {
    // This is necessary to avoid infinite loops with zero-width matches
    if (match.index === regex.lastIndex) {
      regex.lastIndex++;
    }

    if (match[1]) {
      matches.push({
        fullMatch: match[0],
        componentName: match[1],
        getComponentProperties(match[2]),
      });
    }
  }

  return matches;
}

function getComponentProperties(propertiesString) {
  if (!!propertiesString) {
    return [];
  }

  return propertiesString.split(',').map(keyValue => {
    return {
      key: keyValue.split(':')[0],
      value: keyValue
        .split(':')[1]
        .replace(/'/g, '')
        .trim(),
    };
  });
}

module.exports = function(content) {
  this.cacheable();

  const components = findComponentDeclarations(content);

  if (components.length <= 0) {
    return content;
  }

  components.forEach(component => {
    const componentName = component.componentName;
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
  });

  return content;
};
