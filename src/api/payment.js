const networks = require('../networks');
const express = require('express');
const { get } = require('../db');
const { jsonRPC } = require('../util');

const { PaymentMessage, PaymentMessageType } = require('./models/payment');
const { PaymentService } = require('../services/paymentservice');
const { Psbt } = require('bitcoinjs-lib');

const router = express.Router();
const pmtService = new PaymentService(networks.regtest, 1199);

router.post('/', (req, res) => {
  console.log('payment process.env.PUBLIC_KEY: ', process.env.PUBLIC_KEY)
  const keyPairB = get(process.env.PUBLIC_KEY)
  console.log('db pubkey: ', keyPairB.publicKey)
  // check syntax of payment message we received
  const paymsg = PaymentMessage.fromObject(req.body);
  const syntaxVdn = paymsg.validate();
  if (!syntaxVdn.isOk()) {
    return res.status(400).send(syntaxVdn.toResponseObject())
  }

  // currently we only implement announcements
  if (paymsg.type !== PaymentMessageType.ANNOUNCE) {
    return res.status(402).send({
      status: "error",
      errors: ["not implemented:" + paymsg.type]
    });
  }

  // handle announcement
  const psbtVdn = pmtService.checkPSBT(keyPairB.publicKey, paymsg.psbt);
  // const fundVdn = pmtService.checkFunding();
  // const signVdn = pmtService.checkSignature();
  // console.log('fundVdn: ', fundVdn.isOk())
  // console.log('signVdn: ', signVdn.isOk())
  const psbt = Psbt.fromHex(req.body.psbt)
  psbt.signInput(0, keyPairB)
  return res.status(psbtVdn.isOk() ? 200 : 400).send({
    psbtVdn: psbtVdn.toResponseObject(),
    psbt: psbt.toHex()
  });
});

module.exports = router;
