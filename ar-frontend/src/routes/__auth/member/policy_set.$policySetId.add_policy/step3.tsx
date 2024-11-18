import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Policy, useAddPolicyToPolicySet } from "@/network/policy-set";
import { Step3 } from "@/components/add-edit-policy";

export const Route = createFileRoute(
  "/__auth/member/policy_set/$policySetId/add_policy/step3",
)({
  component: Component,
});

function Component() {
  const navigate = useNavigate();
  const params = Route.useParams();

  const {
    mutateAsync: addPolicy,
    isPending,
    error,
  } = useAddPolicyToPolicySet({
    policySetId: params.policySetId,
  });

  function onSubmit({ policy }: { policy: Omit<Policy, "id"> }) {
    addPolicy({
      policy,
    }).then(() => {
      navigate({ to: "/member/policy_set/$policySetId", params });
    });
  }

  function onBack() {
    navigate({
      to: "/member/policy_set/$policySetId/add_policy/step2",
      params,
    });
  }

  return (
    <Step3
      onSubmit={onSubmit}
      onBack={onBack}
      isSubmitting={isPending}
      error={error}
    />
  );
}
