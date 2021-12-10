const assert = require('assert');
const { ECPair } = require('bitcoinjs-lib');
const networks = require('../src/networks');
const { PaymentService } = require('../src/services/paymentservice');

const { constructRS, createFundingTx, generatePsbt } = require('./helpers');

describe('payment service', () => {
  const ourKey = ECPair.makeRandom({ network: networks.regtest });
  const ps = new PaymentService(networks.regtest, 1159);

  it('should be a goodPsbtHex', (done) => {
    const customerKey = ECPair.makeRandom({ network: networks.regtest });
    const rs = constructRS(customerKey, ourKey, 300);
    const tx = createFundingTx(rs, 1337 * 1e8);
    const psbt = generatePsbt(customerKey, tx, rs);
    psbt.signInput(0, ourKey);
    const result = ps.checkPSBT(ourKey.publicKey, psbt.toHex());
    const response = { psbtVdn: result, psbt: psbt.toHex() };
    assert(response.psbtVdn.isOk(), response.psbtVdn.errors.join('\n'));
    done();
  });
});
