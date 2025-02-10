import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AddPolicySetTemplateStepper } from "@/components/wizzard-stepper";
import { Typography, Button, Stack, Box, Divider, Card } from "@mui/joy";
import { useCreatePolicySetTemplateContext } from "../new_policy_set_template";
import { PolicyCard } from "@/components/policy-card";

export const Route = createFileRoute(
  "/__auth/admin/new_policy_set_template/add_policies",
)({
  component: Component,
});

function Component() {
  const navigate = useNavigate();

  const { value, changeValue } = useCreatePolicySetTemplateContext();

  return (
    <Stack spacing={3}>
      <AddPolicySetTemplateStepper activeStep="Add policies" />

      <Divider />

      <Typography level="title-lg">Policies</Typography>
      <Stack direction="row" spacing={1}>
        {value.policies.map((p, idx) => (
          <Card key={idx}>
            <PolicyCard policy={p} key={idx} />
            <Stack direction="row">
              <Button
                onClick={() =>
                  changeValue((value) => ({
                    ...value,
                    policies: value.policies.filter((_, pidx) => pidx !== idx),
                  }))
                }
                size="sm"
                variant="outlined"
                color="danger"
              >
                Delete
              </Button>
            </Stack>
          </Card>
        ))}
      </Stack>

      <Box>
        <Button
          onClick={() =>
            navigate({ to: "/admin/new_policy_set_template/add_policy/step1" })
          }
          variant="outlined"
        >
          Add policy
        </Button>
      </Box>

      <Divider />
      <Stack direction="row" spacing={1}>
        <Button
          variant="outlined"
          onClick={() =>
            navigate({
              to: "/admin/new_policy_set_template/define_policy_set_template",
            })
          }
        >
          Back
        </Button>
        <Button
          onClick={() =>
            navigate({ to: "/admin/new_policy_set_template/review_and_submit" })
          }
        >
          Next
        </Button>
      </Stack>
    </Stack>
  );
}
