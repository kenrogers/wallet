// Compatible package that isn't tiny-secp256k1
// @ts-ignore
import ecc from '@bitcoinerlab/secp256k1';
import { sha256 } from '@noble/hashes/sha256';
import * as secp from '@noble/secp256k1';
import { base64 } from '@scure/base';
import * as btc from '@scure/btc-signer';
import { hexToBytes, utf8ToBytes } from '@stacks/common';
import * as bitcoinJs from 'bitcoinjs-lib';
import ECPairFactory from 'ecpair';
import { encode } from 'varuint-bitcoin';

import { isString } from '@shared/utils';

const ECPair = ECPairFactory(ecc);

const bip322MessageTag = 'BIP0322-signed-message';

// See tagged hashes section of BIP-340
// https://github.com/bitcoin/bips/blob/master/bip-0340.mediawiki#design
const messageTagHash = Uint8Array.from([
  ...sha256(utf8ToBytes(bip322MessageTag)),
  ...sha256(utf8ToBytes(bip322MessageTag)),
]);

export function hashBip322Message(message: Uint8Array | string) {
  return sha256(
    Uint8Array.from([...messageTagHash, ...(isString(message) ? utf8ToBytes(message) : message)])
  );
}

export function signBip322MessageSimple(privKey: Buffer, message: string) {
  const payment = btc.p2wpkh(secp.getPublicKey(privKey, true));
  // console.log(payment, bytesToHex(script));
  // nVersion = 0
  // nLockTime = 0
  // vin[0].prevout.hash = 0000...000
  // vin[0].prevout.n = 0xFFFFFFFF
  // vin[0].nSequence = 0
  // vin[0].scriptSig = OP_0 PUSH32[ message_hash ]
  // vin[0].scriptWitness = []
  // vout[0].nValue = 0
  // vout[0].scriptPubKey = message_challenge

  const prevoutHash = hexToBytes(
    '0000000000000000000000000000000000000000000000000000000000000000'
  );
  const prevoutIndex = 0xffffffff;
  const sequence = 0;

  const hash = hashBip322Message(message);

  const commands = [0, Buffer.from(hash)];
  const scriptSig = bitcoinJs.script.compile(commands);

  // check other args
  const virtualToSpend = new bitcoinJs.Transaction();
  virtualToSpend.version = 0;
  virtualToSpend.locktime = 0;

  virtualToSpend.addInput(Buffer.from(prevoutHash), prevoutIndex, sequence, scriptSig);

  virtualToSpend.addOutput(Buffer.from(payment.script!), 0);

  const virtuaToSign = new bitcoinJs.Psbt();
  virtuaToSign.setLocktime(0);
  virtuaToSign.setVersion(0);
  const prevTxHash = virtualToSpend.getHash(); // or id?
  const prevOutIndex = 0;
  const toSignScriptSig = bitcoinJs.script.compile([106]);

  virtuaToSign.addInput({
    hash: prevTxHash,
    index: prevOutIndex,
    sequence: 0,
    witnessUtxo: { script: Buffer.from(payment.script), value: 0 },
  });
  virtuaToSign.addOutput({ script: toSignScriptSig, value: 0 });

  virtuaToSign.signInput(0, ECPair.fromPrivateKey(privKey));
  virtuaToSign.finalizeAllInputs();
  // console.log(virtuaToSign.extractTransaction().ins[0].witness.map(bytesToHex));

  // sign the tx
  // section 5.1 not sure
  // github.com/LegReq/bip0322-signatures/blob/master/BIP0322_signing.ipynb
  const toSignTx = virtuaToSign.extractTransaction();

  function encodeVarString(b: Buffer) {
    return Buffer.concat([encode(b.byteLength), b]);
  }

  const len = encode(toSignTx.ins[0].witness.length);
  const result = Buffer.concat([len, ...toSignTx.ins[0].witness.map(w => encodeVarString(w))]);

  return { virtualToSpend, virtuaToSign: toSignTx, signature: base64.encode(result) };
}
