import { Text } from "react-native";
import { Card, DataRow, PrimaryButton, SectionTitle, ui } from "../../src/components/Primitives";
import { Screen } from "../../src/components/Screen";
import { StatusPill } from "../../src/components/StatusPill";
import { useProDemo } from "../../src/ProDemoContext";

export default function Profile() {
  const { state, view, dispatch } = useProDemo();
  return (
    <Screen eyebrow="Jordan Ellis · HHA" title="Credentials and settings">
      <Card accent>
        <StatusPill label="Identity verified" />
        <Text style={ui.title}>New York Home Health Aide</Text>
        <Text style={ui.body}>Certificate verified · expires May 18, 2027</Text>
        <DataRow label="Background check" value="Cleared" detail="Checked Jul 2, 2026" />
        <DataRow label="Payer enrollment" value={state.activationState.payerReady ? "Demo complete" : "In review"} detail="Marketplace activation follows shared policy" />
        <PrimaryButton label={state.activationState.payerReady ? "Credential progress complete" : "Complete demo payer review"} disabled={state.activationState.payerReady} onPress={() => dispatch({ type: "complete-credential-progress" })} />
        {view.activation.blockers.map((blocker) => <Text key={blocker} style={ui.caption}>Blocked: {blocker}</Text>)}
      </Card>
      <SectionTitle>Practice preferences</SectionTitle>
      <Card><DataRow label="Languages" value="English, Spanish" /><DataRow label="Service area" value="Brooklyn · 5 mi" /><DataRow label="Accessibility" value="Text size: Large" /></Card>
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
