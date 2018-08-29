const path = require('path');

module.exports = class SlateConfig {
  constructor(schema) {
    this.schema = schema;
    this.userConfig = this._getSlateConfig();
  }

  set(key, value, override = false) {
    if (typeof this.config[key] !== 'undefined' && !override) {
      throw new Error(
        `[slate-config]: A value for '${key}' has already been set. A value can only be set once.`,
      );
    } else {
      this.config[key] =
        typeof this.userConfig[key] !== 'undefined'
          ? this.userConfig[key]
          : value;
    }
  }

  get(key) {
    const value = this.schema[key];

    if (typeof value === 'function') {
      return value(this);
    } else if (typeof value === 'undefined') {
      throw new Error(
        `[slate-config]: A value has not been defined for the key '${key}'`,
      );
    } else {
      return value;
    }
  }

  _getSlateConfig() {
    try {
      return require(path.join(process.cwd, 'slate.config.js'));
    } catch (error) {
      return {};
    }
  }
};
