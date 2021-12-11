const coininfo = require('coininfo');
const bitcoin = require('bitcoinjs-lib');

const generateDOGE = (x) => {
  const curr = x;
  const frmt = curr.toBitcoinJS();

  const netGain = {
    messagePrefix: `\x19${frmt.name} Signed Message:\n`,
    bip32: {
      public: frmt.bip32.public,
      private: frmt.bip32.private
    },
    pubKeyHash: frmt.pubKeyHash,
    scriptHash: frmt.scriptHash,
    wif: frmt.wif
  };

  const keyPair = bitcoin.ECPair.makeRandom({ network: netGain });
  const wif = keyPair.toWIF();
  const address = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey, network: netGain });
  return {
    keyPair,
    wif,
    address,
  };
};

console.log(generateDOGE(coininfo.dogecoin.main));
// console.log(generateDOGE(coininfo.dogecoin.test));
const mainnet = {
  messagePrefix: '\x18Dogecoin Signed Message:\n',
  bech32: 'tdge',
  bip32: {
    public: 0x02facafd,
    private: 0x0432a243
  },
  pubKeyHash: 0x1E,
  scriptHash: 0x16,
  wif: 0x9E,
};

const testnet = {
  messagePrefix: '\x18Dogecoin Signed Message:\n',
  bech32: 'tdge',
  bip32: {
    public: 0x0432a9a8,
    private: 0x0432a243
  },
  pubKeyHash: 0x71,
  scriptHash: 0xc4,
  wif: 0xf1,
};

const regtest = {
  messagePrefix: '\x18Dogecoin Signed Message:\n',
  bech32: 'tdge',
  bip32: {
    public: 0x0432a9a8,
    private: 0x0432a243
  },
  pubKeyHash: 0x6f,
  scriptHash: 0xc4,
  wif: 0xef,
};

// bitauth.PREFIX = Buffer.from('', 'hex')
module.exports = {
  mainnet,
  testnet,
  regtest
};
