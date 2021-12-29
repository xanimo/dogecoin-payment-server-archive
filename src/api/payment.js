const networks = require('../networks')
const express = require('express')

const PaymentMessage = require('./models/payment')
const PaymentService = require('../services/paymentservice')

const router = express.Router()
const pmtService = new PaymentService(networks.regtest)

// Should we include the ref in the url ?
// (e.g payment/123/)
router.post('/', (req, res) => {
  const paymsg = PaymentMessage.fromObject(req.body)
  pmtService.validate(paymsg)

  // If valid sign
});

module.exports = router;
