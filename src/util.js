const axios = require('axios');
const bitcoinjs = require('bitcoinjs-lib');
const {
  payments, Psbt, script, Transaction
} = require('bitcoinjs-lib');
const bip65 = require('bip65');
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

function fromHex(x) {
  const hex = x.toString();
  let str = '';
  for (let n = 0; n < hex.length; n += 2) {
    str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
  }
  return str;
}

function getBinarySize(string) {
  return Buffer.byteLength(string, 'utf8');
}

function decodeTransaction(tx) {
  getBinarySize(tx);
  Transaction.fromHex(tx.slice(16));
  return tx;
}

function encodeLocktime(n) {
  n = n ? 300 : 0;
  return Buffer.from(bip65.encode({ blocks: n }).toString(16), 'hex').reverse().toString('hex');
}

function constructRS(customer, merchant, locktime) {
  const encodedLocktime = encodeLocktime(locktime);
  return script.fromASM(`OP_IF ${encodedLocktime}00 OP_CHECKLOCKTIMEVERIFY OP_DROP ${customer.publicKey.toString('hex')} OP_CHECKSIGVERIFY OP_ELSE OP_2 OP_ENDIF ${customer.publicKey.toString('hex')} ${merchant.publicKey.toString('hex')} OP_2 OP_CHECKMULTISIG`);
}

// simply mine into the p2sh with a coinbase tx
function createFundingTx(targetRedeemscript, amount) {
  const tx = new Transaction();
  // coinbase input
  tx.addInput(Buffer.alloc(32).fill(0x00), 0xffffffff);
  // create a p2sh script from the redeemScript
  const target = payments.p2sh({ redeem: { output: targetRedeemscript } });
  // p2sh output
  tx.addOutput(target.output, amount);
  return tx;
}

function generatePsbt(customerKey, fundingTx, redeemScript) {
  const psbt = new Psbt();
  psbt.addInput({
    hash: fundingTx.getHash(),
    index: 0,
    nonWitnessUtxo: fundingTx.toBuffer(),
    redeemScript,
  });
  return psbt;
}

const jsonReader = (json) => require(`../test/fixtures/${json}`);

module.exports = {
  checkDogecoinNode,
  checkConfig,
  constructRS,
  createFundingTx,
  decodeTransaction,
  encodeLocktime,
  fromHex,
  generatePsbt,
  initKeyPair,
  jsonReader,
  jsonRPC,
};
