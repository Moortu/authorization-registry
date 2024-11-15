import { Step2 } from "@/components/add-edit-policy";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/__auth/admin/new_policy_set/add_policy/step2",
)({
  component: Component,
});

function Component() {
  const navigate = useNavigate();

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
      <Step2 onNext={onNext} onBack={onBack} />
    </div>
  );
}
