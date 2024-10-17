import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Policy,
  PolicySetWithPolicies,
  useAdminPolicySets,
} from "../../network/policy-set";
import {
  Box,
  Button,
  Card,
  FormLabel,
  Input,
  Stack,
  Typography,
} from "@mui/joy";
import { z } from "zod";
import { useDebounce } from "@uidotdev/usehooks";
import { PageLoadingFallback } from "../../components/page-loading-fallback";
import { CatchBoundary } from "../../components/catch-boundary";

const searchSchema = z.object({
  access_subject: z.string().optional(),
  policy_issuer: z.string().optional(),
});

export const Route = createFileRoute("/__auth/")({
  component: Component,
  validateSearch: searchSchema,
  errorComponent: CatchBoundary,
});

function PolicyCardItem({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <>
      <Box display="grid" gridColumn={1}>
        <Typography textColor="neutral.800" level="body-xs">
          {title}
        </Typography>
      </Box>
      <Box display="grid" gridColumn={2} paddingLeft={2}>
        <Typography textColor="primary.500" level="body-xs">
          {description}
        </Typography>
      </Box>
    </>
  );
}

function PolicyCard({ policy }: { policy: Policy }) {
  return (
    <Card sx={{ backgroundColor: "background.level1" }} size="sm">
      <Box display="grid">
        <PolicyCardItem
          title="Actions"
          description={policy.actions.join(", ")}
        />
        <PolicyCardItem
          title="Resource type"
          description={policy.resource_type}
        />
        <PolicyCardItem
          title="Service providers"
          description={policy.service_providers.join(", ")}
        />
        <PolicyCardItem
          title="Attributes"
          description={policy.attributes.join(", ")}
        />
        <PolicyCardItem
          title="Identifiers"
          description={policy.identifiers.join(", ")}
        />
      </Box>
    </Card>
  );
}

function PolicySetCard({ policySet }: { policySet: PolicySetWithPolicies }) {
  return (
    <Card>
      <Stack direction="row" spacing={2}>
        <Box>
          <Typography level="title-sm">Access subject</Typography>
          <Typography level="body-xs">{policySet.access_subject}</Typography>
        </Box>
        <Box>
          <Typography level="title-sm">Policy issuer</Typography>
          <Typography level="body-xs">{policySet.policy_issuer}</Typography>
        </Box>
      </Stack>
      <Box>
        <Typography>Policies</Typography>
        <Stack spacing={2} direction="row">
          {policySet.policies.map((p) => (
            <PolicyCard policy={p} key={p.id} />
          ))}
        </Stack>
      </Box>
    </Card>
  );
}

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
    <PageLoadingFallback isLoading={isLoading}>
      <div>
        <Typography level="h2">Policy sets</Typography>
        <Stack paddingY={2} spacing={2} direction="row" alignItems="flex-end">
          <Box sx={{ width: 180 }}>
            <FormLabel>Access subject</FormLabel>
            <Input
              size="sm"
              defaultValue={search.access_subject || ""}
              onChange={(e) =>
                navigate({
                  to: "/",
                  search: {
                    ...search,
                    access_subject: e.target.value,
                  },
                })
              }
            />
          </Box>
          <Box sx={{ width: 180 }}>
            <FormLabel>Policy issuer</FormLabel>
            <Input
              size="sm"
              defaultValue={search.policy_issuer || ""}
              onChange={(e) =>
                navigate({
                  to: "/",
                  search: {
                    ...search,
                    policy_issuer: e.target.value,
                  },
                })
              }
            />
          </Box>
          <Box>
            <Button onClick={() => navigate({ to: "/new_policy_set" })}>
              New policy set
            </Button>
          </Box>
        </Stack>

        <Stack spacing={1}>
          {policySets?.map((ps) => (
            <Link
              key={ps.policy_set_id}
              style={{
                textDecorationLine: "none",
              }}
              to="/policy_set/$policySetId"
              params={{
                policySetId: ps.policy_set_id,
              }}
            >
              <PolicySetCard policySet={ps} />
            </Link>
          ))}
        </Stack>
      </div>
    </PageLoadingFallback>
  );
}
