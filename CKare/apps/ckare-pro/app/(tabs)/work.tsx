import { Text, View } from "react-native";
import { Card, DataRow, PolicyBlockers, PrimaryButton, SectionTitle, ui } from "../../src/components/Primitives";
import { Screen } from "../../src/components/Screen";
import { StatusPill } from "../../src/components/StatusPill";
import { nextBooking } from "../../src/data/demo";
import { useProDemo } from "../../src/ProDemoContext";

export default function Work() {
  const { state, view, dispatch } = useProDemo();
  const documentationLabel = state.work.documentation === "not_started" ? "Start visit checklist" : state.work.documentation === "in_progress" ? "Submit visit documentation" : "Documentation submitted";
  return (
    <Screen eyebrow="Eligible work · Brooklyn" title="Your schedule">
      <Card accent>
        <StatusPill label={nextBooking.authorization} />
        <Text style={ui.title}>{nextBooking.time}</Text>
        <Text style={ui.body}>{nextBooking.person} · {nextBooking.service}{"\n"}{nextBooking.location}</Text>
        <DataRow label="Rate" value={nextBooking.rate} detail="Shown before acceptance" />
        <DataRow label="Tasks" value="4 approved" detail="Meal support, mobility, personal care, notes" />
        <DataRow label="Decision" value={state.work.status} />
        <PolicyBlockers blockers={view.activation.blockers} />
        {state.work.status === "offered" ? <View style={ui.actions}>
          <PrimaryButton label="Accept work" disabled={!view.canAcceptWork} onPress={() => dispatch({ type: "accept-work" })} />
          <PrimaryButton label="Decline work" onPress={() => dispatch({ type: "decline-work" })} />
        </View> : null}
        {state.work.status === "accepted" ? <PrimaryButton label={documentationLabel} disabled={!view.canDocumentVisit || state.work.documentation === "submitted"} onPress={() => dispatch({ type: "advance-documentation" })} /> : null}
        {state.work.status === "declined" ? <Text style={ui.notice}>Offer declined in this local demo. No booking was created.</Text> : null}
      </Card>
      <SectionTitle>Availability</SectionTitle>
      <Card><DataRow label="This week" value="18 hours open" /><DataRow label="Travel radius" value="5 miles" /><DataRow label="Recurring care" value="Preferred" /></Card>
      <Text style={ui.caption}>Only services within your verified scope appear here. CKare is not Emergency services or emergency dispatch.</Text>
    </Screen>
  );
}
