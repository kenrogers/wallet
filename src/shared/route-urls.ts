export enum RouteUrls {
  Container = '/',

  // Onboarding routes
  Onboarding = '/get-started',
  BackUpSecretKey = '/back-up-secret-key',
  SetPassword = '/set-password',
  SignIn = '/sign-in',
  MagicRecoveryCode = '/recovery-code',
  RequestDiagnostics = '/request-diagnostics',

  // Ledger routes
  ConnectLedger = 'connect-your-ledger',
  ConnectLedgerError = 'ledger-connection-error',
  ConnectLedgerSuccess = 'successfully-connected-your-ledger',
  DeviceBusy = 'please-wait',
  AwaitingDeviceUserAction = 'awaiting-approval',
  LedgerDisconnected = 'your-ledger-disconnected',
  LedgerOperationRejected = 'action-rejected',
  LedgerPublicKeyMismatch = 'wrong-ledger-device',
  LedgerDevicePayloadInvalid = 'ledger-payload-invalid',
  LedgerUnsupportedBrowser = 'unsupported-browser',
  LedgerOutdatedAppWarning = 'outdated-app-warning',

  // Active wallet routes
  Home = '/',
  AddNetwork = '/add-network',
  ChooseAccount = '/choose-account',
  Fund = '/fund',
  FundReceive = '/fund/receive',
  FundReceiveStx = '/fund/receive/stx',
  FundReceiveBtc = '/fund/receive/btc',
  IncreaseFee = '/increase-fee',
  Receive = '/receive',
  ReceiveCollectible = '/receive/collectible',
  ReceiveCollectibleOrdinal = '/receive/collectible/ordinal',
  ReceiveStx = '/receive/stx',
  ReceiveBtc = '/receive/btc',
  Send = '/send-transaction',
  ViewSecretKey = '/view-secret-key',

  // App requests
  ProfileUpdateRequest = '/update-profile',
  PsbtRequest = '/psbt',
  SignatureRequest = '/signature',
  TransactionRequest = '/transaction',
  TransactionBroadcastError = 'broadcast-error',
  UnauthorizedRequest = '/unauthorized-request',

  // Locked wallet route
  Unlock = '/unlock',

  // Modal routes
  ChangeTheme = 'change-theme',
  EditNonce = 'edit-nonce',
  SelectNetwork = 'choose-network',
  SignOutConfirm = 'sign-out',
  RetriveTaprootFunds = 'retrive-taproot-funds',

  // Send crypto asset routes
  SendCryptoAsset = '/send',
  SendCryptoAssetForm = '/send/:symbol',
  SendCryptoAssetFormRecipientAccounts = 'recipient-accounts',
  SendCryptoAssetFormRecipientBns = 'recipient-bns',
  SendBtcConfirmation = '/send/btc/confirm',
  SendBtcDisabled = '/send/btc/disabled',
  SendStxConfirmation = '/send/stx/confirm',
  SendStacksSip10Confirmation = '/send/:symbol/confirm',
  SentBtcTxSummary = '/sent/btc/:txId',
  SentStxTxSummary = '/sent/stx/:txId',

  // Send ordinal inscriptions
  SendOrdinalInscription = '/send/ordinal-inscription',
  SendOrdinalInscriptionChooseFee = '/send/ordinal-inscription/choose-fee',
  SendOrdinalInscriptionReview = '/send/ordinal-inscription/review',
  SendOrdinalInscriptionSummary = '/send/ordinal-inscription/',
  SendOrdinalInscriptionSent = '/send/ordinal-inscription/sent',
  SendOrdinalInscriptionError = '/send/ordinal-inscription/error',

  // Request routes
  RpcGetAddresses = '/get-addresses',
  RpcSignBip322Message = '/sign-bip322-message',
}
