import { ExtensionMethods, InternalMethods, Message } from '@shared/message-types';

/**
 * Popup <-> Background Script
 */
type BackgroundMessage<Msg extends ExtensionMethods, Payload = undefined> = Omit<
  Message<Msg, Payload>,
  'source'
>;

export type RequestDerivedStxAccounts = BackgroundMessage<
  InternalMethods.RequestDerivedStxAccounts,
  { secretKey: string; highestAccountIndex: number }
>;

type ShareInMemoryKeyToBackground = BackgroundMessage<
  InternalMethods.ShareInMemoryKeyToBackground,
  { secretKey: string; keyId: string }
>;

type RequestInMemoryKeys = BackgroundMessage<InternalMethods.RequestInMemoryKeys>;

type RemoveInMemoryKeys = BackgroundMessage<InternalMethods.RemoveInMemoryKeys>;

type OriginatingTabClosed = BackgroundMessage<
  InternalMethods.OriginatingTabClosed,
  { tabId: number }
>;

type CheckServiceWorkerStatus = BackgroundMessage<InternalMethods.CheckServiceWorkerStatus>;

export type BackgroundMessages =
  | RequestDerivedStxAccounts
  | ShareInMemoryKeyToBackground
  | RequestInMemoryKeys
  | RemoveInMemoryKeys
  | OriginatingTabClosed
  | CheckServiceWorkerStatus;

export function sendMessage(message: BackgroundMessages) {
  return chrome.runtime.sendMessage(message);
}
