const { script } = require('bitcoinjs-lib')
const { 
  MissingFieldError,
  MalformedRedeemScriptError,
  WrongKeyInCLTVError,
  TheirKeyNotInMultisigError,
  OurKeyNotInMultisigError,
  BadLocktimeError
} = require('./error')

const MIN_CHANNEL_EXPIRY = 0

/** Helper lambda to check public key hex in scripts */
const checkKeyLength = (key) => Buffer.from(key, "hex").length === 33


/** Array of stack element check lambdas,
 *  to make sure we got the redeemscript we expected.
 */
//TODO: THIS IS UGLY! We may be able to use some internal functions of
//      BitcoinJS.script instead...
const RS_STRUCTURE = [
  op => op === "OP_IF",
  num => parseInt(num, 10) > 0,
  op => op === "OP_CHECKLOCKTIMEVERIFY",
  op => op === "OP_DROP",
  checkKeyLength,
  op => op === "OP_CHECKSIGVERIFY",
  op => op === "OP_ELSE",
  op => op === "OP_2",
  op => op === "OP_ENDIF",
  checkKeyLength,
  checkKeyLength,
  op => op === "OP_2",
  op => op === "OP_CHECKMULTISIG"
];


class AnnounceMessage {

  constructor(redeemScript) {
    this.redeemScript = redeemScript
  }

  /*
      Construct an AnnounceMessage from object
  */
  static fromObject(args) {
    if (!args.hasOwnProperty('redeemScript')) {
      throw new MissingFieldError('redeemScript')
    }
    const redeemScript = Buffer.from(args.redeemScript, 'hex')

    return new this(redeemScript)
  }

  /*
      Validate that the redeem script contains the public key given
  */
  validate(pubkey) {
    const rsASM = script.toASM(this.redeemScript).split(" ")

    // strict redeemscript syntax check to our format
    RS_STRUCTURE.forEach((chk, i) => {
      if (!chk(rsASM[i])) {
        throw new MalformedRedeemScriptError(i)
      }
    });

    // check the keys
    const keys = {
      us: pubkey,
      them: rsASM[4],
      both: rsASM.slice(9, 11)
    }

    if (keys.them === keys.us) {
      throw new WrongKeyInCLTVError()
    }
    if (keys.both.indexOf(keys.them) === -1) {
      throw new TheirKeyNotInMultisigError()
    }
    if (keys.both.indexOf(keys.us) === -1) {
      throw new OurKeyNotInMultisigError()
    }

    // check expiry
    //TODO: make this relative to the current block...
    //      ... this will probably make this function async
    if (parseInt(rsASM[1], 10) < MIN_CHANNEL_EXPIRY) {
      throw new BadLocktimeError(MIN_CHANNEL_EXPIRY)
    }

  }
}

module.exports = AnnounceMessage;
