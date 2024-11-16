import { Step1 } from "@/components/add-edit-policy";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/__auth/admin/new_policy_set/add_policy/step1",
)({
  component: Component,
});

function Component() {
  const navigate = useNavigate();

  function onSubmit() {
    navigate({
      to: "/admin/new_policy_set/add_policy/step2",
    });
  }

  return (
    <div>
      <Step1 onSubmit={onSubmit} />
    </div>
  );
}
