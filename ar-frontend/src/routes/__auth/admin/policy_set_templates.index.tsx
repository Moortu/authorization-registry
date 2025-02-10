import { CatchBoundary } from "@/components/catch-boundary";
import { PageLoadingFallback } from "@/components/page-loading-fallback";
import { usePolicySetTemplates } from "@/network/policy-set-templates";
import { Button, Card, Stack, Typography } from "@mui/joy";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/__auth/admin/policy_set_templates/")({
  component: Component,
  errorComponent: CatchBoundary,
});

function Component() {
  const { data: policyTemplates, isLoading } = usePolicySetTemplates();

  return (
    <PageLoadingFallback isLoading={isLoading}>
      <Typography paddingBottom={2} level="h2">
        Policy set templates
      </Typography>
      <Link
        to="/admin/new_policy_set_template/define_policy_set_template"
        style={{
          textDecorationLine: "none",
        }}
      >
        <Button>New policy set template</Button>
      </Link>

      <Stack spacing={1} paddingTop={2}>
        {policyTemplates?.map(({ name, id }) => (
          <Link
            key={id}
            to="/admin/policy_set_templates/$policySetTemplateId"
            params={{ policySetTemplateId: id }}
            style={{
              textDecorationLine: "none",
            }}
          >
            <Card>
              <Typography level="title-lg">{name}</Typography>
            </Card>
          </Link>
        ))}
      </Stack>
    </PageLoadingFallback>
  );
}
