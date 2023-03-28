import { MessageSigningRequestLayout } from '@app/features/message-signer/message-signing-request.layout';

import { SignBip322MessageLayout } from './components/sign-bip322-message.layout';
import { useSignBip322Message } from './use-sign-bip322-message';

export function RpcSignBip322Message() {
  const { origin, message, formattedOrigin, onUserApproveBip322MessageSigningRequest } =
    useSignBip322Message();

  if (origin === null) {
    window.close();
    throw new Error('Origin is null');
  }

  return (
    <MessageSigningRequestLayout>
      <SignBip322MessageLayout
        message={message}
        requester={formattedOrigin}
        onUserApproveSignBip322Message={onUserApproveBip322MessageSigningRequest}
      />
    </MessageSigningRequestLayout>
  );
}
