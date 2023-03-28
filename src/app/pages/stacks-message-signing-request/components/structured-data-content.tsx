import { ChainID } from '@stacks/common';

import { getStructuredDataPayloadFromToken } from '@app/common/signature/requests';
import { NetworkRow } from '@app/components/network-row';

import { StacksMessageSigningDisclaimer } from './message-signing-disclaimer';
import { StacksSignMessageAction } from './stacks-sign-message-action';
import { StructuredDataBox } from './structured-data-box';

interface SignatureRequestStructuredDataContentProps {
  requestToken: string;
}
export function SignatureRequestStructuredDataContent({
  requestToken,
}: SignatureRequestStructuredDataContentProps) {
  const signatureRequest = getStructuredDataPayloadFromToken(requestToken);
  const { domain, message, network } = signatureRequest;
  const appName = signatureRequest.appDetails?.name;
  return (
    <>
      <StructuredDataBox message={message} domain={domain} />
      <NetworkRow chainId={network?.chainId ?? ChainID.Testnet} />
      <StacksSignMessageAction message={message} messageType="structured" domain={domain} />
      <hr />
      <StacksMessageSigningDisclaimer appName={appName} />
    </>
  );
}
