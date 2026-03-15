import React, { useDeferredValue } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PrimaryButton from '../../components/PrimaryButton';
import SectionCard from '../../components/SectionCard';
import { formatCurrency } from '../../utils/format';
import { usePaxDemoController } from './usePaxDemoController';

function ModeBadge({
  label,
  tone,
}: {
  label: string;
  tone: 'native' | 'mock';
}) {
  return (
    <View
      style={[
        styles.badge,
        tone === 'native' ? styles.nativeBadge : styles.mockBadge,
      ]}
    >
      <Text
        style={[
          styles.badgeLabel,
          tone === 'native' ? styles.nativeBadgeLabel : styles.mockBadgeLabel,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

function CapabilityRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.capabilityRow}>
      <Text style={styles.capabilityLabel}>{label}</Text>
      <Text style={styles.capabilityValue}>{value}</Text>
    </View>
  );
}

export default function PaxDemoScreen() {
  const controller = usePaxDemoController();
  const { state } = controller;
  const deferredResponse = useDeferredValue(state.latestResponse);
  const deferredReceiptPreview = useDeferredValue(state.latestReceiptPreview);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.backgroundGlowTop} />
      <View style={styles.backgroundGlowBottom} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.heroCard}>
            <Text style={styles.kicker}>PAXSTORE REFERENCE DEMO</Text>
            <Text style={styles.heroTitle}>
              TurboModule-first PAX SDK showcase
            </Text>
            <Text style={styles.heroBody}>
              This app demonstrates sale, refund, scan, and print flows in one
              place. Unsupported devices automatically switch to mock mode so
              the entire demo remains runnable.
            </Text>
            <View style={styles.heroFooter}>
              <ModeBadge
                label={
                  state.capabilities?.runtimeMode === 'native'
                    ? 'Real PAX Mode'
                    : 'Mock Mode'
                }
                tone={
                  state.capabilities?.runtimeMode === 'native'
                    ? 'native'
                    : 'mock'
                }
              />
              <Text style={styles.heroStatus}>
                {state.activeAction ?? state.latestSummary}
              </Text>
            </View>
          </View>

          <SectionCard
            title="Environment"
            subtitle="The service layer selects native or mock execution at runtime."
            accessory={
              <ModeBadge
                label={(
                  state.capabilities?.manufacturer ?? 'Detecting'
                ).toUpperCase()}
                tone={
                  state.capabilities?.runtimeMode === 'native'
                    ? 'native'
                    : 'mock'
                }
              />
            }
          >
            <CapabilityRow
              label="Support"
              value={
                state.capabilities?.isNativeSupported
                  ? 'Native device detected'
                  : 'Fallback to mock mode'
              }
            />
            <CapabilityRow
              label="SDK"
              value={state.capabilities?.sdkVersion ?? 'Detecting'}
            />
            <CapabilityRow
              label="Model"
              value={state.capabilities?.model ?? 'Detecting'}
            />
            <CapabilityRow
              label="Reason"
              value={state.capabilities?.reason ?? 'Resolving environment'}
            />
            <PrimaryButton
              disabled={!controller.canRunAuxiliary}
              label={state.isBusy ? 'Working...' : 'Initialize SDK'}
              onPress={() => {
                void controller.initialize();
              }}
            />
          </SectionCard>

          <SectionCard
            title="Transactions"
            subtitle="Use simple amount inputs to demonstrate sale and refund flows."
          >
            <View style={styles.transactionGrid}>
              <View style={styles.transactionColumn}>
                <Text style={styles.inputLabel}>Sale amount</Text>
                <TextInput
                  keyboardType="decimal-pad"
                  onChangeText={controller.setSaleAmount}
                  placeholder="0.00"
                  placeholderTextColor="#64748B"
                  style={styles.input}
                  value={state.saleAmount}
                />
                <Text style={styles.helperText}>
                  {formatCurrency(state.saleAmount)}
                </Text>
                <PrimaryButton
                  disabled={!controller.canRunSale}
                  label="Run Sale"
                  onPress={() => {
                    void controller.runSale();
                  }}
                />
              </View>

              <View style={styles.transactionColumn}>
                <Text style={styles.inputLabel}>Refund amount</Text>
                <TextInput
                  keyboardType="decimal-pad"
                  onChangeText={controller.setRefundAmount}
                  placeholder="0.00"
                  placeholderTextColor="#64748B"
                  style={styles.input}
                  value={state.refundAmount}
                />
                <Text style={styles.helperText}>
                  {formatCurrency(state.refundAmount)}
                </Text>
                <PrimaryButton
                  disabled={!controller.canRunRefund}
                  label="Run Refund"
                  onPress={() => {
                    void controller.runRefund();
                  }}
                  tone="secondary"
                />
              </View>
            </View>
          </SectionCard>

          <SectionCard
            title="Device Actions"
            subtitle="These flows exercise scanner and printer capabilities, with mock responses on unsupported hardware."
          >
            <View style={styles.actionGrid}>
              <PrimaryButton
                disabled={!controller.canRunAuxiliary}
                label="Scan Barcode"
                onPress={() => {
                  void controller.scanBarcode();
                }}
              />
              <PrimaryButton
                disabled={!controller.canRunAuxiliary}
                label="Print Demo Receipt"
                onPress={() => {
                  void controller.printDemoReceipt();
                }}
                tone="secondary"
              />
            </View>
            <Text style={styles.helperText}>
              The print flow uses a built-in HTML receipt template designed for
              public demo repos and quick SDK validation.
            </Text>
          </SectionCard>

          <SectionCard
            title="Raw Response"
            subtitle="Expose the last payload so developers can inspect shape, fields, and integration expectations."
          >
            <Text style={styles.codeBlock}>
              {deferredResponse || 'No operation executed yet.'}
            </Text>
          </SectionCard>

          <SectionCard
            title="Receipt Preview Source"
            subtitle="The last generated receipt template is shown here so teams can replace it with their own branding."
          >
            <Text style={styles.codeBlock}>
              {deferredReceiptPreview ||
                'Run the print demo to inspect the generated receipt HTML.'}
            </Text>
          </SectionCard>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#020617',
  },
  flex: {
    flex: 1,
  },
  backgroundGlowTop: {
    position: 'absolute',
    top: -80,
    right: -40,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(249, 115, 22, 0.28)',
  },
  backgroundGlowBottom: {
    position: 'absolute',
    bottom: 60,
    left: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(14, 165, 233, 0.18)',
  },
  contentContainer: {
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 16,
  },
  heroCard: {
    borderRadius: 28,
    padding: 22,
    backgroundColor: '#0B1220',
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.24)',
    gap: 10,
  },
  kicker: {
    color: '#FDBA74',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.6,
  },
  heroTitle: {
    color: '#F8FAFC',
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '900',
  },
  heroBody: {
    color: '#CBD5E1',
    fontSize: 15,
    lineHeight: 22,
  },
  heroFooter: {
    marginTop: 8,
    gap: 10,
  },
  heroStatus: {
    color: '#E2E8F0',
    fontSize: 14,
    lineHeight: 20,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  nativeBadge: {
    backgroundColor: 'rgba(34, 197, 94, 0.16)',
  },
  mockBadge: {
    backgroundColor: 'rgba(14, 165, 233, 0.16)',
  },
  badgeLabel: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  nativeBadgeLabel: {
    color: '#86EFAC',
  },
  mockBadgeLabel: {
    color: '#7DD3FC',
  },
  capabilityRow: {
    gap: 4,
  },
  capabilityLabel: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  capabilityValue: {
    color: '#E2E8F0',
    fontSize: 14,
    lineHeight: 20,
  },
  transactionGrid: {
    gap: 14,
  },
  transactionColumn: {
    gap: 10,
  },
  inputLabel: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '700',
  },
  input: {
    minHeight: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#334155',
    backgroundColor: '#E2E8F0',
    color: '#0F172A',
    paddingHorizontal: 14,
    fontSize: 18,
    fontWeight: '700',
  },
  helperText: {
    color: '#94A3B8',
    fontSize: 13,
    lineHeight: 18,
  },
  actionGrid: {
    gap: 12,
  },
  codeBlock: {
    borderRadius: 18,
    padding: 14,
    backgroundColor: 'rgba(2, 6, 23, 0.88)',
    color: '#BFDBFE',
    fontSize: 12,
    lineHeight: 18,
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }),
  },
});
