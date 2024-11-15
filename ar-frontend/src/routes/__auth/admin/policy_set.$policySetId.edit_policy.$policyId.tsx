import { AddEditPolicyContext } from "@/components/add-edit-policy-context";
import { useAdminGetPolicy } from "@/network/policy-set";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Typography, Stack, Button, Box } from "@mui/joy";
import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/__auth/admin/policy_set/$policySetId/edit_policy/$policyId",
)({
  component: Component,
});

function Component() {
  const params = Route.useParams();
  const navigate = useNavigate();
  const { data: policy, isLoading } = useAdminGetPolicy({
    policyId: params.policyId,
    policySetId: params.policySetId,
  });

  if (!policy || isLoading) {
    return <div />;
  }

  return (
    <AddEditPolicyContext initialValue={policy}>
      <Stack spacing={1}>
        <Box>
          <Button
            startDecorator={<ArrowBackIcon />}
            variant="soft"
            onClick={() =>
              navigate({
                to: "/admin/policy_set/$policySetId",
                params,
              })
            }
          >
            Back to policy set
          </Button>
        </Box>
        <Typography paddingBottom={2} level="h2">
          Edit policy
        </Typography>
      </Stack>

      <Outlet />
    </AddEditPolicyContext>
  );
}
