import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Stack } from "@mui/joy";
import { Step2 } from "@/components/add-edit-policy";

export const Route = createFileRoute(
  "/__auth/admin/policy_set/$policySetId/add_policy/step2",
)({
  component: Component,
});

function Component() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const params = Route.useParams();

  function onBack() {
    navigate({
      to: "/policy_set/$policySetId/add_policy/step1",
      params,
    });
  }

  function onNext() {
    navigate({
      to: "/policy_set/$policySetId/add_policy/step3",
      params,
      search,
    });
  }

  return (
    <Stack spacing={3}>
      <Step2 onBack={onBack} onNext={onNext} />
    </Stack>
  );
}
