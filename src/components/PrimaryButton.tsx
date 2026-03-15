import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  tone?: 'primary' | 'secondary';
};

export default function PrimaryButton({
  label,
  onPress,
  disabled = false,
  tone = 'primary',
}: PrimaryButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        tone === 'secondary' ? styles.secondaryButton : styles.primaryButton,
        disabled && styles.disabledButton,
        pressed && !disabled ? styles.pressedButton : null,
      ]}
    >
      <Text
        style={[
          styles.label,
          tone === 'secondary' ? styles.secondaryLabel : styles.primaryLabel,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    paddingHorizontal: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  primaryButton: {
    backgroundColor: '#F97316',
    borderColor: '#F97316',
  },
  secondaryButton: {
    backgroundColor: '#E2E8F0',
    borderColor: '#CBD5E1',
  },
  disabledButton: {
    opacity: 0.45,
  },
  pressedButton: {
    transform: [{ scale: 0.98 }],
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
  },
  primaryLabel: {
    color: '#FFF7ED',
  },
  secondaryLabel: {
    color: '#0F172A',
  },
});
