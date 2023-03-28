import { NoFeesWarningRow } from '@app/components/no-fees-warning-row';
import { MessagePreviewBox } from '@app/features/message-signer/message-preview-box';
import { MessageSigningRequestLayout } from '@app/features/message-signer/message-signing-request.layout';
import { useCurrentNetwork } from '@app/store/networks/networks.selectors';

import { MessageSigningHeader } from '../../features/message-signer/message-signing-header';
import { useSignBip322Message } from './use-sign-bip322-message';

export function RpcSignBip322Message() {
  const { origin, message, formattedOrigin, onUserApproveBip322MessageSigningRequest } =
    useSignBip322Message();

  const { chain } = useCurrentNetwork();

  if (origin === null) {
    window.close();
    throw new Error('Origin is null');
  }

  return (
    <MessageSigningRequestLayout>
      <MessageSigningHeader origin={origin} />
      <MessagePreviewBox message={message} />
      <NoFeesWarningRow chainId={chain.stacks.chainId} />
      {/* <SignBip322MessageLayout
        message={message}
        requester={formattedOrigin}
        onUserApproveSignBip322Message={onUserApproveBip322MessageSigningRequest}
      /> */}
    </MessageSigningRequestLayout>
  );
}
