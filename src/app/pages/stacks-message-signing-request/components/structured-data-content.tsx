import { ChainID } from '@stacks/common';

import { HasChildren } from '@app/common/has-children';
import { getStructuredDataPayloadFromToken } from '@app/common/signature/requests';
import { NoFeesWarningRow } from '@app/components/no-fees-warning-row';

import { StacksMessageSigningDisclaimer } from './message-signing-disclaimer';
import { StructuredDataBox } from './structured-data-box';

interface SignatureRequestStructuredDataContentProps extends HasChildren {
  requestToken: string;
}
export function SignatureRequestStructuredDataContent({
  requestToken,
  children,
}: SignatureRequestStructuredDataContentProps) {
  const signatureRequest = getStructuredDataPayloadFromToken(requestToken);
  const { domain, message, network } = signatureRequest;
  const appName = signatureRequest.appDetails?.name;
  return (
    <>
      <StructuredDataBox message={message} domain={domain} />
      <NoFeesWarningRow chainId={network?.chainId ?? ChainID.Testnet} />
      {children}
      <hr />
      <StacksMessageSigningDisclaimer appName={appName} />
    </>
  );
}
