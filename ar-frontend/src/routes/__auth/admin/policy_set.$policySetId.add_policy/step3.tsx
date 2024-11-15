import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Policy,
  useAddAdminPolicyToPolicySet,
} from "../../../network/policy-set";
import { Step3 } from "@/components/add-edit-policy";

export const Route = createFileRoute(
  "/__auth/admin/policy_set/$policySetId/add_policy/step3",
)({
  component: Component,
});

function Component() {
  const navigate = useNavigate();
  const params = Route.useParams();

  const { mutateAsync: addPolicy, isPending } = useAddAdminPolicyToPolicySet({
    policySetId: params.policySetId,
  });

  function onSubmit({ policy }: { policy: Omit<Policy, "id"> }) {
    addPolicy({
      policy,
    }).then(() => {
      navigate({ to: "/policy_set/$policySetId", params });
    });
  }

  function onBack() {
    navigate({
      to: "/policy_set/$policySetId/add_policy/step2",
      params,
    });
  }

  return <Step3 onSubmit={onSubmit} onBack={onBack} isSubmitting={isPending} />;
}
