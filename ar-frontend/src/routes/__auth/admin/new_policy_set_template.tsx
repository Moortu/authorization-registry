import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from "react";
import { CreatePolicySetTemplate } from "@/network/policy-set-templates";
import { Typography } from "@mui/joy";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/__auth/admin/new_policy_set_template")({
  component: Component,
});

function Component() {
  return (
    <CreatePolicySetTemplateContext>
      <Typography paddingBottom={2} level="h2">
        New policy set template
      </Typography>
      <Outlet />
    </CreatePolicySetTemplateContext>
  );
}

const defaultValue: CreatePolicySetTemplate = {
  access_subject: "",
  name: "",
  policy_issuer: "",
  policies: [],
};

type Context = {
  value: CreatePolicySetTemplate;
  changeValue: Dispatch<SetStateAction<CreatePolicySetTemplate>>;
};

const newPolicySetContext = createContext<Context>({
  value: defaultValue,
  changeValue: () => {},
});

export function useCreatePolicySetTemplateContext() {
  return useContext(newPolicySetContext);
}

export function CreatePolicySetTemplateContext({
  children,
}: {
  children: ReactNode;
}) {
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
