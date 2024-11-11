import { Step1, Step1FormFields } from "@/components/add-policy";
import { useAddPolicyContext } from "@/components/add-policy-context";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/__auth/new_policy_set/add_policy/step1")(
  {
    component: Component,
  },
);

function Component() {
  const { changeValue } = useAddPolicyContext();
  const navigate = useNavigate();

  function onSubmit({ value }: { value: Step1FormFields }) {
    changeValue((oldValue) => ({ ...oldValue, ...value }));
    navigate({
      to: "/new_policy_set/add_policy/step2",
    });
  }

  return (
    <div>
      <Step1 onSubmit={onSubmit} />
    </div>
  );
}
