# @shopify/slate-config

Generates configurations for Slate packages by applying values from `slate.config.js` to override default values.

An example config file from `@shopify/slate-babel`:

```js
const slateConfig = require('@shopify/slate-config');

module.exports = slateConfig.generate({
  items: [
    {
      id: 'babel.enable',
      default: true,
    },
  ],
});
```

`slate.config.js` could override the default value of `babel.enable` by declaring the following:

```js
module.exports = {
  'babel.enable': false,
};
```
