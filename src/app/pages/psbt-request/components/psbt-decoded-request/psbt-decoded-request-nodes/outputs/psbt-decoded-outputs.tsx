import * as btc from '@scure/btc-signer';
import { Box, Text } from '@stacks/ui';

import { useOnMount } from '@app/common/hooks/use-on-mount';
import { satToBtc } from '@app/common/money/unit-conversion';

import { PsbtBtcNodeLayout } from '../psbt-btc-node.layout';
import { PsbtPlaceholderNode } from '../psbt-placeholder-node';
import { PsbtDecodedOutputLayout } from './psbt-decoded-output.layout';

// TODO: Handle all address types?
function getAddressFromScript(script: Uint8Array) {
  const outScript = btc.OutScript.decode(script);

  if (outScript.type === 'wsh') return btc.programToWitness(0, script.slice(2));
  if (outScript.type === 'wpkh') return btc.programToWitness(0, script.slice(2));
  if (outScript.type === 'tr') return btc.programToWitness(1, script.slice(2));
  return '';
}

function isPlaceholderTransaction(address: string, outputs: btc.TransactionOutputRequired[]) {
  const outputsNotToCurrentAddress = outputs.filter(output => {
    const addressFromScript = getAddressFromScript(output.script);
    return addressFromScript !== address;
  });
  return outputsNotToCurrentAddress.length === 0;
}

interface PsbtDecodedOutputs {
  addressNativeSegwit: string;
  addressTaproot: string;
  outputs: btc.TransactionOutputRequired[];
  onSetShowPlaceholder(): void;
  showPlaceholder: boolean;
}
export function PsbtDecodedOutputs({
  addressNativeSegwit,
  addressTaproot,
  onSetShowPlaceholder,
  outputs,
  showPlaceholder,
}: PsbtDecodedOutputs) {
  useOnMount(() => {
    if (isPlaceholderTransaction(addressNativeSegwit, outputs)) onSetShowPlaceholder();
  });

  return (
    <Box background="white" borderBottomLeftRadius="16px" borderBottomRightRadius="16px" p="loose">
      <Text fontWeight={500}>Outputs</Text>
      {showPlaceholder ? (
        <PsbtPlaceholderNode />
      ) : (
        outputs.map(output => {
          const addressFromScript = getAddressFromScript(output.script);
          if (!addressFromScript) return null;

          const isCurrentAddress =
            addressFromScript === addressNativeSegwit || addressFromScript === addressTaproot;
          const amount = satToBtc(Number(output.amount)).toString();

          return (
            <PsbtDecodedOutputLayout address={addressFromScript}>
              <PsbtBtcNodeLayout
                subtitle="Bitcoin"
                value={`${isCurrentAddress ? '+' : '-'}${amount}`}
              />
            </PsbtDecodedOutputLayout>
          );
        })
      )}
    </Box>
  );
}
