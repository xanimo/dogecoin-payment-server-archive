const express = require('express')
const db = require('../database')

const router = express.Router()

router.use('/', function (req, res) {
  db.getAllPaymentChannels()
    .then(function (paymentchannels) {
      let body = ''
      for (const pc of paymentchannels) {
        console.log(pc)
        const amount = 0
        for (const transaction of pc.transactions) {
          console.log(transaction)
        }
        body += `${pc.address} -> ${amount}\n`
      }

      res.send(body)
    })
})

module.exports = router
