import { startTransition, useEffect, useReducer } from 'react';
import {
  paxService,
  type PaxCapabilities,
  type PaxInitResult,
  type PaxPrintResult,
  type PaxScanResult,
  type PaxTransactionResult,
} from '../../services/pax';
import {
  createReferenceId,
  isValidAmount,
  normalizeAmountInput,
  prettyJson,
} from '../../utils/format';
import { buildDemoReceiptHtml } from './demoReceipt';

type DemoState = {
  capabilities: PaxCapabilities | null;
  saleAmount: string;
  refundAmount: string;
  isBusy: boolean;
  activeAction: string | null;
  latestSummary: string;
  latestResponse: string;
  latestReceiptPreview: string;
};

type DemoAction =
  | { type: 'bootstrap'; capabilities: PaxCapabilities }
  | { type: 'set-sale-amount'; value: string }
  | { type: 'set-refund-amount'; value: string }
  | { type: 'start'; actionLabel: string }
  | {
      type: 'finish';
      summary: string;
      response: string;
      receiptPreview?: string;
    };

const initialState: DemoState = {
  capabilities: null,
  saleAmount: '24.90',
  refundAmount: '7.50',
  isBusy: false,
  activeAction: null,
  latestSummary: 'Loading demo environment...',
  latestResponse: '',
  latestReceiptPreview: '',
};

function reducer(state: DemoState, action: DemoAction): DemoState {
  switch (action.type) {
    case 'bootstrap':
      return {
        ...state,
        capabilities: action.capabilities,
        latestSummary: action.capabilities.reason,
        latestResponse: prettyJson(action.capabilities),
      };
    case 'set-sale-amount':
      return {
        ...state,
        saleAmount: normalizeAmountInput(action.value),
      };
    case 'set-refund-amount':
      return {
        ...state,
        refundAmount: normalizeAmountInput(action.value),
      };
    case 'start':
      return {
        ...state,
        isBusy: true,
        activeAction: action.actionLabel,
      };
    case 'finish':
      return {
        ...state,
        isBusy: false,
        activeAction: null,
        latestSummary: action.summary,
        latestResponse: action.response,
        latestReceiptPreview:
          action.receiptPreview ?? state.latestReceiptPreview,
      };
    default:
      return state;
  }
}

function getOperationSummary(
  result: PaxInitResult | PaxTransactionResult | PaxScanResult | PaxPrintResult,
) {
  return result.message;
}

export function usePaxDemoController() {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      const capabilities = await paxService.bootstrap();
      if (!isMounted) {
        return;
      }

      dispatch({ type: 'bootstrap', capabilities });
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  async function runAction<
    T extends
      | PaxInitResult
      | PaxTransactionResult
      | PaxScanResult
      | PaxPrintResult,
  >(
    actionLabel: string,
    operation: () => Promise<T>,
    receiptPreview?: (result: T) => string | undefined,
  ) {
    dispatch({ type: 'start', actionLabel });
    const result = await operation();
    startTransition(() => {
      dispatch({
        type: 'finish',
        summary: getOperationSummary(result),
        response: prettyJson(result),
        receiptPreview: receiptPreview?.(result),
      });
    });
  }

  return {
    state,
    setSaleAmount(value: string) {
      dispatch({ type: 'set-sale-amount', value });
    },
    setRefundAmount(value: string) {
      dispatch({ type: 'set-refund-amount', value });
    },
    canRunSale: isValidAmount(state.saleAmount) && !state.isBusy,
    canRunRefund: isValidAmount(state.refundAmount) && !state.isBusy,
    canRunAuxiliary: !state.isBusy,
    async initialize() {
      await runAction('Initializing SDK', () => paxService.initialize());
    },
    async runSale() {
      await runAction('Running sale', () =>
        paxService.sale({
          amount: state.saleAmount,
          referenceId: createReferenceId('SALE'),
        }),
      );
    },
    async runRefund() {
      await runAction('Running refund', () =>
        paxService.refund({
          amount: state.refundAmount,
          referenceId: createReferenceId('RFND'),
        }),
      );
    },
    async scanBarcode() {
      await runAction('Scanning barcode', () => paxService.scanBarcode());
    },
    async printDemoReceipt() {
      const referenceId = createReferenceId('SALE');
      const html = buildDemoReceiptHtml({
        amount: state.saleAmount,
        referenceId,
        runtimeMode: state.capabilities?.runtimeMode ?? 'mock',
      });

      await runAction(
        'Printing receipt',
        () =>
          paxService.printReceipt({
            html,
            title: 'PAX Demo Receipt',
          }),
        result => result.previewHtml,
      );
    },
  };
}
