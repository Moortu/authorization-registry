import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { AddEditPolicyContext } from "@/components/add-edit-policy-context";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Typography, Stack, Button, Box } from "@mui/joy";

export const Route = createFileRoute(
  "/__auth/policy_set/$policySetId/add_policy",
)({
  component: Component,
});

function Component() {
  const params = Route.useParams();
  const navigate = useNavigate();

  return (
    <AddEditPolicyContext>
      <Stack direction="column" spacing={1}>
        <Box>
          <Button
            startDecorator={<ArrowBackIcon />}
            variant="soft"
            onClick={() =>
              navigate({
                to: "/policy_set/$policySetId",
                params,
              })
            }
          >
            Back to policy set
          </Button>
        </Box>

        <Typography paddingBottom={2} level="h2">
          Add policy to policy set
        </Typography>
      </Stack>

      <Outlet />
    </AddEditPolicyContext>
  );
}
