import { createFileRoute, Outlet } from "@tanstack/react-router";
import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useState,
} from "react";
import { Typography } from "@mui/joy";
import { type CreatePolicySet } from "@/network/policy-set";

export const Route = createFileRoute("/__auth/admin/new_policy_set")({
  component: Component,
});

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

function Component() {
  const [value, setValue] = useState(defaultValue);

  return (
    <newPolicySetContext.Provider
      value={{
        value,
        changeValue: setValue,
      }}
    >
      <Typography paddingBottom={2} level="h2">
        New policy set
      </Typography>
      <Outlet />
    </newPolicySetContext.Provider>
  );
}
