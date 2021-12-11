/* eslint-disable no-shadow */
/* eslint-disable class-methods-use-this */
/* eslint-disable eqeqeq */
const assert = require('assert');
const {
  Psbt, script, payments, Transaction
} = require('bitcoinjs-lib');

const { Validator } = require('../validation');

/** Helper lambda to check public key hex in scripts */
const checkKey = (key) => {
  let flag = false; const
    k = Buffer.from(key, 'hex');
  flag = k.length === 33;
  flag = script.isCanonicalPubKey(k);
  return flag;
};

/** Array of stack element check lambdas,
 *  to make sure we got the redeemscript we expected.
 */
// TODO: THIS IS UGLY! We may be able to use some internal functions of
//      BitcoinJS.script instead...
const RS_STRUCTURE = [
  (op) => op === 99,
  (num) => parseInt(num.toString('hex'), 10),
  (op) => op === 177,
  (op) => op === 117,
  checkKey,
  (op) => op === 173,
  (op) => op === 103,
  (op) => op === 82,
  (op) => op === 104,
  checkKey,
  checkKey,
  (op) => op === 82,
  (op) => op === 174
];
/** Service that performs all payment related work
 *
 *  Note: this is meant to run as a singleton inside the controller
 *        so do not add request-specific information to the constructor,
 *        instead, pass those to the methods.
 */
class PaymentService {
  constructor(network, minChannelExpiry) {
    this.network = network;
    this.minChannelExpiry = minChannelExpiry;
  }

  /** Validate a PSBT against syntax and semantic checks */
  checkPSBT(publicKey, psbtHex) {
    const validator = new Validator();

    /// SYNTACTIC VALIDATION ///

    // parse and assert requirements on the PSBT
    let psbt;
    try {
      psbt = Psbt.fromHex(psbtHex);
      assert(typeof psbt.data === 'object');
      assert(Array.isArray(psbt.data.inputs));
      assert(psbt.data.inputs.length > 0);
    } catch (e) {
      validator.caught(e);
      return validator.result;
    }

    // parse the redeemscript
    let rsOPS;
    try {
      rsOPS = script.decompile(psbt.data.inputs[0].redeemScript);
    } catch (e) {
      validator.caught(e);
      return validator.result;
    }

    RS_STRUCTURE.forEach((chk, i) => {
      validator.test(rsOPS[i], chk, `Malformed redeemscript at position ${i}`);
    });

    // if there are syntax errors in the script, return here, because there
    // is no reason to continue (p2sh will fail, semantic validation will fail).
    if (!validator.result.isOk()) { return validator.result; }

    // check p2sh address
    let p2sh;
    try {
      p2sh = payments.p2sh({
        redeem: { output: psbt.data.inputs[0].redeemScript },
        network: this.network
      });
    } catch (e) {
      validator.caught(e);
      return validator.result;
    }

    /// END OF SYNTACTIC VALIDATION ///

    ///     -------------------     ///
    ///     SEMANTIC VALIDATION    ///
    ///     -------------------     ///

    // check expiry
    // TODO: make this relative to the current block...
    //      ... this will probably make this function async
    validator.test(rsOPS[1], (lt) => parseInt(lt.toString('hex'), 10) > this.minChannelExpiry,
      `locktime needs to be greater than ${this.minChannelExpiry}`);

    // check the keys
    const keys = {
      us: publicKey,
      them: rsOPS[4],
      both: rsOPS.slice(9, 11)
    };
    validator.test(keys, (keys) => keys.them != keys.us,
      'our key must not be part of the CLTV clause');
    validator.test(keys, (keys) => Buffer.compare(keys.them, keys.both[0]) == 0,
      'their key must be part of the multisig clause');
    validator.test(keys, (keys) => Buffer.compare(keys.us, keys.both[1]) == 0,
      'our key must be part of the multisig clause');
    // TODO: check p2sh to be funded with the txHex
    // eslint-disable-next-line max-len
    validator.test(p2sh, (p2sh) => Buffer.compare(p2sh.redeem.output, psbt.data.inputs[0].redeemScript) == 0,
      'p2sh redeem script must match psbt input redeem script');
    validator.test(psbt, (psbt) => Transaction.fromHex(psbt.data.inputs[0].nonWitnessUtxo.toString('hex')).outs[0].value > 0,
      'transaction amount must be greater than 0');

    return validator.result;
  }

  /** Check the funding of a tx through our blocksource */
  async checkFunding(minConfirms, expiresAt, txid, txHex, p2sh) {
    const validator = new Validator();
    console.log(expiresAt);
    console.log(txid);
    console.log(txHex);
    console.log(p2sh);
    // TODO: confirm block height on the blockchain
    validator.test(minConfirms, minConfirms >= 1);
    // TODO: check confirmations
    // TODO: check not expired

    return validator.result;
  }

  /** check the counterparty signature on a psbt */
  checkSignature(psbtIn) {
    const validator = new Validator();
    // //TODO: extract counterparty pubkey from psbt redeemscript
    const psbt = Psbt.fromHex(psbtIn.data.toHex());
    // //TODO: for each input, check that the signature for the pubkey matches
    psbt.data.inputs.map((v, k) => {
      if (v) {
        const rs = script.decompile(v.redeemScript);
        const customerKey = Buffer.compare(rs[4], rs[9]) ? '' : rs[4];
        validator.test(psbt, psbt.validateSignaturesOfInput(k, customerKey));
      }
      return v;
    });
    return validator.result;
  }
}

module.exports = { PaymentService };
