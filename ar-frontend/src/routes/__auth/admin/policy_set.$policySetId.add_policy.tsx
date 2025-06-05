import { createFileRoute, useNavigate } from "@tanstack/react-router";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  Typography,
  Stack,
  Button,
  Box,
  Modal,
  ModalDialog,
  Alert,
  ModalOverflow,
} from "@mui/joy";
import { Policy, useAddAdminPolicyToPolicySet } from "@/network/policy-set";
import { PolicyForm } from "@/components/policy-form";

export const Route = createFileRoute(
  "/__auth/admin/policy_set/$policySetId/add_policy",
)({
  component: Component,
});

function Component() {
  const params = Route.useParams();
  const navigate = useNavigate();

  const {
    mutateAsync: addPolicy,
    isPending,
    error,
  } = useAddAdminPolicyToPolicySet({
    policySetId: params.policySetId,
  });

  function onSubmit(policy: Omit<Policy, "id">) {
    addPolicy({
      policy,
    }).then(() => {
      navigate({ to: "/admin/policy_set/$policySetId", params });
    });
  }

  return (
    <Modal
      open={true}
      onClose={() => navigate({ to: "/admin/policy_set/$policySetId", params })}
    >
      <ModalOverflow>
        <ModalDialog>
          <Stack direction="column" spacing={1}>
            <Typography paddingBottom={2} level="h2">
              Add policy to policy set
            </Typography>
            {error && (
              <Box>
                <Alert color="danger">
                  <Box>{error.message}</Box>
                </Alert>
              </Box>
            )}
            <PolicyForm
              isSubmitPending={isPending}
              submitText="Add policy"
              onSubmit={onSubmit}
              backButton={
                <Button
                  startDecorator={<ArrowBackIcon />}
                  variant="plain"
                  color="neutral"
                  onClick={() =>
                    navigate({
                      to: "/admin/policy_set/$policySetId",
                      params,
                    })
                  }
                >
                  Back to policy set
                </Button>
              }
            />
          </Stack>
        </ModalDialog>
      </ModalOverflow>
    </Modal>
  );
}
