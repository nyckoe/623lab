import { Text } from "react-native";
import { Card, DataRow, PolicyBlockers, PrimaryButton, SectionTitle, ui } from "../../src/components/Primitives";
import { Screen } from "../../src/components/Screen";
import { StatusPill } from "../../src/components/StatusPill";
import { useCareDemo } from "../../src/CareDemoContext";

export default function Coverage() {
  const { view, dispatch } = useCareDemo();
  const { person, coverageReadiness } = view;
  return (
    <Screen eyebrow={`Care for ${person.name.split(" ")[0]} · Insurance`} title="Coverage steps">
      <Card accent><StatusPill label={coverageReadiness.label} symbol={coverageReadiness.allowed ? "✓" : "!"} tone={coverageReadiness.allowed ? "ready" : "pending"} /><Text style={ui.title}>{person.coverage.payer}</Text><Text style={ui.caption}>{person.coverage.checked}</Text></Card>
      <SectionTitle>What we verified</SectionTitle>
      <Card>
        <DataRow label="Identity" value={person.coverageState.identityVerified ? "Verified" : "Required"} />
        <DataRow label="Coverage" value={person.coverageState.coverageActive ? "Active" : "Inactive"} />
        <DataRow label="Benefit" value={person.coverageState.benefitFound ? "Found" : "Not confirmed"} />
        <DataRow label="Provider network" value={person.coverageState.providerInNetwork ? "In network" : "Not confirmed"} />
        <DataRow label="Authorization" value={person.coverage.authorizationLabel} />
        <DataRow label="Estimated responsibility" value={person.coverage.responsibility} />
        <PolicyBlockers blockers={coverageReadiness.blockers} />
        <PrimaryButton label={view.coverageHelpStatus === "requested" ? "Coverage help requested" : "Get help with coverage"} disabled={view.coverageHelpStatus === "requested"} onPress={() => dispatch({ type: "request-coverage-help" })} />
      </Card>
      <Text style={ui.body}>Insurance verification does not guarantee payment. Benefits, network status, authorization, medical necessity, place of service, and claim processing can affect final responsibility.</Text>
    </Screen>
  );
}
