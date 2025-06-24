import { PageLoadingFallback } from "@/components/page-loading-fallback";
import { PolicySetCard } from "@/components/policy-set-list-page";
import { PolicySetOverviewHeader } from "@/components/policy-set-overview";
import { useAdminPolicySets } from "@/network/policy-set";
import { Box, FormLabel, Input, Stack } from "@mui/joy";
import {
  createFileRoute,
  Link,
  Outlet,
  useNavigate,
} from "@tanstack/react-router";
import { useDebounce } from "@uidotdev/usehooks";
import { useState } from "react";

export const Route = createFileRoute("/__auth/admin/policy_set")({
  component: Component,
});

function Component() {
  const [accessSubject, setAccessSubject] = useState<string | undefined>(
    undefined,
  );
  const [policyIssuer, setPolicyIssuer] = useState<string | undefined>(
    undefined,
  );

  const deboundedAccessSubject = useDebounce(accessSubject, 300);
  const debouncedPolicyIssuer = useDebounce(policyIssuer, 300);
  const navigate = useNavigate();
  const { data: policySets, isLoading } = useAdminPolicySets({
    accessSubject: deboundedAccessSubject,
    policyIssuer: debouncedPolicyIssuer,
  });

  return (
    <>
      <Outlet />
      <PolicySetOverviewHeader
        onNewPolicySet={() =>
          navigate({ to: "/admin/new_policy_set/prefill_template" })
        }
      />
      <Stack
        paddingBottom={2}
        spacing={2}
        direction="row"
        alignItems="flex-end"
      >
        <Box sx={{ width: 180 }}>
          <FormLabel>Policy issuer</FormLabel>
          <Input
            size="sm"
            value={policyIssuer}
            onChange={(e) => {
              setPolicyIssuer(e.target.value);
            }}
          />
        </Box>
        <Box sx={{ width: 180 }}>
          <FormLabel>Access subject</FormLabel>
          <Input
            size="sm"
            value={accessSubject}
            onChange={(e) => setAccessSubject(e.target.value)}
          />
        </Box>
        <Box></Box>
      </Stack>
      <PageLoadingFallback isLoading={isLoading}>
        <Stack spacing={1}>
          {policySets?.map((ps) => (
            <Link
              key={ps.policy_set_id}
              style={{
                textDecorationLine: "none",
              }}
              to="/admin/policy_set/$policySetId"
              params={{
                policySetId: ps.policy_set_id,
              }}
            >
              <PolicySetCard policySet={ps} />
            </Link>
          ))}
        </Stack>
      </PageLoadingFallback>
    </>
  );
}
