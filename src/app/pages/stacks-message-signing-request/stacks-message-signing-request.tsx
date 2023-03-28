import { Outlet } from 'react-router-dom';

import {
  isSignedMessageType,
  isStructuredMessageType,
  isUtf8MessageType,
} from '@shared/signature/signature-types';

import { useRouteHeader } from '@app/common/hooks/use-route-header';
import { WarningLabel } from '@app/components/warning-label';
import { PopupHeader } from '@app/features/current-account/popup-header';
import { useOnOriginTabClose } from '@app/routes/hooks/use-on-tab-closed';
import {
  useIsSignatureRequestValid,
  useSignatureRequestSearchParams,
} from '@app/store/signatures/requests.hooks';

import { MessageSigningRequestLayout } from '../../features/message-signer/message-signing-request.layout';
import { StacksSignatureRequestMessageContent } from './components/stacks-signature-message-content';
import { SignatureRequestStructuredDataContent } from './components/structured-data-content';

export function StacksMessageSigningRequest() {
  const validSignatureRequest = useIsSignatureRequestValid();
  const { requestToken, messageType } = useSignatureRequestSearchParams();

  useRouteHeader(<PopupHeader />);

  useOnOriginTabClose(() => window.close());

  if (!isSignedMessageType(messageType)) return null;

  if (!requestToken) return null;

  return (
    <MessageSigningRequestLayout>
      {!validSignatureRequest && (
        <WarningLabel>
          Signing messages can have unintended consequences. Only sign messages from trusted
          sources.
        </WarningLabel>
      )}
      {isUtf8MessageType(messageType) && (
        <StacksSignatureRequestMessageContent requestToken={requestToken} />
      )}
      {isStructuredMessageType(messageType) && (
        <SignatureRequestStructuredDataContent requestToken={requestToken} />
      )}
      <Outlet />
    </MessageSigningRequestLayout>
  );
}
