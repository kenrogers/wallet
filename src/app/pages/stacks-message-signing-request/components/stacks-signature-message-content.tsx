import { ChainID, bytesToHex } from '@stacks/common';
import { hashMessage } from '@stacks/encryption';

import { getSignaturePayloadFromToken } from '@app/common/signature/requests';
import { NetworkRow } from '@app/components/network-row';

import { MessagePreviewBox } from '../../../features/message-signer/message-preview-box';
import { StacksMessageSigningDisclaimer } from './message-signing-disclaimer';
import { StacksSignMessageAction } from './stacks-sign-message-action';

interface SignatureRequestMessageContentProps {
  requestToken: string;
}
export function StacksSignatureRequestMessageContent(props: SignatureRequestMessageContentProps) {
  const { requestToken } = props;

  const signatureRequest = getSignaturePayloadFromToken(requestToken);
  const { message, network } = signatureRequest;
  const appName = signatureRequest.appDetails?.name;
  return (
    <>
      <MessagePreviewBox message={message} hash={bytesToHex(hashMessage(message))} />
      <NetworkRow chainId={network?.chainId ?? ChainID.Testnet} />
      <StacksSignMessageAction message={message} messageType="utf8" />
      <hr />
      <StacksMessageSigningDisclaimer appName={appName} />
    </>
  );
}
