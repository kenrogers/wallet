import { createContext } from 'react';

import { UnsignedMessage } from '@shared/signature/signature-types';
import { noop } from '@shared/utils';

import { BaseLedgerOperationContext } from '../../ledger-utils';

export interface LedgerMessageSigningContext extends BaseLedgerOperationContext {
  message: UnsignedMessage | undefined;
  signMessage(): Promise<void> | void;
}

export const ledgerMsgSigningContext = createContext<LedgerMessageSigningContext>({
  message: undefined,
  latestDeviceResponse: null,
  awaitingDeviceConnection: false,
  signMessage: noop,
});

export const LedgerMsgSigningProvider = ledgerMsgSigningContext.Provider;
