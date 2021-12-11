const {
  payments, Psbt, script, Transaction
} = require('bitcoinjs-lib');
const bip65 = require('bip65');

const jsonReader = (json) => require(`./fixtures/${json}`);

// eslint-disable-next-line no-unused-vars
const fromHex = (x) => {
  const hex = x.toString();
  let str = '';
  for (let n = 0; n < hex.length; n += 2) {
    str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
  }
  return str;
};

function getBinarySize(string) {
  return Buffer.byteLength(string, 'utf8');
}

const decodeTransaction = (tx) => {
  getBinarySize(tx);
  Transaction.fromHex(tx.slice(16));
  return tx;
};

const encodeLocktime = (n) => {
  n = n ? 300 : 0;
  return Buffer.from(bip65.encode({ blocks: n }).toString(16), 'hex').reverse().toString('hex');
};

const constructRS = (customer, merchant, locktime) => {
  const encodedLocktime = encodeLocktime(locktime);
  return script.fromASM(`OP_IF ${encodedLocktime}00 OP_CHECKLOCKTIMEVERIFY OP_DROP ${
    customer.publicKey.toString('hex')} OP_CHECKSIGVERIFY OP_ELSE OP_2 OP_ENDIF ${
    customer.publicKey.toString('hex')} ${merchant.publicKey.toString('hex')} OP_2 OP_CHECKMULTISIG`);
};

// simply mine into the p2sh with a coinbase tx
function createFundingTx(targetRedeemscript, amount) {
  const tx = new Transaction();

  // coinbase input
  tx.addInput(Buffer.alloc(32).fill(0x00), 0xffffffff);

  // create a p2sh script from the redeemScript
  const target = payments.p2sh({ redeem: { output: targetRedeemscript } });

  // p2sh output
  tx.addOutput(target.output, amount);

  return tx;
}

function generatePsbt(customerKey, fundingTx, redeemScript) {
  const psbt = new Psbt();

  psbt.addInput({
    hash: fundingTx.getHash(),
    index: 0,
    nonWitnessUtxo: fundingTx.toBuffer(),
    redeemScript,
  });
  return psbt;
}

module.exports = {
  jsonReader,
  decodeTransaction,
  constructRS,
  createFundingTx,
  encodeLocktime,
  fromHex,
  generatePsbt,
};
