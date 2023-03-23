import { useMemo } from 'react';

import { signBip322MessageSimple } from '@shared/crypto/bitcoin/bip322/sign-message-bip322-bitcoinjs';
import { deriveAddressIndexZeroFromAccount } from '@shared/crypto/bitcoin/bitcoin.utils';
import { logger } from '@shared/logger';
import { makeRpcSuccessResponse } from '@shared/rpc/rpc-methods';

import { useAnalytics } from '@app/common/hooks/analytics/use-analytics';
import { useDefaultRequestParams } from '@app/common/hooks/use-default-request-search-params';
import { initialSearchParams } from '@app/common/initial-search-params';
import { useCurrentAccountIndex } from '@app/store/accounts/account';
import { useNativeSegWitCurrentNetworkAccountKeychain } from '@app/store/accounts/blockchain/bitcoin/native-segwit-account.hooks';

function useRpcSignBitcoinMessage() {
  const defaultParams = useDefaultRequestParams();
  return useMemo(
    () => ({
      ...defaultParams,
      requestId: initialSearchParams.get('requestId') ?? '',
      message: initialSearchParams.get('message') ?? '',
    }),
    [defaultParams]
  );
}

export function useSignBip322Message() {
  const analytics = useAnalytics();

  const { tabId, origin, requestId, message } = useRpcSignBitcoinMessage();
  const accountKeychain = useNativeSegWitCurrentNetworkAccountKeychain();

  if (!accountKeychain) throw new Error('Cannot sign message: no account keychain');
  const currentAccountIndex = useCurrentAccountIndex();
  const addressIndexKeychain = deriveAddressIndexZeroFromAccount(
    accountKeychain(currentAccountIndex)
  );

  return {
    origin,
    message,
    formattedOrigin: new URL(origin!).host,
    onUserApproveBip322MessageSigningRequest() {
      if (!tabId || !origin) {
        logger.error('Cannot give app accounts: missing tabId, origin');
        return;
      }
      void analytics.track('user_approved_message_signing', { origin });

      const { signature } = signBip322MessageSimple(
        Buffer.from(addressIndexKeychain.privateKey!),
        message
      );

      chrome.tabs.sendMessage(
        tabId,
        makeRpcSuccessResponse('signMessage', {
          id: requestId,
          result: { signature },
        })
      );
      window.close();
    },
  };
}
