import { AddPolicySetStepper } from "@/components/wizzard-stepper";
import { useCreatePolicySetContext } from "@/components/create-policy-set-context";
import { PageLoadingFallback } from "@/components/page-loading-fallback";
import { usePolicySetTemplates } from "@/network/policy-set-templates";
import { Button, Stack, Box, Select, Option, FormLabel } from "@mui/joy";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute(
  "/__auth/admin/new_policy_set/prefill_template",
)({
  component: Component,
});

function Component() {
  const { changeValue } = useCreatePolicySetContext();
  const navigate = useNavigate();
  const [template, setTemplate] = useState<number>();
  const { data: policySetTemplates, isLoading } = usePolicySetTemplates();

  function applyTemplate() {
    if (template !== undefined) {
      const policySetTemplate = policySetTemplates?.[template];

      if (!policySetTemplate) {
        return;
      }

      changeValue({
        access_subject: policySetTemplate.access_subject || "",
        policy_issuer: policySetTemplate.policy_issuer || "",
        policies: policySetTemplate.policies,
      });

      navigate({ to: "/admin/new_policy_set/define_policy_set" })
    }
  }

  return (
    <PageLoadingFallback isLoading={isLoading}>
      <Stack spacing={2}>
        <AddPolicySetStepper activeStep="Prefill from template" />

        <Box>
          <FormLabel>Policy set template</FormLabel>
          {/* @ts-expect-error joy-ui is not smart enough to infer the type from dynamic options */}
          <Select onChange={(_, newValue) => setTemplate(newValue)}>
            {policySetTemplates?.map((ps, idx) => (
              <Option key={idx} value={idx} label={ps.name}>
                {ps.name}
              </Option>
            ))}
          </Select>
        </Box>

        <Stack direction="row" spacing={1}>
          <Button disabled={template === undefined} onClick={applyTemplate}>
            Apply template
          </Button>
          <Button
            variant="outlined"
            onClick={() =>
              navigate({ to: "/admin/new_policy_set/define_policy_set" })
            }
          >
            Start from scratch
          </Button>
        </Stack>
      </Stack>
    </PageLoadingFallback>
  );
}
