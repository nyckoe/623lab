import { Text } from "react-native";
import { Card, DataRow, PolicyBlockers, PrimaryButton, SectionTitle, ui } from "../../src/components/Primitives";
import { Screen } from "../../src/components/Screen";
import { StatusPill } from "../../src/components/StatusPill";
import { useCareDemo } from "../../src/CareDemoContext";

const checklist = ["Consent", "Goals", "Device or arrival check"];

export default function Visits() {
  const { view, dispatch } = useCareDemo();
  const { person, coverageReadiness, visitChecklistStep } = view;
  return (
    <Screen eyebrow={`Care for ${person.name.split(" ")[0]} · Visits`} title="Your visits">
      <Card accent>
        <StatusPill label={coverageReadiness.allowed ? "Confirmed" : "Authorization pending"} tone={coverageReadiness.allowed ? "ready" : "pending"} />
        <Text style={ui.title}>{person.nextVisit.time}</Text>
        <Text style={ui.body}>{person.nextVisit.provider}{"\n"}{person.nextVisit.service} · {person.nextVisit.format}</Text>
        <DataRow label="Coverage" value={person.coverage.authorizationLabel} />
        <DataRow label="Estimated responsibility" value={person.nextVisit.responsibility} />
        <DataRow label="Cancellation" value="No fee before 24h" />
        <PolicyBlockers blockers={coverageReadiness.blockers} />
        <PrimaryButton label={visitChecklistStep === checklist.length ? "Visit checklist complete" : "Complete next checklist step"} disabled={!coverageReadiness.allowed || visitChecklistStep === checklist.length} onPress={() => dispatch({ type: "advance-visit-checklist" })} />
      </Card>
      <SectionTitle>Preparation</SectionTitle>
      <Card>{checklist.map((label, index) => <DataRow key={label} label={label} value={index < visitChecklistStep ? "Complete" : "Not started"} />)}</Card>
      <Text style={ui.caption}>A coverage estimate does not guarantee payment. Your final responsibility may change after the payer processes the claim.</Text>
    </Screen>
  );
}
