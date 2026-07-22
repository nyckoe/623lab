import { Text } from "react-native";
import { Card, DataRow, PrimaryButton, SectionTitle, ui } from "../../src/components/Primitives";
import { Screen } from "../../src/components/Screen";
import { StatusPill } from "../../src/components/StatusPill";
import { useCareDemo } from "../../src/CareDemoContext";

export default function Profile() {
  const { state, view, dispatch } = useCareDemo();
  const { person } = view;
  const otherPersonId = person.id === "maya" ? "leo" : "maya";
  const otherName = otherPersonId === "maya" ? "Maya" : "Leo";
  return (
    <Screen eyebrow={`${person.name} · ${person.context}`} title="People and preferences">
      <Card accent><StatusPill label="Identity verified" /><Text style={ui.title}>Care for {person.name.split(" ")[0]}</Text><Text style={ui.body}>{person.relationship}. Representative: {person.representative}. Production access requires verified authority.</Text></Card>
      <SectionTitle>Care contexts</SectionTitle>
      <Card>
        <DataRow label={person.name} value={`${person.relationship} · active`} />
        <PrimaryButton label={`Switch to ${otherName}`} onPress={() => dispatch({ type: "switch-person", personId: otherPersonId })} />
        <Text style={ui.caption}>Switching changes coverage, provider, visit, preferences, booking, and checklist data together.</Text>
      </Card>
      <SectionTitle>Preferences</SectionTitle>
      <Card><DataRow label="Language" value={person.preferences.language} /><DataRow label="Accessibility" value={person.preferences.accessibility} /><DataRow label="Reminders" value={person.preferences.reminders} /></Card>
      <SectionTitle>Privacy and support</SectionTitle>
      <Card>
        <Text style={ui.link}>Export my data</Text>
        <PrimaryButton label={state.supportStatus === "requested" ? "Support request queued" : "Contact support"} disabled={state.supportStatus === "requested"} onPress={() => dispatch({ type: "request-support" })} />
        <Text style={ui.link}>Privacy policy and terms</Text>
        <PrimaryButton label={state.signedIn ? "Sign out of local demo" : "Sign in to local demo"} onPress={() => dispatch({ type: "toggle-sign-in" })} />
        <DataRow label="Demo sign-in" value={state.signedIn ? "Signed in" : "Signed out"} />
        {state.deletionStatus === "idle" ? <PrimaryButton label="Delete account" onPress={() => dispatch({ type: "start-deletion" })} /> : null}
        {state.deletionStatus === "confirming" ? <>
          <Text accessibilityRole="alert" style={ui.notice}>Confirm submission of an account-deletion request. This local demo does not delete server data.</Text>
          <PrimaryButton label="Confirm deletion request" onPress={() => dispatch({ type: "confirm-deletion" })} />
          <PrimaryButton label="Keep account" onPress={() => dispatch({ type: "cancel-deletion" })} />
        </> : null}
        {state.deletionStatus === "pending" ? <Text accessibilityRole="alert" style={ui.notice}>Deletion request submitted and pending owner-controlled production processing.</Text> : null}
      </Card>
    </Screen>
  );
}
