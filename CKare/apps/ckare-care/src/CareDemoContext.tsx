import { createContext, type Dispatch, type PropsWithChildren, useContext, useMemo, useReducer } from "react";
import {
  careDemoReducer,
  createCareDemoState,
  getCareViewModel,
  type CareDemoAction,
  type CareDemoState,
} from "./workflow";

interface CareDemoContextValue {
  state: CareDemoState;
  view: ReturnType<typeof getCareViewModel>;
  dispatch: Dispatch<CareDemoAction>;
}

const CareDemoContext = createContext<CareDemoContextValue | null>(null);

export function CareDemoProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(careDemoReducer, undefined, createCareDemoState);
  const value = useMemo(() => ({ state, view: getCareViewModel(state), dispatch }), [state]);
  return <CareDemoContext.Provider value={value}>{children}</CareDemoContext.Provider>;
}

export function useCareDemo() {
  const value = useContext(CareDemoContext);
  if (!value) throw new Error("useCareDemo must be used inside CareDemoProvider");
  return value;
}
