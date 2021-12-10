const express = require('express');
const { Psbt } = require('bitcoinjs-lib');
const networks = require('../networks');
const { get } = require('../db');

const { PaymentMessage, PaymentMessageType } = require('./models/payment');
const { PaymentService } = require('../services/paymentservice');

const router = express.Router();
const pmtService = new PaymentService(networks.regtest, 1199);

router.post('/', (req, res) => {
  const keyPairB = get(process.env.PUBLIC_KEY);
  // check syntax of payment message we received
  const paymsg = PaymentMessage.fromObject(req.body);
  const syntaxVdn = paymsg.validate();
  if (!syntaxVdn.isOk()) {
    return res.status(400).send(syntaxVdn.toResponseObject());
  }

  // currently we only implement announcements
  if (paymsg.type !== PaymentMessageType.ANNOUNCE) {
    return res.status(402).send({
      status: 'error',
      errors: [`not implemented:${paymsg.type}`]
    });
  }

  // handle announcement
  const psbtVdn = pmtService.checkPSBT(keyPairB.publicKey, paymsg.psbt);
  const psbt = Psbt.fromHex(req.body.psbt);
  psbt.signInput(0, keyPairB);
  return res.status(psbtVdn.isOk() ? 200 : 400).send(psbtVdn.toResponseObject());
});

router.post('/sign', (req, res) => {
  const keyPairB = get(process.env.PUBLIC_KEY);
  // check syntax of payment message we received
  const paymsg = PaymentMessage.fromObject(req.body);
  const syntaxVdn = paymsg.validate();
  if (!syntaxVdn.isOk()) {
    return res.status(400).send(syntaxVdn.toResponseObject());
  }

  // currently we only implement announcements
  if (paymsg.type !== PaymentMessageType.ANNOUNCE) {
    return res.status(402).send({
      status: 'error',
      errors: [`not implemented:${paymsg.type}`]
    });
  }

  // handle announcement
  const psbtVdn = pmtService.checkPSBT(keyPairB.publicKey, paymsg.psbt);
  const psbt = Psbt.fromHex(req.body.psbt);
  psbt.signInput(0, keyPairB);
  return res.status(psbtVdn.isOk() ? 200 : 400).send(psbtVdn.toResponseObject());
});

module.exports = router;
