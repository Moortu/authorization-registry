import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AddEditPolicyContext } from "@/components/add-edit-policy-context";

export const Route = createFileRoute("/__auth/new_policy_set/add_policy")({
  component: Component,
});

function Component() {
  return (
    <AddEditPolicyContext>
      <Outlet />
    </AddEditPolicyContext>
  );
}
