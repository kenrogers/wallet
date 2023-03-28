import { useState } from 'react';
import { Outlet } from 'react-router-dom';

import { finalizeMessageSignature } from '@shared/actions/finalize-message-signature';
import { logger } from '@shared/logger';
import {
  isSignedMessageType,
  isStructuredMessageType,
  isUtf8MessageType,
  whenSignedMessageOfType,
} from '@shared/signature/signature-types';

import { useAnalytics } from '@app/common/hooks/analytics/use-analytics';
import { useRouteHeader } from '@app/common/hooks/use-route-header';
import { getSignaturePayloadFromToken } from '@app/common/signature/requests';
import { useWalletType } from '@app/common/use-wallet-type';
import { createDelay } from '@app/common/utils';
import { WarningLabel } from '@app/components/warning-label';
import { PopupHeader } from '@app/features/current-account/popup-header';
import { useLedgerNavigate } from '@app/features/ledger/hooks/use-ledger-navigate';
import { MessageSigningHeader } from '@app/features/message-signer/message-signing-header';
import { useOnOriginTabClose } from '@app/routes/hooks/use-on-tab-closed';
import {
  useIsSignatureRequestValid,
  useSignatureRequestSearchParams,
} from '@app/store/signatures/requests.hooks';

import { MessageSigningRequestLayout } from '../../features/message-signer/message-signing-request.layout';
import { StacksSignMessageActions } from './components/stacks-sign-message-action';
import { StacksSignatureRequestMessageContent } from './components/stacks-signature-message-content';
import { SignatureRequestStructuredDataContent } from './components/structured-data-content';
import { useMessageSignerStacksSoftwareWallet } from './stacks-message-signing.utils';

const improveUxWithShortDelayAsSigningIsSoFast = createDelay(1000);

export function StacksMessageSigningRequest() {
  const validSignatureRequest = useIsSignatureRequestValid();
  const { requestToken, messageType, tabId, origin } = useSignatureRequestSearchParams();

  const analytics = useAnalytics();
  const ledgerNavigate = useLedgerNavigate();

  const [isLoading, setIsLoading] = useState(false);

  const signSoftwareWalletMessage = useMessageSignerStacksSoftwareWallet();

  const { whenWallet } = useWalletType();

  useRouteHeader(<PopupHeader />);

  useOnOriginTabClose(() => window.close());

  if (!requestToken || !tabId) return null;
  if (!isSignedMessageType(messageType)) return null;

  const { message, appDetails } = getSignaturePayloadFromToken(requestToken);

  const sign = whenWallet({
    async software() {
      setIsLoading(true);
      void analytics.track('request_signature_sign', { type: 'software' });

      const messageSignature = signSoftwareWalletMessage({ ...message });

      if (!messageSignature) {
        logger.error('Cannot sign message, no account in state');
        void analytics.track('request_signature_cannot_sign_message_no_account');
        return;
      }
      await improveUxWithShortDelayAsSigningIsSoFast();
      setIsLoading(false);
      finalizeMessageSignature({ requestPayload: requestToken, tabId, data: messageSignature });
    },

    async ledger() {
      void analytics.track('request_signature_sign', { type: 'ledger' });
      whenSignedMessageOfType(message)({
        utf8(msg) {
          ledgerNavigate.toConnectAndSignUtf8MessageStep(msg);
        },
        structured(domain, msg) {
          ledgerNavigate.toConnectAndSignStructuredMessageStep(domain, msg);
        },
      });
    },
  });

  function cancelMessageSigning() {
    if (!requestToken || !tabId) return;

    void analytics.track('request_signature_cancel');
    finalizeMessageSignature({ requestPayload: requestToken, tabId, data: 'cancel' });
  }

  const appName = appDetails?.name;

  if (!requestToken) return null;

  return (
    <MessageSigningRequestLayout>
      <MessageSigningHeader name={appName} origin={origin} />

      {!validSignatureRequest && (
        <WarningLabel>
          Signing messages can have unintended consequences. Only sign messages from trusted
          sources.
        </WarningLabel>
      )}
      {isUtf8MessageType(messageType) && (
        <StacksSignatureRequestMessageContent requestToken={requestToken}>
          <StacksSignMessageActions
            isLoading={isLoading}
            onSignMessage={sign}
            onSignMessageCancel={cancelMessageSigning}
          />
        </StacksSignatureRequestMessageContent>
      )}
      {isStructuredMessageType(messageType) && (
        <SignatureRequestStructuredDataContent requestToken={requestToken}>
          <StacksSignMessageActions
            isLoading={isLoading}
            onSignMessage={sign}
            onSignMessageCancel={cancelMessageSigning}
          />
        </SignatureRequestStructuredDataContent>
      )}
      <Outlet />
    </MessageSigningRequestLayout>
  );
}
