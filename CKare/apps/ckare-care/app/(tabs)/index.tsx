import { Text, View } from "react-native";
import { Card, DataRow, PolicyBlockers, PrimaryButton, SectionTitle, ui } from "../../src/components/Primitives";
import { Screen } from "../../src/components/Screen";
import { StatusPill } from "../../src/components/StatusPill";
import { useCareDemo } from "../../src/CareDemoContext";

export default function Home() {
  const { view, dispatch } = useCareDemo();
  const { person, coverageReadiness } = view;
  const firstName = person.name.split(" ")[0];
  return (
    <Screen eyebrow={`Care for ${firstName} · ${person.relationship}`} title={`Good morning, ${firstName}`}>
      <View style={ui.hero}>
        <Text style={ui.heroKicker}>{coverageReadiness.label}</Text>
        <Text style={ui.heroTitle}>{coverageReadiness.allowed ? "Your coverage steps are complete for care coordination." : "Coverage steps remain before insured booking."}</Text>
        <Text style={ui.heroBody}>Status checked today. Final payment still depends on the claim and plan rules.</Text>
        <StatusPill label={person.coverage.authorizationLabel} symbol={coverageReadiness.allowed ? "✓" : "!"} tone={coverageReadiness.allowed ? "ready" : "pending"} />
      </View>
      <PolicyBlockers blockers={coverageReadiness.blockers} />
      <View style={ui.grid}><View style={ui.metric}><Text style={ui.metricValue}>{coverageReadiness.allowed ? "3" : "0"}</Text><Text style={ui.metricLabel}>Bookable matches</Text></View><View style={ui.metric}><Text style={ui.metricValue}>{view.visitChecklistStep}/3</Text><Text style={ui.metricLabel}>Visit prep steps</Text></View></View>
      <SectionTitle>Next visit</SectionTitle>
      <Card accent>
        <StatusPill label={coverageReadiness.allowed ? "Confirmed" : "Awaiting authorization"} tone={coverageReadiness.allowed ? "ready" : "pending"} />
        <Text style={ui.title}>{person.nextVisit.provider}</Text>
        <Text style={ui.body}>{person.nextVisit.service}{"\n"}{person.nextVisit.time} · {person.nextVisit.format}</Text>
        <DataRow label="Estimated responsibility" value={person.nextVisit.responsibility} />
        <PrimaryButton label={view.visitChecklistStep === 3 ? "Visit preparation complete" : "Prepare for visit"} disabled={!coverageReadiness.allowed || view.visitChecklistStep === 3} onPress={() => dispatch({ type: "advance-visit-checklist" })} />
      </Card>
      <Text style={ui.caption}>Care for Maya and Leo uses separate fictional local records. CKare is not emergency dispatch. For an immediate medical or safety emergency, contact local emergency services.</Text>
    </Screen>
  );
}
