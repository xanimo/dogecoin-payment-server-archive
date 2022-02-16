const bitcoinjs = require('bitcoinjs-lib')
const bs58check = require('bs58check')
const RIPEMD160 = require('ripemd160')
const crypto = require('crypto')
const networks = require('../networks')

// TODO: create a config.js file
function checkConfig () {
  const config = [
    process.env.RPC_USER,
    process.env.RPC_PASSWORD,
    process.env.RPC_URL,
    process.env.RPC_PORT,
    process.env.PRIVATE_KEY
  ]
  config.map(k => {
    if (!k) {
      throw new Error('Missing RPC environment variable')
    }
    return true
  })
}

function initKeyPair (key) {
  const keyPair = bitcoinjs.ECPair.fromPrivateKey(Buffer.from(key, 'hex'), {
    compressed: true,
    network: networks.regtest
  })
  return keyPair
}

function pubkeyToPubkeyHash (pubkey) {
  return hashing(pubkey)
}

function pubkeyToAddress (pubkey, networkByte, hash = false) {
  let pubKeyHash = pubkey

  if (!hash) {
    pubKeyHash = pubkeyToPubkeyHash(pubkey)
  }

  networkByte = Buffer.from([networkByte])

  const temp = Buffer.concat([networkByte, pubKeyHash])

  return bs58check.encode(temp)
}

function hashing (buf) {
  let hash = crypto.createHash('sha256').update(buf).digest()
  hash = new RIPEMD160().update(hash).digest()
  return hash
}

function createPayToHash (script) {
  if (!Buffer.isBuffer(script)) {
    throw new Error('Script is expected to be a Buffer.')
  }

  const hashScript = hashing(script)

  return { script: Buffer.from('a9' + hashScript.length.toString(16) + hashScript.toString('hex') + '87', 'hex'), hashScript }
}

module.exports = {
  checkConfig,
  initKeyPair,
  createPayToHash,
  pubkeyToAddress
}
