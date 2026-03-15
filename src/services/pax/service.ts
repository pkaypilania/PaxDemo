import { createMockCapabilities, createMockPaxProvider } from './mock';
import { nativePaxProvider } from './native';
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

class PaxService {
  private provider: PaxProvider = createMockPaxProvider(
    createMockCapabilities('Loading runtime capabilities...'),
  );

  private capabilities: PaxCapabilities = createMockCapabilities(
    'Loading runtime capabilities...',
  );

  async bootstrap(): Promise<PaxCapabilities> {
    try {
      const nativeCapabilities = await nativePaxProvider.getCapabilities();

      if (nativeCapabilities.isNativeSupported) {
        this.provider = nativePaxProvider;
        this.capabilities = nativeCapabilities;
        return nativeCapabilities;
      }

      const mockCapabilities = createMockCapabilities(
        nativeCapabilities.reason,
      );
      this.provider = createMockPaxProvider(mockCapabilities);
      this.capabilities = mockCapabilities;
      return mockCapabilities;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Capability detection failed. Mock mode enabled.';
      const mockCapabilities = createMockCapabilities(message);
      this.provider = createMockPaxProvider(mockCapabilities);
      this.capabilities = mockCapabilities;
      return mockCapabilities;
    }
  }

  initialize(): Promise<PaxInitResult> {
    return this.provider.initialize();
  }

  sale(request: PaxTransactionRequest): Promise<PaxTransactionResult> {
    return this.provider.sale(request);
  }

  refund(request: PaxTransactionRequest): Promise<PaxTransactionResult> {
    return this.provider.refund(request);
  }

  scanBarcode(): Promise<PaxScanResult> {
    return this.provider.scanBarcode();
  }

  printReceipt(request: PaxPrintRequest): Promise<PaxPrintResult> {
    return this.provider.printReceipt(request);
  }
}

export const paxService = new PaxService();
