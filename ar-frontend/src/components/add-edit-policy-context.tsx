import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from "react";
import { Policy } from "../network/policy-set";

const defaultValue: Omit<Policy, "id"> = {
  actions: [],
  resource_type: "",
  identifiers: [],
  attributes: [],
  service_providers: [],
  rules: [],
};

type Context = {
  value: Omit<Policy, "id">;
  changeValue: Dispatch<SetStateAction<Omit<Policy, "id">>>;
};

const policyContext = createContext<Context>({
  value: defaultValue,
  changeValue: () => {},
});

export function useAddPolicyContext() {
  return useContext(policyContext);
}

export function AddEditPolicyContext({
  children,
  initialValue,
}: {
  children: ReactNode;
  initialValue?: Omit<Policy, "id">;
}) {
  const [value, setValue] = useState(initialValue || defaultValue);

  return (
    <policyContext.Provider
      value={{
        value,
        changeValue: setValue,
      }}
    >
      {children}
    </policyContext.Provider>
  );
}
