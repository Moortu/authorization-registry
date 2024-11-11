import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AddPolicyContext } from "../../../components/add-policy-context";

export const Route = createFileRoute("/__auth/new_policy_set/add_policy")({
  component: Component,
});

function Component() {
  return (
    <AddPolicyContext>
      <Outlet />
    </AddPolicyContext>
  );
}
