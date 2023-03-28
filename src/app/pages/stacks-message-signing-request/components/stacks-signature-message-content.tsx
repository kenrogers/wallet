import { ChainID, bytesToHex } from '@stacks/common';
import { hashMessage } from '@stacks/encryption';

import { HasChildren } from '@app/common/has-children';
import { getSignaturePayloadFromToken } from '@app/common/signature/requests';
import { NoFeesWarningRow } from '@app/components/no-fees-warning-row';

import { MessagePreviewBox } from '../../../features/message-signer/message-preview-box';
import { StacksMessageSigningDisclaimer } from './message-signing-disclaimer';
import { StacksSignMessageActions } from './stacks-sign-message-action';

interface SignatureRequestMessageContentProps extends HasChildren {
  requestToken: string;
}
export function StacksSignatureRequestMessageContent(props: SignatureRequestMessageContentProps) {
  const { requestToken, children } = props;

  const signatureRequest = getSignaturePayloadFromToken(requestToken);
  const { message, network } = signatureRequest;
  const appName = signatureRequest.appDetails?.name;
  return (
    <>
      <MessagePreviewBox message={message} hash={bytesToHex(hashMessage(message))} />
      <NoFeesWarningRow chainId={network?.chainId ?? ChainID.Testnet} />
      {children}
      <hr />
      <StacksMessageSigningDisclaimer appName={appName} />
    </>
  );
}
