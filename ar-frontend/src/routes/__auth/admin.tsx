import {
  createFileRoute,
  Link,
  Outlet,
  useNavigate,
} from "@tanstack/react-router";
import { CatchBoundary } from "@/components/catch-boundary";
import { Box, FormLabel, Input, Stack } from "@mui/joy";
import { z } from "zod";
import { PageLoadingFallback } from "@/components/page-loading-fallback";
import { useDebounce } from "@uidotdev/usehooks";
import { useAdminPolicySets } from "@/network/policy-set";
import { PolicySetCard } from "@/components/policy-set-list-page";
import { Header, HeaderLink } from "@/components/header";
import { PolicySetOverviewHeader } from "@/components/policy-set-overview";

const searchSchema = z.object({
  access_subject: z.string().optional(),
  policy_issuer: z.string().optional(),
});

export const Route = createFileRoute("/__auth/admin")({
  component: Component,
  validateSearch: searchSchema,
  errorComponent: CatchBoundary,
});

function Component() {
  const search = Route.useSearch();
  const accessSubject = useDebounce(search.access_subject, 300);
  const policyIssuer = useDebounce(search.policy_issuer, 300);
  const navigate = useNavigate();
  const { data: policySets, isLoading } = useAdminPolicySets({
    accessSubject,
    policyIssuer,
  });

  return (
    <>
      <Outlet />
      <Header>
        <HeaderLink
          onClick={() => navigate({ to: "/admin" })}
          selected={location.pathname.split("/")?.[1] === "admin"}
        >
          Policy sets
        </HeaderLink>
      </Header>
      <Box
        width="100%"
        display="flex"
        alignItems="center"
        flexDirection="column"
      >
        <Box maxWidth={1360} width="100%" paddingX={4} boxSizing="border-box">
          <Box width="100%">
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
                  defaultValue={search.policy_issuer || ""}
                  onChange={(e) =>
                    navigate({
                      to: "/admin",
                      search: {
                        ...search,
                        policy_issuer: e.target.value,
                      },
                    })
                  }
                />
              </Box>
              <Box sx={{ width: 180 }}>
                <FormLabel>Access subject</FormLabel>
                <Input
                  size="sm"
                  defaultValue={search.access_subject || ""}
                  onChange={(e) =>
                    navigate({
                      to: "/admin",
                      search: {
                        ...search,
                        access_subject: e.target.value,
                      },
                    })
                  }
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
          </Box>
        </Box>
      </Box>
    </>
  );
}
