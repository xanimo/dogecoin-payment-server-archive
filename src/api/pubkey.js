const express = require('express');
const { initKeyPair } = require('../util');
const { set, get }= require('../db')
const router = express.Router();

// Return pubkey to the person initiating the payment channel (Alice) so they can create the proper redeemscript
router.get('/new', (req, res) => {
  const keyPair = initKeyPair(process.env.PRIVATE_KEY)
  // console.log('pubkey: ', keyPair)
  process.env.PUBLIC_KEY = keyPair.publicKey
  set(process.env.PUBLIC_KEY, keyPair)
  let val = get(process.env.PUBLIC_KEY)
  // console.log('val: ', val)
  console.log(Buffer.compare(val.publicKey, keyPair.publicKey))
  return res.send({
    pubkey: keyPair.publicKey.toString('hex')
  })
});

module.exports = router;
