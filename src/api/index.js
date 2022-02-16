const express = require('express')

const announce = require('./announce')
const payment = require('./payment')
const pubkey = require('./pubkey')
const notification = require('./notification')

const router = express.Router()

router.use(express.json())

router.use('/notification', notification)
router.use('/announce', announce)
router.use('/payment', payment)
router.use('/pubkey', pubkey)

// Error handler
router.use(function (err, req, res, next) {
  // Should be 200 unless err.statusCode or err.status
  // see http://expressjs.com/en/guide/error-handling.html
  res.status(err.status)
  res.json({
    message: err.message,
    code: err.code || null
  })
})

module.exports = router
