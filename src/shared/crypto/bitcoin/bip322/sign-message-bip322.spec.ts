import * as secp from '@noble/secp256k1';
import { base64 } from '@scure/base';
import * as btc from '@scure/btc-signer';
import { bytesToHex, hexToBytes, utf8ToBytes } from '@stacks/common';

// import { hashBip322Message, signBip322MessageSimple } from './sign-message-bip322';
import { hashBip322Message, signBip322MessageSimple } from './sign-message-bip322-bitcoinjs';

const helloWorld = 'Hello World';
//
// https://github.com/bitcoin/bips/blob/master/bip-0322.mediawiki#test-vectors
describe(signBip322MessageSimple.name, () => {
  describe('Message hashing', () => {
    test('empty string', () =>
      expect(hashBip322Message(utf8ToBytes(''))).toEqual(
        hexToBytes('c90c269c4f8fcbe6880f72a721ddfbf1914268a794cbb21cfafee13770ae19f1')
      ));

    test(helloWorld, () =>
      expect(hashBip322Message(utf8ToBytes(helloWorld))).toEqual(
        hexToBytes('f0eb03b1a75ac6d9847f55c624a99169b5dccba2a31f5b23bea77ba270de0a7a')
      )
    );
  });

  describe('Message signing', () => {
    test('bip322 vector address derivation', () => {
      const testVectorKey = btc
        .WIF()
        .decode('L3VFeEujGtevx9w18HD1fhRbCH67Az2dpCymeRE1SoPK6XQtaN2k');

      const nativeSegwitAddress = btc.getAddress('wpkh', testVectorKey);
      const payment = btc.p2wpkh(secp.getPublicKey(testVectorKey, true));
      expect(nativeSegwitAddress).toEqual('bc1q9vza2e8x573nczrlzms0wvx3gsqjx7vavgkx0l');
      expect(payment.address).toEqual('bc1q9vza2e8x573nczrlzms0wvx3gsqjx7vavgkx0l');
      // console.log(bytesToHex(payment.script));

      const { virtualToSpend: emptyStringToSpend, virtuaToSign: emptyStringToSign } =
        signBip322MessageSimple(Buffer.from(testVectorKey), '');
      expect(emptyStringToSpend.getId()).toEqual(
        'c5680aa69bb8d860bf82d4e9cd3504b55dde018de765a91bb566283c545a99a7'
      );
      expect(emptyStringToSign.getId()).toEqual(
        '1e9654e951a5ba44c8604c4de6c67fd78a27e81dcadcfe1edf638ba3aaebaed6'
      );
      const { virtualToSpend, virtuaToSign, signature } = signBip322MessageSimple(
        Buffer.from(testVectorKey),
        helloWorld
      );

      // section 3
      expect(virtualToSpend.getId()).toEqual(
        'b79d196740ad5217771c1098fc4a4b51e0535c32236c71f1ea4d61a2d603352b'
      );

      // sectuion 4.3 expectedid
      expect(virtuaToSign.getId()).toEqual(
        '88737ae86f2077145f93cc4b153ae9a1cb8d56afa511988c149c5c8c9d93bddf'
      );

      // sectioun 5.2 witness
      expect(virtuaToSign.ins[0].witness.map(bytesToHex).join(' ')).toEqual(
        '3045022100ecf2ca796ab7dde538a26bfb09a6c487a7b3fff33f397db6a20eb9af77c0ee8c022062e67e44c8070f49c3a37f5940a8850842daf7cca35e6af61a6c7c91f1e1a1a301 02c7f12003196442943d8588e01aee840423cc54fc1521526a3b85c2b0cbd58872'
      );

      // expect(result.toString('hex')).toEqual(
      //   '02483045022100ecf2ca796ab7dde538a26bfb09a6c487a7b3fff33f397db6a20eb9af77c0ee8c022062e67e44c8070f49c3a37f5940a8850842daf7cca35e6af61a6c7c91f1e1a1a3012102c7f12003196442943d8588e01aee840423cc54fc1521526a3b85c2b0cbd58872'
      // );

      // empty string
      // expect(base64.encode(emptyStringSignature)).toEqual(
      //   'AkcwRAIgM2gBAQqvZX15ZiysmKmQpDrG83avLIT492QBzLnQIxYCIBaTpOaD20qRlEylyxFSeEA2ba9YOixpX8z46TSDtS40ASECx/EgAxlkQpQ9hYjgGu6EBCPMVPwVIVJqO4XCsMvViHI='
      // );
      // hello world
      expect().toEqual(
        'AkgwRQIhAOzyynlqt93lOKJr+wmmxIens//zPzl9tqIOua93wO6MAiBi5n5EyAcPScOjf1lAqIUIQtr3zKNeavYabHyR8eGhowEhAsfxIAMZZEKUPYWI4BruhAQjzFT8FSFSajuFwrDL1Yhy'
      );
    });
  });
});
// AkcwRAIgZRfIY3p7/DoVTty6YZbWS71bc5Vct9p9Fia83eRmw2QCICK/ENGfwLtptFluMGs2KsqoNSk89pO7F29zJLUx9a/sASECx/EgAxlkQpQ9hYjgGu6EBCPMVPwVIVJqO4XCsMvViHI=
