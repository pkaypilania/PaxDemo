export type PaxRuntimeMode = 'native' | 'mock';

export type PaxCapabilities = Readonly<{
  platform: string;
  runtimeMode: PaxRuntimeMode;
  isNativeSupported: boolean;
  isSdkAvailable: boolean;
  canInitialize: boolean;
  canTransact: boolean;
  canScan: boolean;
  canPrint: boolean;
  manufacturer: string;
  model: string;
  sdkVersion: string;
  reason: string;
}>;

export type PaxInitResult = Readonly<{
  success: boolean;
  runtimeMode: PaxRuntimeMode;
  message: string;
  deviceId: string;
  serialNumber: string;
  sdkVersion: string;
  rawResponse: string;
}>;

export type PaxTransactionRequest = Readonly<{
  amount: string;
  referenceId: string;
}>;

export type PaxTransactionType = 'sale' | 'refund';

export type PaxTransactionResult = Readonly<{
  success: boolean;
  runtimeMode: PaxRuntimeMode;
  type: PaxTransactionType;
  amount: string;
  transactionId: string;
  referenceId: string;
  authorizationCode: string;
  cardType: string;
  maskedPan: string;
  responseCode: string;
  message: string;
  timestamp: string;
  rawResponse: string;
}>;

export type PaxScanResult = Readonly<{
  success: boolean;
  runtimeMode: PaxRuntimeMode;
  code: string;
  format: string;
  message: string;
  rawResponse: string;
}>;

export type PaxPrintRequest = Readonly<{
  html: string;
  title: string;
}>;

export type PaxPrintResult = Readonly<{
  success: boolean;
  runtimeMode: PaxRuntimeMode;
  message: string;
  previewHtml: string;
  rawResponse: string;
}>;

export interface PaxProvider {
  getCapabilities(): Promise<PaxCapabilities>;
  initialize(): Promise<PaxInitResult>;
  sale(request: PaxTransactionRequest): Promise<PaxTransactionResult>;
  refund(request: PaxTransactionRequest): Promise<PaxTransactionResult>;
  scanBarcode(): Promise<PaxScanResult>;
  printReceipt(request: PaxPrintRequest): Promise<PaxPrintResult>;
}
