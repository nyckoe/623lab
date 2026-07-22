import { Text, View } from "react-native";
import { Card, PolicyBlockers, PrimaryButton, SectionTitle, ui } from "../../src/components/Primitives";
import { Screen } from "../../src/components/Screen";
import { StatusPill } from "../../src/components/StatusPill";
import { nextBooking, professional } from "../../src/data/demo";
import { useProDemo } from "../../src/ProDemoContext";

export default function Home() {
  const { view, dispatch } = useProDemo();
  return (
    <Screen eyebrow={`${professional.role} · ${professional.jurisdiction}`} title={`Good morning, ${professional.name.split(" ")[0]}`}>
      <View style={ui.hero}>
        <Text style={ui.heroKicker}>Marketplace activation</Text>
        <Text style={ui.heroTitle}>{view.activation.allowed ? "You can accept work within your verified scope." : "One step remains before you can accept payer-covered work."}</Text>
        <Text style={ui.heroBody}>Shared activation policy checks identity, qualification, credentials, safety checks, payer readiness, and service scope.</Text>
        <StatusPill label={view.activation.label} symbol={view.activation.allowed ? "✓" : "!"} tone={view.activation.allowed ? "ready" : "pending"} />
      </View>
      <PolicyBlockers blockers={view.activation.blockers} />
      <View style={ui.grid}>
        <View style={ui.metric}><Text style={ui.metricValue}>{view.profilePercent}%</Text><Text style={ui.metricLabel}>Profile complete</Text></View>
        <View style={ui.metric}><Text style={ui.metricValue}>3</Text><Text style={ui.metricLabel}>Open private-pay matches</Text></View>
      </View>
      <SectionTitle>Next eligible booking</SectionTitle>
      <Card accent>
        <StatusPill label={nextBooking.authorization} />
        <Text style={ui.title}>{nextBooking.person} · {nextBooking.service}</Text>
        <Text style={ui.body}>{nextBooking.time}{"\n"}{nextBooking.location} · {nextBooking.rate}</Text>
        <PrimaryButton label={view.homeWorkAction.label} disabled={view.homeWorkAction.disabled} onPress={() => dispatch({ type: "accept-work" })} />
      </Card>
      <Text style={ui.caption}>CKare is not emergency dispatch. For an immediate medical or safety emergency, contact local Emergency services.</Text>
    </Screen>
  );
}
