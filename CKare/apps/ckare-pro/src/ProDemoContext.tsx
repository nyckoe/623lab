import { createContext, type Dispatch, type PropsWithChildren, useContext, useMemo, useReducer } from "react";
import {
  createProDemoState,
  getProViewModel,
  proDemoReducer,
  type ProDemoAction,
  type ProDemoState,
} from "./workflow";

interface ProDemoContextValue {
  state: ProDemoState;
  view: ReturnType<typeof getProViewModel>;
  dispatch: Dispatch<ProDemoAction>;
}

const ProDemoContext = createContext<ProDemoContextValue | null>(null);

export function ProDemoProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(proDemoReducer, undefined, createProDemoState);
  const value = useMemo(() => ({ state, view: getProViewModel(state), dispatch }), [state]);
  return <ProDemoContext.Provider value={value}>{children}</ProDemoContext.Provider>;
}

export function useProDemo() {
  const value = useContext(ProDemoContext);
  if (!value) throw new Error("useProDemo must be used inside ProDemoProvider");
  return value;
}
