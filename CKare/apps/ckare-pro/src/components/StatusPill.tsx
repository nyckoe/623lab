import { colors, radius, spacing } from "@ckare/design";
import { StyleSheet, Text, View } from "react-native";

export function StatusPill({ label, symbol = "✓", tone = "ready" }: { label: string; symbol?: string; tone?: "ready" | "pending" | "attention" }) {
  return (
    <View accessibilityLabel={`${label}, ${tone}`} style={[styles.base, styles[tone]]}>
      <Text style={styles.text}>{symbol} {label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: { alignSelf: "flex-start", borderRadius: radius.pill, paddingHorizontal: spacing.sm + 2, paddingVertical: 6 },
  ready: { backgroundColor: colors.mint },
  pending: { backgroundColor: "#F7E9B9" },
  attention: { backgroundColor: colors.coralSoft },
  text: { color: colors.ink, fontSize: 12, fontWeight: "700" },
});
