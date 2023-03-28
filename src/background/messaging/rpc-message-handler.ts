import { RpcErrorCode } from '@btckit/types';

import { RouteUrls } from '@shared/route-urls';
import { WalletRequests, makeRpcErrorResponse } from '@shared/rpc/rpc-methods';

import {
  getTabIdFromPort,
  listenForPopupClose,
  makeSearchParamsWithDefaults,
  triggerRequestWindowOpen,
} from './messaging-utils';

export async function rpcMessageHander(message: WalletRequests, port: chrome.runtime.Port) {
  switch (message.method) {
    case 'getAddresses': {
      const { urlParams, tabId } = makeSearchParamsWithDefaults(port, [['requestId', message.id]]);
      const { id } = await triggerRequestWindowOpen(RouteUrls.RpcGetAddresses, urlParams);
      listenForPopupClose({
        tabId,
        id,
        response: {
          id: message.id,
          result: makeRpcErrorResponse('getAddresses', {
            id: message.id,
            error: {
              code: RpcErrorCode.USER_REJECTION,
              message: 'User rejected request to get addresses',
            },
          }),
        },
      });
      break;
    }

    case 'signMessage': {
      if (!message.params) {
        chrome.tabs.sendMessage(
          getTabIdFromPort(port),
          makeRpcErrorResponse('signMessage', {
            id: message.id,
            error: {
              code: RpcErrorCode.INVALID_PARAMS,
              message:
                'Invalid parameters. Message signing requires a message. See the btckit spec for more information: https://btckit.org/docs/spec',
            },
          })
        );
        break;
      }
      const { urlParams, tabId } = makeSearchParamsWithDefaults(port, [
        ['message', message.params.message],
        ['requestId', message.id],
      ]);
      const { id } = await triggerRequestWindowOpen(RouteUrls.RpcSignBip322Message, urlParams);
      listenForPopupClose({
        tabId,
        id,
        response: makeRpcErrorResponse('signMessage', {
          id: message.id,
          error: {
            code: RpcErrorCode.USER_REJECTION,
            message: 'User rejected the message signature',
          },
        }),
      });
      break;
    }

    default:
      chrome.tabs.sendMessage(
        getTabIdFromPort(port),
        makeRpcErrorResponse('' as any, {
          id: message.id,
          error: {
            code: RpcErrorCode.METHOD_NOT_FOUND,
            message: `${message.method} is not supported`,
          },
        })
      );
      break;
  }
}
