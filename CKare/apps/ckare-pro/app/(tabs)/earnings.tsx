import { Text, View } from "react-native";
import { Card, DataRow, PrimaryButton, SectionTitle, ui } from "../../src/components/Primitives";
import { Screen } from "../../src/components/Screen";
import { StatusPill } from "../../src/components/StatusPill";
import { claimRows } from "../../src/data/demo";
import { useProDemo } from "../../src/ProDemoContext";

export default function Earnings() {
  const { state, dispatch } = useProDemo();
  return (
    <Screen eyebrow="Payments · July" title="Earnings and claims">
      <View style={ui.hero}><Text style={ui.heroKicker}>Estimated payout—not guaranteed</Text><Text style={ui.amount}>$1,248.50</Text><Text style={ui.heroBody}>Expected Jul 25 after accepted claims and disclosed adjustments.</Text></View>
      <View style={ui.grid}><View style={ui.metric}><Text style={ui.metricValue}>$2,106</Text><Text style={ui.metricLabel}>Paid this month</Text></View><View style={ui.metric}><Text style={ui.metricValue}>$220.50</Text><Text style={ui.metricLabel}>Claims pending</Text></View></View>
      <SectionTitle aside={<StatusPill label="Updated today" />}>Recent activity</SectionTitle>
      <Card>
        {claimRows.map((row) => <DataRow key={row.label} {...row} />)}
        <PrimaryButton label="View documentation-needed claim" onPress={() => dispatch({ type: "show-claim-detail", claimId: "visit-jul-12" })} />
        {state.selectedClaimId ? <Text style={ui.notice}>Claim detail: Jul 12 documentation is needed before this fictional claim can proceed. No payout is guaranteed.</Text> : null}
      </Card>
      <Text style={ui.caption}>Claim acceptance and coverage verification do not guarantee payment. Denials, appeals, adjustments, and recoupments remain visible.</Text>
    </Screen>
  );
}
