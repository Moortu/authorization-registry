import { Button, Input, Stack } from "@mui/joy";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AddPolicySetStepper } from "@/components/add-policy-set-stepper";
import { useCreatePolicySetContext } from "../new_policy_set";
import { useForm } from "@tanstack/react-form";
import { FormField } from "@/components/form-field";
import { required } from "@/form-field-validators";

export const Route = createFileRoute("/__auth/admin/new_policy_set/step1")({
  component: Component,
});

function Component() {
  const navigate = useNavigate();
  const { value, changeValue } = useCreatePolicySetContext();

  const form = useForm({
    defaultValues: {
      access_subject: value.access_subject,
      policy_issuer: value.policy_issuer,
    },
    onSubmit: ({ value }) => {
      changeValue((oldValue) => ({ ...oldValue, ...value }));

      // have to validate here
      navigate({ to: "/new_policy_set/step2" });
    },
  });

  return (
    <div>
      <AddPolicySetStepper activeStep={1} />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <Stack paddingTop={2} spacing={1}>
          <form.Field
            name="access_subject"
            validators={required}
            children={(field) => (
              <FormField
                label="Access subject"
                errors={field.state.meta.errors}
              >
                <Input
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </FormField>
            )}
          />
          <form.Field
            name="policy_issuer"
            validators={required}
            children={(field) => (
              <FormField label="Policy issuer" errors={field.state.meta.errors}>
                <Input
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </FormField>
            )}
          />
          <Stack direction="row">
            <Button type="submit">Next step</Button>
          </Stack>
        </Stack>
      </form>
    </div>
  );
}
