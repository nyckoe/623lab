import type { ProviderSummary } from "./types.ts";

export const demoProviders: ProviderSummary[] = [
  {
    id: "provider-demo-1",
    name: "Elena Rivera, LMSW",
    credential: "New York LMSW · verified",
    service: "Care coordination",
    languages: ["English", "Spanish"],
    distanceMiles: 1.8,
    nextAvailable: "Today · 3:30 PM",
  },
  {
    id: "provider-demo-2",
    name: "Marcus Lee, HHA",
    credential: "New York HHA · verified",
    service: "In-home personal care",
    languages: ["English", "Mandarin"],
    distanceMiles: 2.4,
    nextAvailable: "Tomorrow · 9:00 AM",
  },
];
