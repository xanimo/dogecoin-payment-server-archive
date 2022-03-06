const express = require('express')
const logger = require('#logging')
const CloseMessage = require('./message')
const db = require('../../database')
const { createPayToHash, pubkeyToAddress } = require('../../utils/address')
const networks = require('../../networks')
const state = require('../../paymentchannel/state')
const { signPaymentChannelTx } = require('../../paymentchannel/util')
const rpc = require('../../utils/rpc')

const router = express.Router()

// Close the opened payment channel
router.post('/', async (req, res) => {
  logger.info('/close called')

  const closeMessage = CloseMessage.fromObject(req.body)

  const p2sh = createPayToHash(closeMessage.redeemScript)
  const address = pubkeyToAddress(p2sh.hashScript, networks.regtest.scriptHash, true)

  const pc = await db.getPaymentChannel(address)

  logger.info(JSON.stringify(pc))

  // No payment channel found
  if (pc === null) {
    throw new Error('No payment channel found.')
  }

  if (pc.state === state.Announced) {
    throw new Error('Payment channel announced but never opened.')
  }

  if (pc.state === state.Opened) {
    logger.info('Opened')

    if (pc.transactions.length > 0) {
      let latestTx = pc.transactions[0]
      for (const tx of pc.transactions) {
        logger.info(JSON.stringify(tx))
        if (tx.timestamps > latestTx.timestamps) {
          latestTx = tx
        }
      }

      let tx = Buffer.from(latestTx.tx, 'hex')
      const privkey = Buffer.from(process.env.PRIVATE_KEY, 'hex')
      const payerSignature = Buffer.from(latestTx.signature, 'hex')
      tx = signPaymentChannelTx(tx, payerSignature, closeMessage.redeemScript, privkey)

      const result = await rpc.sendrawtransaction(tx.toString('hex'))

      // 004830450221009aafc123f54f0e8eb8ba36a3f20bfe29649c752d5d0cb99635826c172cdbe3e90220120f281a659c71eef51e72b34fa60268665c027cb186afc524f5d4c3606725f00147304402206ff079d9746421b41d61edc9796b0cf32269409a3eea3ee49faed3309fe4523802205e659008b80b16c5ee4f4019b9edfc20df40ca0324b60c9c0baaae9ce2bcf92c01007263021f00b175210334730236ca5c2f781965c072501e73d84d8948b35f4ea3ea42e1d898466cb1e7ad675268210334730236ca5c2f781965c072501e73d84d8948b35f4ea3ea42e1d898466cb1e721023ab50de3fd251fb4808cd7137a60692c4be9cdac54f7a43cc226ffd5bfa0b9c752ae
      // 0047304402205eaa4cfc205b8c4710337a46c5633d637914d57b62ca55a220e7cb772101bbe7022005ff8619f44bdf00fa4ea488a8867ec10fc6545c97b4698eaa857195762c4e4d0147304402203df7fb640e689f9b68fd567d582930d7d66748fc7957c7848ae63c34c06d47ed02203e4ad00b0688519e663e3fa0a74035d273df0a3232a32a5ae438b36340a186ea01004c7263021200b1752102695c71925215f8a23d9880fc52811c77aac00a259876046c8ad92731d8c2c172ad6752682102695c71925215f8a23d9880fc52811c77aac00a259876046c8ad92731d8c2c17221033018856019108336a67b29f4cf9612b9b83953a92a5ef8472b6822f78d85047752ae

      logger.info(JSON.stringify(result))
      res.send()
    }

    logger.info('We dont have a transaction to sign and broadcast')
  }

  res.send()
})

module.exports = router
