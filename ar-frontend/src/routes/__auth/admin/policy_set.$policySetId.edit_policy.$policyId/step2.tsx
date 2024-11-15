import { Step2 } from "@/components/add-edit-policy";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/__auth/admin/policy_set/$policySetId/edit_policy/$policyId/step2",
)({
  component: Component,
});

function Component() {
  const params = Route.useParams();
  const navigate = useNavigate();

  function onBack() {
    navigate({
      to: "/admin/policy_set/$policySetId/edit_policy/$policyId/step1",
      params,
    });
  }

  function onNext() {
    navigate({
      to: "/admin/policy_set/$policySetId/edit_policy/$policyId/step3",
      params,
    });
  }

  return <Step2 onBack={onBack} onNext={onNext} />;
}
