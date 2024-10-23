import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { AddPolicyStepper } from "../../../components/add-policy-stepper";
import {
  Autocomplete,
  Button,
  Divider,
  Input,
  Stack,
  Select,
  Option,
} from "@mui/joy";
import { useForm } from "@tanstack/react-form";
import { FormField } from "../../../components/form-field";
import { required } from "../../../form-field-validators";

const searchSchema = z.object({
  actions: z.array(z.string()),
  resource_type: z.string(),
  identifiers: z.array(z.string()),
  attributes: z.array(z.string()),
  service_providers: z.array(z.string()),
  rules: z.array(
    z.object({
      resource_type: z.string(),
      identifiers: z.array(z.string()),
      attributes: z.array(z.string()),
      actions: z.array(z.string()),
    }),
  ),
});

export const Route = createFileRoute(
  "/__auth/policy_set/$policySetId/add_policy/step2",
)({
  component: Component,
  validateSearch: searchSchema,
});

function Component() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const params = Route.useParams();

  const form = useForm<{
    resource_type: string;
    identifiers: string[];
    attributes: string[];
    actions: string[];
  }>({
    defaultValues: {
      resource_type: "",
      identifiers: [],
      attributes: [],
      actions: [],
    },
    onSubmit: ({ value }) => {
      navigate({
        to: "/policy_set/$policySetId/add_policy/step2",
        params,
        search: {
          ...search,
          rules: [...search.rules, value],
        },
      });
    },
  });

  return (
    <Stack spacing={3}>
      <AddPolicyStepper activeStep={2} />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <Stack spacing={1}>
          <form.Field
            name="actions"
            validators={required}
            children={(field) => (
              <FormField label="Actions" errors={field.state.meta.errors}>
                <Select
                  value={field.state.value}
                  onChange={(_, newValue) => field.handleChange(newValue)}
                  multiple
                >
                  <Option value="read">Read</Option>
                  <Option value="edit">Edit</Option>
                  <Option value="delete">Delete</Option>
                </Select>
              </FormField>
            )}
          />
          <form.Field
            name="resource_type"
            validators={required}
            children={(field) => (
              <FormField label="Resource type" errors={field.state.meta.errors}>
                <Input
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </FormField>
            )}
          />
          <form.Field
            name="identifiers"
            validators={required}
            children={(field) => (
              <FormField label="Identifiers" errors={field.state.meta.errors}>
                <Autocomplete
                  value={field.state.value}
                  onChange={(_, value) => field.handleChange(value)}
                  freeSolo
                  multiple
                  options={[]}
                />
              </FormField>
            )}
          />
          <form.Field
            name="attributes"
            validators={required}
            children={(field) => (
              <FormField label="Attributes" errors={field.state.meta.errors}>
                <Autocomplete
                  value={field.state.value}
                  onChange={(_, value) => field.handleChange(value)}
                  freeSolo
                  multiple
                  options={[]}
                />
              </FormField>
            )}
          />
          <Button type="submit" variant="outlined">
            Add exception
          </Button>
        </Stack>
      </form>

      <Divider />

      <Stack direction="row">
        <Button
          onClick={() =>
            navigate({
              to: "/policy_set/$policySetId/add_policy/step3",
              params,
              search,
            })
          }
        >
          Review and submit
        </Button>
      </Stack>
    </Stack>
  );
}
