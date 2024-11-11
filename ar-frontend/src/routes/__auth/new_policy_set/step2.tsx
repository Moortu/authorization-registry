import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AddPolicySetStepper } from "../../../components/add-policy-set-stepper";
import { Typography, Button, Stack, Box, Divider } from "@mui/joy";
import { useCreatePolicySetContext } from "../new_policy_set";
import { PolicyCard } from "../../../components/policy-card";

export const Route = createFileRoute("/__auth/new_policy_set/step2")({
  component: Component,
});

function Component() {
  const navigate = useNavigate();

  const { value } = useCreatePolicySetContext();

  return (
    <Stack spacing={3}>
      <AddPolicySetStepper activeStep={2} />

      <Typography level="title-lg">Policies</Typography>
      <Stack direction="row" spacing={1}>
        {value.policies.map((p, idx) => (
          <PolicyCard policy={p} key={idx} />
        ))}
      </Stack>

      <Box>
        <Button
          onClick={() => navigate({ to: "/new_policy_set/add_policy/step1" })}
        >
          Add policy
        </Button>
      </Box>

      <Divider />
      <Stack direction="row" spacing={1}>
        <Button
          variant="outlined"
          onClick={() => navigate({ to: "/new_policy_set/step1" })}
        >
          Back
        </Button>
        <Button onClick={() => navigate({ to: "/new_policy_set/step3" })}>
          Next
        </Button>
      </Stack>
    </Stack>
  );
}
