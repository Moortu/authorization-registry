import { AddEditPolicyContext } from "@/components/add-edit-policy-context";
import { useAdminGetPolicy } from "@/network/policy-set";
import { Typography } from "@mui/joy";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/__auth/policy_set/$policySetId/edit_policy/$policyId",
)({
  component: Component,
});

function Component() {
  const params = Route.useParams();
  const { data: policy, isLoading } = useAdminGetPolicy({
    policyId: params.policyId,
    policySetId: params.policySetId,
  });

  if (!policy || isLoading) {
    return <div>hello</div>;
  }

  return (
    <AddEditPolicyContext initialValue={policy}>
      <Typography paddingBottom={2} level="h2">
        Edit policy
      </Typography>
      <Outlet />
    </AddEditPolicyContext>
  );
}
