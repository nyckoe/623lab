import { Text, TextInput } from "react-native";
import { Card, DataRow, PolicyBlockers, PrimaryButton, SectionTitle, ui } from "../../src/components/Primitives";
import { Screen } from "../../src/components/Screen";
import { StatusPill } from "../../src/components/StatusPill";
import { useCareDemo } from "../../src/CareDemoContext";

export default function FindCare() {
  const { view, dispatch } = useCareDemo();
  const { person } = view;
  if (view.findCare.mode === "emergency") {
    return (
      <Screen eyebrow={`Care for ${person.name.split(" ")[0]} · Emergency resources`} title="Get immediate help">
        <Card accent><Text accessibilityRole="alert" style={ui.notice}>{view.findCare.guidance}</Text></Card>
        <Text style={ui.caption}>Urgent or self-harm language exits matching to 911/988 guidance. CKare is not emergency dispatch.</Text>
      </Screen>
    );
  }
  return (
    <Screen eyebrow={`Care for ${person.name.split(" ")[0]} · Search`} title="Find care that fits">
      <Card accent>
        <Text style={ui.title}>What kind of support do you need?</Text>
        <TextInput accessibilityLabel="Describe care need" style={ui.input} value={view.requestText} onChangeText={(text) => dispatch({ type: "update-care-request-text", text })} />
        <PrimaryButton label="Route care request" onPress={() => dispatch({ type: "route-care-request" })} />
        <Text style={ui.caption}>{view.findCare.guidance}</Text>
      </Card>
      <SectionTitle>Best eligible match</SectionTitle>
      <Card>
        <StatusPill label={view.findCare.match.credential} />
        <Text style={ui.title}>{view.findCare.match.name}</Text>
        <Text style={ui.body}>{view.findCare.match.fit}{"\n"}{view.findCare.match.next} · {view.findCare.match.distance}</Text>
        <DataRow label="Network" value={person.coverageState.providerInNetwork ? "In network" : "Not confirmed"} />
        <DataRow label="Estimated responsibility" value={person.coverage.responsibility} />
        <PolicyBlockers blockers={view.coverageReadiness.blockers} />
        <PrimaryButton label={view.findCare.booking.status === "requested" ? "Booking request submitted" : "Request booking"} disabled={!view.findCare.booking.enabled} onPress={() => dispatch({ type: "request-booking" })} />
      </Card>
      <Text style={ui.caption}>Urgent or self-harm language exits matching to 911/988 guidance. CKare is not emergency dispatch.</Text>
    </Screen>
  );
}
