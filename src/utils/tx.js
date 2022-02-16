

function decodeTx(payload) {
  const tx = {}
  let offset = 0

  tx.id = doubleHash(payload).toString('hex')

  tx.version = payload.readUInt32LE(offset)
  offset += 4

  let compactSize = CompactSize.fromBuffer(payload, offset)
  offset += compactSize.offset

  tx.txInCount = compactSize.size

  tx.txIns = []
  for (let i = 0; i < tx.txInCount; i++) {
    const txIn = {}

    txIn.previousOutput = {}

    txIn.previousOutput.hash = payload.slice(offset, offset + 32).toString('hex')
    offset += 32

    txIn.previousOutput.index = payload.slice(offset, offset + 4).toString('hex')
    offset += 4

    if (txIn.previousOutput.hash === '0000000000000000000000000000000000000000000000000000000000000000') {
      // Coinbase txIn !!!!!!!!
      compactSize = CompactSize.fromBuffer(payload, offset)
      offset += compactSize.offset

      txIn.script = payload.slice(offset, offset + compactSize.size).toString('hex')
      offset += compactSize.size

      txIn.sequence = payload.readUInt32LE(offset)
      offset += 4
    } else {
      // NOT Coinbase txIn !!!!!!!!
      compactSize = CompactSize.fromBuffer(payload, offset)
      offset += compactSize.offset

      txIn.signature = payload.slice(offset, offset + compactSize.size).toString('hex')
      offset += compactSize.size

      txIn.sequence = payload.readUInt32LE(offset)
      offset += 4
    }

    tx.txIns.push(txIn)
  }

  compactSize = CompactSize.fromBuffer(payload, offset)
  offset += compactSize.offset
  tx.txOutCount = compactSize.size

  tx.txOuts = []
  for (let j = 0; j < tx.txOutCount; j++) {
    const txOut = {}

    txOut.value = payload.readBigUInt64LE(offset)
    offset += 8

    compactSize = CompactSize.fromBuffer(payload, offset)
    offset += compactSize.offset

    txOut.pkScriptSize = compactSize.size

    txOut.pkScript = payload.slice(offset, offset + txOut.pkScriptSize)
    offset += compactSize.size

    tx.txOuts.push(txOut)
  }

  tx.locktime = payload.readUInt32LE(offset)
  offset += 4

  tx.size = offset

  return tx
}