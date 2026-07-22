import { Text, View } from "react-native";
import { Card, PrimaryButton, SectionTitle, ui } from "../../src/components/Primitives";
import { Screen } from "../../src/components/Screen";
import { StatusPill } from "../../src/components/StatusPill";
import { qualificationSteps } from "../../src/data/demo";
import { useProDemo } from "../../src/ProDemoContext";

export default function Learn() {
  const { state, dispatch } = useProDemo();
  const learningComplete = state.learning.completedModules === state.learning.totalModules;
  return (
    <Screen eyebrow="Qualifications · New York" title="Your learning path">
      <Card accent>
        <Text style={ui.heroKicker}>Direct-care track</Text>
        <Text style={ui.title}>Dementia communication</Text>
        <Text style={ui.body}>{state.learning.completedModules} of {state.learning.totalModules} modules complete · 18 minutes remaining</Text>
        <View style={ui.divider} />
        <Text style={ui.caption}>Course completion is not a license, certificate, registry approval, or payer credential.</Text>
        <PrimaryButton label={learningComplete ? "Learning track complete" : "Complete next module"} disabled={learningComplete} onPress={() => dispatch({ type: "continue-learning" })} />
      </Card>
      <SectionTitle>Qualification status</SectionTitle>
      <Card>
        {qualificationSteps.map((step) => <View key={step.label} style={ui.step}><Text style={ui.stepMark}>{step.state === "In review" ? "!" : "✓"}</Text><Text style={ui.stepCopy}>{step.label}{"\n"}<Text style={ui.caption}>{step.state}</Text></Text></View>)}
      </Card>
      <SectionTitle>ASWB exam preparation</SectionTitle>
      <Card>
        <StatusPill label="Original CKare content" />
        <Text style={ui.title}>Clinical reasoning practice</Text>
        <Text style={ui.body}>Blueprint-aligned study support. CKare does not grant licensure or guarantee an exam result.</Text>
        {state.learning.preparationOpen ? <Text style={ui.notice}>Preparation track opened locally: 12 original practice scenarios are ready.</Text> : null}
        <PrimaryButton label={state.learning.preparationOpen ? "Preparation track open" : "View preparation track"} disabled={state.learning.preparationOpen} onPress={() => dispatch({ type: "open-preparation-track" })} />
      </Card>
    </Screen>
  );
}
