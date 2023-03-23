import { sha256 } from '@noble/hashes/sha256';
import * as btc from '@scure/btc-signer';
import { bytesToHex, hexToBytes, utf8ToBytes } from '@stacks/common';

import { isString } from '@shared/utils';

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

export function signBip322MessageSimple(script: Uint8Array, message: string) {
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

  // const commands = [btc.OP.OP_0, 0x20, hash];
  const commands = [btc.OP.OP_0, hash];

  console.log(btc.Script.encode(commands));
  console.log(bytesToHex(btc.Script.encode(commands)));

  // console.log({ prevoutHash, prevoutIndex, sequence });
  console.log({ hash });

  // btc.Script.encode(commands);

  // check other args
  const virtualToSpend = new btc.Transaction({
    version: 0,
    lockTime: 0,
    allowUnknowInput: true,
    allowUnknowOutput: true,
    disableScriptCheck: true,
    allowLegacyWitnessUtxo: true,
  });

  virtualToSpend.addInput({
    txid: prevoutHash,
    index: prevoutIndex,
    sequence,
    witnessScript: btc.Script.encode(commands),
  });

  virtualToSpend.addOutput({
    script,
    amount: 0n,
  });

  // not finalised

  // const txToSign =

  return { virtualToSpend };
}
