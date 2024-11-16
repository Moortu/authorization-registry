import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from "react";
import { type CreatePolicySet } from "@/network/policy-set";

const defaultValue: CreatePolicySet = {
  access_subject: "",
  policy_issuer: "",
  policies: [],
};

type Context = {
  value: CreatePolicySet;
  changeValue: Dispatch<SetStateAction<CreatePolicySet>>;
};

const newPolicySetContext = createContext<Context>({
  value: defaultValue,
  changeValue: () => {},
});

export function useCreatePolicySetContext() {
  return useContext(newPolicySetContext);
}

export function CreatePolicySetContext({ children }: { children: ReactNode }) {
  const [value, setValue] = useState(defaultValue);

  return (
    <newPolicySetContext.Provider
      value={{
        value,
        changeValue: setValue,
      }}
    >
      {children}
    </newPolicySetContext.Provider>
  );
}
