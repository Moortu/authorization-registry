import { Step1 } from "@/components/add-edit-policy";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/__auth/member/policy_set/$policySetId/edit_policy/$policyId/step1",
)({
  component: Component,
});

function Component() {
  const params = Route.useParams();
  const navigate = useNavigate();

  function onSubmit() {
    navigate({
      to: "/member/policy_set/$policySetId/edit_policy/$policyId/step2",
      params,
    });
  }

  return (
    <div>
      <Step1 onSubmit={onSubmit} />
    </div>
  );
}
