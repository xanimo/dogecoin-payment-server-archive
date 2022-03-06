const { sign, decodeTx, prepareTransactionToSign, encodeRawTransaction } = require('../utils/tx')
const { doubleHash } = require('../utils/hash')
const CompactSize = require('../utils/compactSize')
const { createPayToHash } = require('../utils/address')

function signPaymentChannelTx (rawtx, payerSignature, redeemScript, privkey) {
  let tx = decodeTx(rawtx)

  // Probably not redeem script but p2sh
  tx.txIns[0].signature = createPayToHash(redeemScript).script
  console.log(tx)

  tx.hashCodeType = 1
  const rawTx = prepareTransactionToSign(tx, 0)
  const message = doubleHash(rawTx)
  const signature = sign(message, privkey)

  delete tx.hashCodeType

  const sizeRedeemScript = CompactSize.fromSize(redeemScript.length)
  const sizeSigPayee = CompactSize.fromSize(payerSignature.length + 1)
  const sizeSigPayer = CompactSize.fromSize(signature.length + 1)

  // need to build sig script
  // Do we need to know the order of the pubkey ?
  const sigScript = Buffer.from('00' +
    sizeSigPayee.toString('hex') +
    payerSignature.toString('hex') +
    '01' +
    sizeSigPayer.toString('hex') +
    signature.toString('hex') +
    '01' +
    '00' +
    '4c' +
    sizeRedeemScript.toString('hex') +
    redeemScript.toStringt('hex'),
  'hex')

  tx.txIns[0].signature = sigScript
  tx.txIns[0].signatureSize = CompactSize.fromSize(sigScript.length)

  console.log(sigScript.toString('hex'))
  tx = encodeRawTransaction(tx)

  return tx
}

module.exports = { signPaymentChannelTx }
