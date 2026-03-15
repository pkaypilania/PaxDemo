import { Platform } from 'react-native';
import NativePaxSdk from '../../specs/NativePaxSdk';
import type {
  PaxCapabilities,
  PaxInitResult,
  PaxPrintRequest,
  PaxPrintResult,
  PaxProvider,
  PaxScanResult,
  PaxTransactionRequest,
  PaxTransactionResult,
} from './types';

const unsupportedCapabilities: PaxCapabilities = {
  platform: Platform.OS,
  runtimeMode: 'mock',
  isNativeSupported: false,
  isSdkAvailable: false,
  canInitialize: false,
  canTransact: false,
  canScan: false,
  canPrint: false,
  manufacturer: 'Unknown',
  model: 'Unsupported',
  sdkVersion: 'Unavailable',
  reason:
    Platform.OS === 'android'
      ? 'PAX native module is not registered. The demo will run in mock mode.'
      : 'PAX native mode is Android-only in this demo. The app will run in mock mode.',
};

function ensureModule() {
  return NativePaxSdk;
}

export const nativePaxProvider: PaxProvider = {
  async getCapabilities() {
    const module = ensureModule();
    if (!module) {
      return unsupportedCapabilities;
    }

    const capabilities = await module.getCapabilities();
    return {
      ...capabilities,
      runtimeMode: capabilities.runtimeMode === 'native' ? 'native' : 'mock',
    };
  },

  async initialize(): Promise<PaxInitResult> {
    const module = ensureModule();
    if (!module) {
      return {
        success: false,
        runtimeMode: 'mock',
        message: unsupportedCapabilities.reason,
        deviceId: '',
        serialNumber: '',
        sdkVersion: unsupportedCapabilities.sdkVersion,
        rawResponse: JSON.stringify(unsupportedCapabilities, null, 2),
      };
    }

    const result = await module.initialize();
    return {
      ...result,
      runtimeMode: result.runtimeMode === 'native' ? 'native' : 'mock',
    };
  },

  async sale(request: PaxTransactionRequest): Promise<PaxTransactionResult> {
    const module = ensureModule();
    if (!module) {
      return {
        success: false,
        runtimeMode: 'mock',
        type: 'sale',
        amount: request.amount,
        transactionId: '',
        referenceId: request.referenceId,
        authorizationCode: '',
        cardType: '',
        maskedPan: '',
        responseCode: 'UNAVAILABLE',
        message: unsupportedCapabilities.reason,
        timestamp: new Date().toISOString(),
        rawResponse: JSON.stringify(unsupportedCapabilities, null, 2),
      };
    }

    const result = await module.sale(request);
    return {
      ...result,
      type: 'sale',
      runtimeMode: result.runtimeMode === 'native' ? 'native' : 'mock',
    };
  },

  async refund(request: PaxTransactionRequest): Promise<PaxTransactionResult> {
    const module = ensureModule();
    if (!module) {
      return {
        success: false,
        runtimeMode: 'mock',
        type: 'refund',
        amount: request.amount,
        transactionId: '',
        referenceId: request.referenceId,
        authorizationCode: '',
        cardType: '',
        maskedPan: '',
        responseCode: 'UNAVAILABLE',
        message: unsupportedCapabilities.reason,
        timestamp: new Date().toISOString(),
        rawResponse: JSON.stringify(unsupportedCapabilities, null, 2),
      };
    }

    const result = await module.refund(request);
    return {
      ...result,
      type: 'refund',
      runtimeMode: result.runtimeMode === 'native' ? 'native' : 'mock',
    };
  },

  async scanBarcode(): Promise<PaxScanResult> {
    const module = ensureModule();
    if (!module) {
      return {
        success: false,
        runtimeMode: 'mock',
        code: '',
        format: '',
        message: unsupportedCapabilities.reason,
        rawResponse: JSON.stringify(unsupportedCapabilities, null, 2),
      };
    }

    const result = await module.scanBarcode();
    return {
      ...result,
      runtimeMode: result.runtimeMode === 'native' ? 'native' : 'mock',
    };
  },

  async printReceipt(request: PaxPrintRequest): Promise<PaxPrintResult> {
    const module = ensureModule();
    if (!module) {
      return {
        success: false,
        runtimeMode: 'mock',
        message: unsupportedCapabilities.reason,
        previewHtml: request.html,
        rawResponse: JSON.stringify(unsupportedCapabilities, null, 2),
      };
    }

    const result = await module.printReceipt(request);
    return {
      ...result,
      runtimeMode: result.runtimeMode === 'native' ? 'native' : 'mock',
    };
  },
};
