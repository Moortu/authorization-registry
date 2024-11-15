import { Policy } from "@/network/policy-set";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCreatePolicySetContext } from "../../new_policy_set";
import { Step3 } from "@/components/add-edit-policy";

export const Route = createFileRoute(
  "/__auth/admin/new_policy_set/add_policy/step3",
)({
  component: Component,
});

function Component() {
  const navigate = useNavigate();
  const { changeValue } = useCreatePolicySetContext();

  function onSubmit({ policy }: { policy: Omit<Policy, "id"> }) {
    changeValue((old) => ({
      ...old,
      policies: [...old.policies, policy],
    }));

    navigate({
      to: "/new_policy_set/step2",
    });
  }

  function onBack() {
    navigate({
      to: "/new_policy_set/add_policy/step2",
    });
  }

  return <Step3 onSubmit={onSubmit} onBack={onBack} />;
}
