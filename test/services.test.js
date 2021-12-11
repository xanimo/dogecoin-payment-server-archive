const assert = require('assert');
const {
  ECPair, Psbt, Transaction, script, Block
} = require('bitcoinjs-lib');
const bitauth = require('bitauth');
const networks = require('../src/networks');
const { PaymentService } = require('../src/services/paymentservice');
const { get } = require('../src/db');
const {
  jsonReader, decodeTransaction, constructRS, createFundingTx, generatePsbt
} = require('../src/util');

describe('redeem script', () => {
  const ourKey = ECPair.makeRandom({ network: networks.regtest });
  const ps = new PaymentService(networks.regtest, 1159);

  it('position 0 should eq OP_IF', (done) => {
    const customerKey = ECPair.makeRandom({ network: networks.regtest });
    const rs = constructRS(customerKey, ourKey, 300);
    const tx = createFundingTx(rs, 1337 * 1e8);
    const psbt = generatePsbt(customerKey, tx, rs);
    psbt.data.inputs[psbt.data.inputs.length - 1]
      .redeemScript = script.fromASM(
        script.toASM(
          psbt.data.inputs[psbt.data.inputs.length - 1].redeemScript
        ).split(' ').map((v) => (v !== 'OP_IF' ? v : 'OP_NOTIF')).join(' ')
      );
    const result = ps.checkPSBT(ourKey.publicKey, psbt.toHex());
    assert.equal(result.errors.join('\n'), 'Malformed redeemscript at position 0');
    done();
  });

  it('position 1 should have valid locktime', (done) => {
    const customerKey = ECPair.makeRandom({ network: networks.regtest });
    const rs = constructRS(customerKey, ourKey);
    const tx = createFundingTx(rs, 1337 * 1e8);
    const psbt = generatePsbt(customerKey, tx, rs);
    const result = ps.checkPSBT(ourKey.publicKey, psbt.toHex());
    assert.equal(result.errors.join('\n'), 'Malformed redeemscript at position 1');
    done();
  });

  it('position 2 should eq OP_CHECKLOCKTIMEVERIFY', (done) => {
    const customerKey = ECPair.makeRandom({ network: networks.regtest });
    const rs = constructRS(customerKey, ourKey, 300);
    const tx = createFundingTx(rs, 1337 * 1e8);
    const psbt = generatePsbt(customerKey, tx, rs);
    psbt.data.inputs[psbt.data.inputs.length - 1]
      .redeemScript = script.fromASM(
        script.toASM(
          psbt.data.inputs[psbt.data.inputs.length - 1].redeemScript
        ).split(' ').map((v) => (v !== 'OP_CHECKLOCKTIMEVERIFY' ? v : 'OP_NOTIF')).join(' ')
      );
    const result = ps.checkPSBT(ourKey.publicKey, psbt.toHex());
    assert.equal(result.errors.join('\n'), 'Malformed redeemscript at position 2');
    done();
  });

  it('position 3 should eq OP_DROP', (done) => {
    const customerKey = ECPair.makeRandom({ network: networks.regtest });
    const rs = constructRS(customerKey, ourKey, 300);
    const tx = createFundingTx(rs, 1337 * 1e8);
    const psbt = generatePsbt(customerKey, tx, rs);
    psbt.data.inputs[psbt.data.inputs.length - 1]
      .redeemScript = script.fromASM(
        script.toASM(
          psbt.data.inputs[psbt.data.inputs.length - 1].redeemScript
        ).split(' ').map((v) => (v !== 'OP_DROP' ? v : 'OP_DUP')).join(' ')
      );
    const result = ps.checkPSBT(ourKey.publicKey, psbt.toHex());
    assert.equal(result.errors.join('\n'), 'Malformed redeemscript at position 3');
    done();
  });

  it('position 4,9 should eq customerKey', (done) => {
    const customerKey = ECPair.makeRandom({ network: networks.regtest });
    const rs = constructRS(customerKey, ourKey, 300);
    const tx = createFundingTx(rs, 1337 * 1e8);
    const psbt = generatePsbt(customerKey, tx, rs);
    psbt.data.inputs[psbt.data.inputs.length - 1]
      .redeemScript = script.fromASM(
        script.toASM(
          psbt.data.inputs[psbt.data.inputs.length - 1].redeemScript
        ).split(' ').map((v) => (v !== customerKey.publicKey.toString('hex') ? v : ourKey.publicKey.toString('hex'))).join(' ')
      );
    const result = ps.checkPSBT(ourKey.publicKey, psbt.toHex());
    assert.equal(result.errors.join('\n'), '');
    done();
  });

  it('position 5 should eq OP_CHECKSIGVERIFY', (done) => {
    const customerKey = ECPair.makeRandom({ network: networks.regtest });
    const rs = constructRS(customerKey, ourKey, 300);
    const tx = createFundingTx(rs, 1337 * 1e8);
    const psbt = generatePsbt(customerKey, tx, rs);
    psbt.data.inputs[psbt.data.inputs.length - 1]
      .redeemScript = script.fromASM(
        script.toASM(
          psbt.data.inputs[psbt.data.inputs.length - 1].redeemScript
        ).split(' ').map((v) => (v !== 'OP_CHECKSIGVERIFY' ? v : 'OP_CHECKSIGVERIFY')).join(' ')
      );
    const result = ps.checkPSBT(ourKey.publicKey, psbt.toHex());
    assert.equal(result.errors.join('\n'), '');
    done();
  });

  it('position 6 should eq OP_ELSE', (done) => {
    const customerKey = ECPair.makeRandom({ network: networks.regtest });
    const rs = constructRS(customerKey, ourKey, 300);
    const tx = createFundingTx(rs, 1337 * 1e8);
    const psbt = generatePsbt(customerKey, tx, rs);
    psbt.data.inputs[psbt.data.inputs.length - 1]
      .redeemScript = script.fromASM(
        script.toASM(
          psbt.data.inputs[psbt.data.inputs.length - 1].redeemScript
        ).split(' ').map((v) => (v !== 'OP_ELSE' ? v : 'OP_ELSE')).join(' ')
      );
    const result = ps.checkPSBT(ourKey.publicKey, psbt.toHex());
    assert.equal(result.errors.join('\n'), '');
    done();
  });

  it('position 7 should eq OP_2', (done) => {
    const customerKey = ECPair.makeRandom({ network: networks.regtest });
    const rs = constructRS(customerKey, ourKey, 300);
    const tx = createFundingTx(rs, 1337 * 1e8);
    const psbt = generatePsbt(customerKey, tx, rs);
    psbt.data.inputs[psbt.data.inputs.length - 1]
      .redeemScript = script.fromASM(
        script.toASM(
          psbt.data.inputs[psbt.data.inputs.length - 1].redeemScript
        ).split(' ').map((v) => (v !== 'OP_2' ? v : 'OP_2')).join(' ')
      );
    const result = ps.checkPSBT(ourKey.publicKey, psbt.toHex());
    assert.equal(result.errors.join('\n'), '');
    done();
  });

  it('position 8 should eq OP_ENDIF', (done) => {
    const customerKey = ECPair.makeRandom({ network: networks.regtest });
    const rs = constructRS(customerKey, ourKey, 300);
    const tx = createFundingTx(rs, 1337 * 1e8);
    const psbt = generatePsbt(customerKey, tx, rs);
    psbt.data.inputs[psbt.data.inputs.length - 1]
      .redeemScript = script.fromASM(
        script.toASM(
          psbt.data.inputs[psbt.data.inputs.length - 1].redeemScript
        ).split(' ').map((v) => (v !== 'OP_ENDIF' ? v : 'OP_ENDIF')).join(' ')
      );
    const result = ps.checkPSBT(ourKey.publicKey, psbt.toHex());
    assert.equal(result.errors.join('\n'), '');
    done();
  });

  it('position 9 should eq customerKey', (done) => {
    const customerKey = ECPair.makeRandom({ network: networks.regtest });
    const rs = constructRS(customerKey, ourKey, 300);
    const tx = createFundingTx(rs, 1337 * 1e8);
    const psbt = generatePsbt(customerKey, tx, rs);
    psbt.data.inputs[psbt.data.inputs.length - 1]
      .redeemScript = script.fromASM(
        script.toASM(
          psbt.data.inputs[psbt.data.inputs.length - 1].redeemScript
        ).split(' ').map((v) => (v !== customerKey.publicKey.toString('hex') ? v : ourKey.publicKey.toString('hex'))).join(' ')
      );
    const result = ps.checkPSBT(ourKey.publicKey, psbt.toHex());
    assert.equal(result.errors.join('\n'), '');
    done();
  });

  it('position 10 should eq ourkey', (done) => {
    const customerKey = ECPair.makeRandom({ network: networks.regtest });
    const rs = constructRS(customerKey, ourKey, 300);
    const tx = createFundingTx(rs, 1337 * 1e8);
    const psbt = generatePsbt(customerKey, tx, rs);
    psbt.data.inputs[psbt.data.inputs.length - 1]
      .redeemScript = script.fromASM(
        script.toASM(
          psbt.data.inputs[psbt.data.inputs.length - 1].redeemScript
        ).split(' ').map((v) => ((v !== ourKey.publicKey.toString('hex')) ? v : ourKey.publicKey.toString('hex'))).join(' ')
      );
    const result = ps.checkPSBT(ourKey.publicKey, psbt.toHex());
    assert.equal(result.errors.join('\n'), '');
    done();
  });

  it('position 11 should eq OP_2', (done) => {
    const customerKey = ECPair.makeRandom({ network: networks.regtest });
    const rs = constructRS(customerKey, ourKey, 300);
    const tx = createFundingTx(rs, 1337 * 1e8);
    const psbt = generatePsbt(customerKey, tx, rs);
    psbt.data.inputs[psbt.data.inputs.length - 1]
      .redeemScript = script.fromASM(
        script.toASM(
          psbt.data.inputs[psbt.data.inputs.length - 1].redeemScript
        ).split(' ').map((v) => (v !== 'OP_2' ? v : 'OP_1')).join(' ')
      );
    const result = ps.checkPSBT(ourKey.publicKey, psbt.toHex());
    assert.equal(result.errors.join('\n'), 'Malformed redeemscript at position 7\nMalformed redeemscript at position 11');
    done();
  });
  it('position 12 should eq OP_CHECKMULTISIG', (done) => {
    const customerKey = ECPair.makeRandom({ network: networks.regtest });
    const rs = constructRS(customerKey, ourKey, 300);
    const tx = createFundingTx(rs, 1337 * 1e8);
    const psbt = generatePsbt(customerKey, tx, rs);
    psbt.data.inputs[psbt.data.inputs.length - 1]
      .redeemScript = script.fromASM(
        script.toASM(
          psbt.data.inputs[psbt.data.inputs.length - 1].redeemScript
        ).split(' ').map((v) => (v !== 'OP_CHECKMULTISIG' ? v : 'OP_CHECKSIGVERIFY')).join(' ')
      );
    const result = ps.checkPSBT(ourKey.publicKey, psbt.toHex());
    assert.equal(result.errors.join('\n'), 'Malformed redeemscript at position 12');
    done();
  });
});

describe('psbt', () => {
  const ourKey = ECPair.makeRandom({ network: networks.regtest });
  const ps = new PaymentService(networks.regtest, 1159);

  it('should be a goodPsbtHex', (done) => {
    const customerKey = ECPair.makeRandom({ network: networks.regtest });
    const rs = constructRS(customerKey, ourKey, 300);
    const tx = createFundingTx(rs, 1337 * 1e8);
    const psbt = generatePsbt(customerKey, tx, rs);
    const result = ps.checkPSBT(ourKey.publicKey, psbt.toHex());
    assert(result.isOk(), result.errors.join('\n'));
    done();
  });

  // it('should return json', (done) => {
  //   // const data = jsonReader('image.json');
  //   const pubKeyB = get(process.env.PUBLIC_KEY);
  //   // console.log(data.jpeg.length);
  //   console.log(bitauth.getPublicKeyFromPrivateKey(process.env.PRIVATE_KEY));
  //   console.log();

  //   console.log(bitauth.getSinFromPublicKey(pubKeyB.publicKey.toString('hex')));
  //   // console.log(data.psbt)
  //   // console.log(Psbt.fromHex(data.psbt))
  //   // console.log(decodeTransaction(data.psbt))
  //   done();
  // });
});
