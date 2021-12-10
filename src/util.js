const axios = require('axios');
const bitcoinjs = require('bitcoinjs-lib');
const networks = require('./networks');

function checkConfig() {
  const config = [
    process.env.RPC_USER,
    process.env.RPC_PASSWORD,
    process.env.RPC_URL,
    process.env.RPC_PORT,
    process.env.PRIVATE_KEY
  ];
  config.map((k) => {
    if (!k) {
      throw new Error('Missing RPC environment variable');
    }
    return k;
  });
}

async function jsonRPC(command, params) {
  const token = Buffer.from(`${process.env.RPC_USER}:${process.env.RPC_PASSWORD}`, 'utf8').toString('base64');

  return axios.post(`http://${process.env.RPC_URL}:${process.env.RPC_PORT}`, {
    jsonrpc: '1.0',
    id: 'payment channel much wow',
    method: command,
    params
  }, {
    headers: {
      Authorization: `Basic ${token}`,
      'Content-Type': 'application/json'
    },
  });
}

async function checkDogecoinNode() {
  try {
    await jsonRPC('ping', []);
  } catch (err) {
    throw new Error(`Dogecoin node not reachable : ${err.message}`);
  }
}

function initKeyPair(key) {
  const keyPair = bitcoinjs.ECPair.fromPrivateKey(Buffer.from(key, 'hex'), {
    network: networks.regtest
  });
  return keyPair;
}

module.exports = {
  checkDogecoinNode,
  checkConfig,
  jsonRPC,
  initKeyPair
};
