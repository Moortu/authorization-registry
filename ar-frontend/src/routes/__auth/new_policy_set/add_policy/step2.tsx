import { Step2, Step2FormFields } from "@/components/add-policy";
import { useAddPolicyContext } from "@/components/add-policy-context";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/__auth/new_policy_set/add_policy/step2")(
  {
    component: Component,
  },
);

function Component() {
  const navigate = useNavigate();
  const { changeValue } = useAddPolicyContext();

  function onSubmit({ value }: { value: Step2FormFields }) {
    changeValue((oldValue) => ({
      ...oldValue,
      rules: [
        ...oldValue.rules,
        {
          effect: "Deny",
          target: {
            actions: value.actions,
            resource: {
              type: value.resource_type,
              identifiers: value.identifiers,
              attributes: value.attributes,
            },
          },
        },
      ],
    }));
  }

  function onBack() {
    navigate({
      to: "/new_policy_set/add_policy/step1",
    });
  }

  function onNext() {
    navigate({
      to: "/new_policy_set/add_policy/step3",
    });
  }
  return (
    <div>
      <Step2 onSubmit={onSubmit} onNext={onNext} onBack={onBack} />
    </div>
  );
}
