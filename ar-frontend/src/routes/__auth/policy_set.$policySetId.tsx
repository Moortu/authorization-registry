import { createFileRoute } from "@tanstack/react-router";
import { useAdminPolicySet } from "../../network/policy-set";
import { PageLoadingFallback } from "../../components/page-loading-fallback";
import { CatchBoundary } from "../../components/catch-boundary";

export const Route = createFileRoute("/__auth/policy_set/$policySetId")({
  component: Component,
  errorComponent: CatchBoundary,
});

function Component() {
  const { policySetId } = Route.useParams();

  const { data, isLoading } = useAdminPolicySet({
    policySetId,
  });

  return (
    <PageLoadingFallback isLoading={isLoading}>
      <div>
        Fishhhhhhhh
        {JSON.stringify(data)}
      </div>
    </PageLoadingFallback>
  );
}
