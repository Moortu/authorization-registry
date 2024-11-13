import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAddPolicyContext } from "@/components/add-edit-policy-context";
import { Step1, Step1FormFields } from "@/components/add-edit-policy";

export const Route = createFileRoute(
  "/__auth/policy_set/$policySetId/add_policy/step1",
)({
  component: Component,
});

function Component() {
  const navigate = useNavigate();
  const params = Route.useParams();
  const { changeValue } = useAddPolicyContext();
  function onSubmit({ value }: { value: Step1FormFields }) {
    changeValue((oldValue) => ({ ...oldValue, ...value }));
    navigate({
      to: "/policy_set/$policySetId/add_policy/step2",
      search: { ...value, rules: [] },
      params,
    });
  }

  return <Step1 onSubmit={onSubmit} />;
}
