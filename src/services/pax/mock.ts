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

const MOCK_LATENCY_MS = 350;

function wait() {
  return new Promise(resolve => setTimeout(() => resolve(true), MOCK_LATENCY_MS));
}

function createReference(prefix: string) {
  return `${prefix}-${Math.random().toString(16).slice(2, 10).toUpperCase()}`;
}

function nowIso() {
  return new Date().toISOString();
}

export function createMockCapabilities(reason: string): PaxCapabilities {
  return {
    platform: 'android',
    runtimeMode: 'mock',
    isNativeSupported: false,
    isSdkAvailable: false,
    canInitialize: true,
    canTransact: true,
    canScan: true,
    canPrint: true,
    manufacturer: 'Demo',
    model: 'Mock Terminal',
    sdkVersion: 'Mock SDK 1.0',
    reason,
  };
}

export function createMockPaxProvider(
  capabilities: PaxCapabilities,
): PaxProvider {
  return {
    async getCapabilities() {
      await wait();
      return capabilities;
    },

    async initialize(): Promise<PaxInitResult> {
      await wait();
      const payload = {
        initialized: true,
        deviceId: 'MOCK-PAX-DEVICE-01',
        serialNumber: 'MOCK123456789',
        sdkVersion: capabilities.sdkVersion,
        runtimeMode: 'mock',
      };

      return {
        success: true,
        runtimeMode: 'mock',
        message: 'Mock PAX SDK initialized successfully.',
        deviceId: payload.deviceId,
        serialNumber: payload.serialNumber,
        sdkVersion: payload.sdkVersion,
        rawResponse: JSON.stringify(payload, null, 2),
      };
    },

    async sale(request: PaxTransactionRequest): Promise<PaxTransactionResult> {
      await wait();
      const payload = {
        approved: true,
        transactionType: 'SALE',
        transactionId: createReference('SALE'),
        authCode: 'A1B2C3',
        pan: '************4242',
        cardType: 'VISA',
        amount: request.amount,
        responseCode: '000000',
        message: 'Mock sale approved.',
      };

      return {
        success: true,
        runtimeMode: 'mock',
        type: 'sale',
        amount: request.amount,
        transactionId: payload.transactionId,
        referenceId: request.referenceId,
        authorizationCode: payload.authCode,
        cardType: payload.cardType,
        maskedPan: payload.pan,
        responseCode: payload.responseCode,
        message: payload.message,
        timestamp: nowIso(),
        rawResponse: JSON.stringify(payload, null, 2),
      };
    },

    async refund(
      request: PaxTransactionRequest,
    ): Promise<PaxTransactionResult> {
      await wait();
      const payload = {
        approved: true,
        transactionType: 'REFUND',
        transactionId: createReference('RFND'),
        authCode: 'R4F8N2',
        pan: '************4242',
        cardType: 'VISA',
        amount: request.amount,
        responseCode: '000000',
        message: 'Mock refund approved.',
      };

      return {
        success: true,
        runtimeMode: 'mock',
        type: 'refund',
        amount: request.amount,
        transactionId: payload.transactionId,
        referenceId: request.referenceId,
        authorizationCode: payload.authCode,
        cardType: payload.cardType,
        maskedPan: payload.pan,
        responseCode: payload.responseCode,
        message: payload.message,
        timestamp: nowIso(),
        rawResponse: JSON.stringify(payload, null, 2),
      };
    },

    async scanBarcode(): Promise<PaxScanResult> {
      await wait();
      const payload = {
        barcode: '012345678905',
        format: 'EAN13',
        message: 'Mock barcode scanned successfully.',
      };

      return {
        success: true,
        runtimeMode: 'mock',
        code: payload.barcode,
        format: payload.format,
        message: payload.message,
        rawResponse: JSON.stringify(payload, null, 2),
      };
    },

    async printReceipt(request: PaxPrintRequest): Promise<PaxPrintResult> {
      await wait();
      const payload = {
        printed: true,
        printer: 'Mock thermal printer',
        title: request.title,
      };

      return {
        success: true,
        runtimeMode: 'mock',
        message: 'Mock receipt printed successfully.',
        previewHtml: request.html,
        rawResponse: JSON.stringify(payload, null, 2),
      };
    },
  };
}
