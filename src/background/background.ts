//
// This file is the entrypoint to the extension's background script
// https://developer.chrome.com/docs/extensions/mv3/architecture-overview/#background_script
import { logger } from '@shared/logger';
import { CONTENT_SCRIPT_PORT } from '@shared/message-types';
import type { LegacyMessageFromContentScript } from '@shared/message-types';
import { RouteUrls } from '@shared/route-urls';
import { warnUsersAboutDevToolsDangers } from '@shared/utils/dev-tools-warning-log';

import { initContextMenuActions } from './init-context-menus';
import {
  handleLegacyExternalMethodFormat,
  isLegacyMessage,
} from './legacy-external-message-handler';
import { internalBackgroundMessageHandler } from './message-handler';

initContextMenuActions();
warnUsersAboutDevToolsDangers();

const IS_TEST_ENV = process.env.TEST_ENV === 'true';

chrome.runtime.onInstalled.addListener(async details => {
  if (details.reason === 'install' && !IS_TEST_ENV) {
    await chrome.tabs.create({ url: chrome.runtime.getURL(`index.html#${RouteUrls.Onboarding}`) });
  }
});

//
// Listen for connection to the content-script - port for two-way communication
chrome.runtime.onConnect.addListener(port => {
  if (port.name !== CONTENT_SCRIPT_PORT) return;

  port.onMessage.addListener((message: LegacyMessageFromContentScript, port) => {
    if (!port.sender?.tab?.id)
      return logger.error('Message reached background script without a corresponding tab');

    // Chromium/Firefox discrepancy
    const originUrl = port.sender?.origin ?? port.sender?.url;

    if (!originUrl)
      return logger.error('Message reached background script without a corresponding origin');

    if (isLegacyMessage(message)) {
      void handleLegacyExternalMethodFormat(message, port);
      return;
    }

    // TODO:
    // Here we'll handle all messages using the rpc style comm method
    // For now all messages are handled as legacy format
  });
});

//
// Events from the extension frames script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  void internalBackgroundMessageHandler(message, sender, sendResponse);
  // Listener fn must return `true` to indicate the response will be async
  return true;
});
