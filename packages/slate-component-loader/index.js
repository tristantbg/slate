const fs = require('fs');
const path = require('path');
const parse = require('./parser');

const regex = /\{%\s*component '(.*?)',?\s?(.*?)%\}/g

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

function componentInjector(match, componentName, attributes, offset, string) {
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

  //TODO => also inject the {% assign %} for each liquid attribute
  //   foreach attribute, do the following
  //   1. assign old_var the current variable
  //   2. assign the value to var
  //   3. render the components
  //   4. assign var the value of old_var
  console.log(parts)

  return parts;
}

module.exports = function(content) {
  this.cacheable();

  return content.replace(regex, componentInjector);
};
