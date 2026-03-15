import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export type NativePaxCapabilities = {
  readonly platform: string;
  readonly runtimeMode: string;
  readonly isNativeSupported: boolean;
  readonly isSdkAvailable: boolean;
  readonly canInitialize: boolean;
  readonly canTransact: boolean;
  readonly canScan: boolean;
  readonly canPrint: boolean;
  readonly manufacturer: string;
  readonly model: string;
  readonly sdkVersion: string;
  readonly reason: string;
};

export type NativePaxInitResult = {
  readonly success: boolean;
  readonly runtimeMode: string;
  readonly message: string;
  readonly deviceId: string;
  readonly serialNumber: string;
  readonly sdkVersion: string;
  readonly rawResponse: string;
};

export type NativePaxTransactionRequest = {
  readonly amount: string;
  readonly referenceId: string;
};

export type NativePaxTransactionResult = {
  readonly success: boolean;
  readonly runtimeMode: string;
  readonly type: string;
  readonly amount: string;
  readonly transactionId: string;
  readonly referenceId: string;
  readonly authorizationCode: string;
  readonly cardType: string;
  readonly maskedPan: string;
  readonly responseCode: string;
  readonly message: string;
  readonly timestamp: string;
  readonly rawResponse: string;
};

export type NativePaxScanResult = {
  readonly success: boolean;
  readonly runtimeMode: string;
  readonly code: string;
  readonly format: string;
  readonly message: string;
  readonly rawResponse: string;
};

export type NativePaxPrintRequest = {
  readonly html: string;
  readonly title: string;
};

export type NativePaxPrintResult = {
  readonly success: boolean;
  readonly runtimeMode: string;
  readonly message: string;
  readonly previewHtml: string;
  readonly rawResponse: string;
};

export interface Spec extends TurboModule {
  getCapabilities(): Promise<NativePaxCapabilities>;
  initialize(): Promise<NativePaxInitResult>;
  sale(
    request: NativePaxTransactionRequest,
  ): Promise<NativePaxTransactionResult>;
  refund(
    request: NativePaxTransactionRequest,
  ): Promise<NativePaxTransactionResult>;
  scanBarcode(): Promise<NativePaxScanResult>;
  printReceipt(request: NativePaxPrintRequest): Promise<NativePaxPrintResult>;
}

export default TurboModuleRegistry.get<Spec>('PaxSdkModule');
