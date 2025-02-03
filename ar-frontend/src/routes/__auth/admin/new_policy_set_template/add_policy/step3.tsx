import { Policy } from "@/network/policy-set";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Step3 } from "@/components/add-edit-policy";
import { useCreatePolicySetTemplateContext } from "../../new_policy_set_template";

export const Route = createFileRoute(
  "/__auth/admin/new_policy_set_template/add_policy/step3",
)({
  component: Component,
});

function Component() {
  const navigate = useNavigate();
  const { changeValue } = useCreatePolicySetTemplateContext();

  function onSubmit({ policy }: { policy: Omit<Policy, "id"> }) {
    changeValue((old) => {
      return {
        ...old,
        policies: [...old.policies, policy],
      };
    });

    navigate({
      to: "/admin/new_policy_set_template/add_policies",
    });
  }

  function onBack() {
    navigate({
      to: "/admin/new_policy_set_template/add_policy/step2",
    });
  }

  return <Step3 onSubmit={onSubmit} onBack={onBack} />;
}
