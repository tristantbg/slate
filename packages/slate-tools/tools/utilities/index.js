const path = require('path');
const {existsSync, readFileSync} = require('fs');
const SlateConfig = require('@shopify/slate-config');
const config = new SlateConfig(require('../../slate-tools.schema'));

function sslKeyCert() {
  const key = readFileSync(getSSLKeyPath());
  const cert = readFileSync(getSSLCertPath());

  return {key, cert};
}

function getSSLKeyPath() {
  return existsSync(config.get('ssl.key'))
    ? config.get('ssl.key')
    : path.join(__dirname, './server.pem');
}

function getSSLCertPath() {
  return existsSync(config.get('ssl.cert'))
    ? config.get('ssl.cert')
    : path.join(__dirname, './server.pem');
}

module.exports = {sslKeyCert, getSSLKeyPath, getSSLCertPath};
