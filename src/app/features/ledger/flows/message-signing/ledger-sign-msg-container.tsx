import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import { bytesToHex, signatureVrsToRsv } from '@stacks/common';
import { serializeCV } from '@stacks/transactions';
import { LedgerError } from '@zondax/ledger-stacks';
import get from 'lodash.get';

import { finalizeMessageSignature } from '@shared/actions/finalize-message-signature';
import { logger } from '@shared/logger';
import { UnsignedMessage, whenSignableMessageOfType } from '@shared/signature/signature-types';

import { useScrollLock } from '@app/common/hooks/use-scroll-lock';
import { delay } from '@app/common/utils';
import { BaseDrawer } from '@app/components/drawer/base-drawer';
import {
  getAppVersion,
  prepareLedgerDeviceConnection,
  signLedgerStructuredMessage,
  signLedgerUtf8Message,
  useActionCancellableByUser,
  useLedgerResponseState,
} from '@app/features/ledger/ledger-utils';
import { useCurrentStacksAccount } from '@app/store/accounts/blockchain/stacks/stacks-account.hooks';
import { StacksAccount } from '@app/store/accounts/blockchain/stacks/stacks-account.models';
import { useSignatureRequestSearchParams } from '@app/store/signatures/requests.hooks';

import { useLedgerAnalytics } from '../../hooks/use-ledger-analytics.hook';
import { useLedgerNavigate } from '../../hooks/use-ledger-navigate';
import { useVerifyMatchingLedgerPublicKey } from '../../hooks/use-verify-matching-public-key';
import { LedgerMessageSigningContext, LedgerMsgSigningProvider } from './ledger-sign-msg.context';
import { useSignedMessageType } from './use-message-type';

interface LedgerSignMsgData {
  account: StacksAccount;
  unsignedMessage: UnsignedMessage;
}
interface LedgerSignMsgDataProps {
  children({ account, unsignedMessage }: LedgerSignMsgData): JSX.Element;
}
function LedgerSignMsgData({ children }: LedgerSignMsgDataProps) {
  const account = useCurrentStacksAccount();
  const unsignedMessage = useSignedMessageType();
  if (!unsignedMessage || !account) return null;
  return children({ account, unsignedMessage });
}

type LedgerSignMsgProps = LedgerSignMsgData;
function LedgerSignMsg({ account, unsignedMessage }: LedgerSignMsgProps) {
  useScrollLock(true);

  const location = useLocation();
  const ledgerNavigate = useLedgerNavigate();
  const ledgerAnalytics = useLedgerAnalytics();
  const verifyLedgerPublicKey = useVerifyMatchingLedgerPublicKey();
  const { tabId, requestToken } = useSignatureRequestSearchParams();

  const [latestDeviceResponse, setLatestDeviceResponse] = useLedgerResponseState();
  const canUserCancelAction = useActionCancellableByUser();

  const [awaitingDeviceConnection, setAwaitingDeviceConnection] = useState(false);

  async function signMessage() {
    const stacksApp = await prepareLedgerDeviceConnection({
      setLoadingState: setAwaitingDeviceConnection,
      onError() {
        ledgerNavigate.toErrorStep();
      },
    });

    const versionInfo = await getAppVersion(stacksApp);
    ledgerAnalytics.trackDeviceVersionInfo(versionInfo);
    setLatestDeviceResponse(versionInfo);
    if (versionInfo.deviceLocked) {
      setAwaitingDeviceConnection(false);
      return;
    }

    if (!tabId || !requestToken) {
      logger.warn('Cannot sign message without corresponding `tabId` or `requestToken');
      return;
    }

    ledgerNavigate.toDeviceBusyStep(`Verifying public key on Ledger…`);
    await verifyLedgerPublicKey(stacksApp);

    try {
      ledgerNavigate.toConnectionSuccessStep();
      await delay(1000);
      ledgerNavigate.toAwaitingDeviceOperation({ hasApprovedOperation: false });

      const resp = await whenSignableMessageOfType(unsignedMessage)({
        async utf8(msg) {
          return signLedgerUtf8Message(stacksApp)(msg, account.index);
        },
        async structured(domain, msg) {
          return signLedgerStructuredMessage(stacksApp)(
            bytesToHex(serializeCV(domain)),
            bytesToHex(serializeCV(msg)),
            account.index
          );
        },
      });

      // Assuming here that public keys are wrong. Alternatively, we may want
      // to proactively check the key before signing
      if (resp.returnCode === LedgerError.DataIsInvalid) {
        ledgerNavigate.toDevicePayloadInvalid();
        return;
      }

      if (resp.returnCode === LedgerError.TransactionRejected) {
        ledgerNavigate.toOperationRejectedStep(`Message signing operation rejected`);
        ledgerAnalytics.messageSignedOnLedgerRejected();
        finalizeMessageSignature({ requestPayload: requestToken, tabId, data: 'cancel' });
        return;
      }
      if (resp.returnCode !== LedgerError.NoErrors) {
        throw new Error('Some other error');
      }
      ledgerNavigate.toAwaitingDeviceOperation({ hasApprovedOperation: true });
      await delay(1000);

      ledgerAnalytics.messageSignedOnLedgerSuccessfully();

      finalizeMessageSignature({
        requestPayload: requestToken,
        tabId,
        data: {
          signature: signatureVrsToRsv(resp.signatureVRS.toString('hex')),
          publicKey: account.stxPublicKey,
        },
      });

      await stacksApp.transport.close();
    } catch (e) {
      ledgerNavigate.toDeviceDisconnectStep();
    }
  }

  const allowUserToGoBack = get(location.state, 'goBack');

  const ledgerContextValue: LedgerMessageSigningContext = {
    message: unsignedMessage,
    signMessage,
    latestDeviceResponse,
    awaitingDeviceConnection,
  };

  return (
    <LedgerMsgSigningProvider value={ledgerContextValue}>
      <BaseDrawer
        enableGoBack={allowUserToGoBack}
        isShowing
        isWaitingOnPerformedAction={awaitingDeviceConnection || canUserCancelAction}
        onClose={ledgerNavigate.cancelLedgerAction}
        pauseOnClickOutside
        waitingOnPerformedActionMessage="Ledger device in use"
      >
        <Outlet />
      </BaseDrawer>
    </LedgerMsgSigningProvider>
  );
}

export function LedgerSignMsgContainer() {
  return <LedgerSignMsgData>{props => <LedgerSignMsg {...props} />}</LedgerSignMsgData>;
}
