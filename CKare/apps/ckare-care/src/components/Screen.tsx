import { colors, spacing } from "@ckare/design";
import type { PropsWithChildren, ReactNode } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export function Screen({ title, eyebrow, action, children }: PropsWithChildren<{ title: string; eyebrow: string; action?: ReactNode }>) {
  return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.content}><View style={styles.header}><View style={styles.heading}><Text style={styles.eyebrow}>{eyebrow}</Text><Text accessibilityRole="header" style={styles.title}>{title}</Text></View>{action}</View>{children}</ScrollView></SafeAreaView>;
}

const styles = StyleSheet.create({safe:{flex:1,backgroundColor:colors.paper},content:{padding:spacing.lg,paddingBottom:100,gap:spacing.md},header:{flexDirection:"row",alignItems:"flex-start",justifyContent:"space-between",gap:spacing.md},heading:{flex:1,gap:spacing.xs},eyebrow:{color:colors.mintDeep,fontSize:12,fontWeight:"700",letterSpacing:1.4,textTransform:"uppercase"},title:{color:colors.ink,fontFamily:"Georgia",fontSize:34,lineHeight:39}});
