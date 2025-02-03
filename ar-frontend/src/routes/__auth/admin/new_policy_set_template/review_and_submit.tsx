import { Stack, Typography, Box, Button, Divider, Alert } from "@mui/joy";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCreatePolicySetTemplateContext } from "../new_policy_set_template";
import { PolicyCard } from "@/components/policy-card";
import { AddPolicySetTemplateStepper } from "@/components/wizzard-stepper";
import { useAdminCreatePolicySetTemplate } from "@/network/policy-set-templates";

export const Route = createFileRoute(
  "/__auth/admin/new_policy_set_template/review_and_submit",
)({
  component: Component,
});

function Component() {
  const navigate = useNavigate();
  const {
    mutateAsync: createPolicySet,
    isPending,
    error: submitError,
  } = useAdminCreatePolicySetTemplate();
  const { value } = useCreatePolicySetTemplateContext();

  function onBack() {
    navigate({
      to: "/admin/new_policy_set_template/add_policies",
    });
  }

  return (
    <Stack spacing={3}>
      <AddPolicySetTemplateStepper activeStep="Review and submit" />

      {submitError && (
        <Box paddingTop={4}>
          <Alert color="danger">
            <Box>{submitError.message}</Box>
          </Alert>
        </Box>
      )}

      <Box>
        <Typography level="title-lg">Name</Typography>
        <Typography>{value.name}</Typography>
      </Box>

      <Box>
        <Typography level="title-lg">Policy issuer</Typography>
        <Typography>{value.policy_issuer}</Typography>
      </Box>

      <Box>
        <Typography level="title-lg">Access subject</Typography>
        <Typography>{value.access_subject}</Typography>
      </Box>

      <Box>
        <Typography level="title-lg">Policies</Typography>
        <Stack direction="row" spacing={1}>
          {value.policies.map((p, idx) => (
            <PolicyCard policy={p} key={idx} />
          ))}
        </Stack>
      </Box>

      <Divider />

      <Stack direction="row" spacing={1}>
        <Button onClick={onBack} variant="outlined">
          Back
        </Button>
        <Button
          disabled={isPending}
          onClick={() =>
            createPolicySet(value).then(() => {
              navigate({
                to: "/admin",
              });
            })
          }
        >
          Submit
        </Button>
      </Stack>
    </Stack>
  );
}
