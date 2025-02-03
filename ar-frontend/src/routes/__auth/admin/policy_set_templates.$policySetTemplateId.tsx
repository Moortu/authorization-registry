import { CatchBoundary } from "@/components/catch-boundary";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { PageLoadingFallback } from "@/components/page-loading-fallback";
import { PolicyCard } from "@/components/policy-card";
import {
  useAdminDeletePolicySetTemplate,
  usePolicySetTemplate,
} from "@/network/policy-set-templates";
import { Box, Button, Stack, Typography } from "@mui/joy";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";

const searchParamsSchema = z.object({
  delete_modal_open: z.boolean().optional(),
});

export const Route = createFileRoute(
  "/__auth/admin/policy_set_templates/$policySetTemplateId",
)({
  errorComponent: CatchBoundary,
  component: Component,
  validateSearch: searchParamsSchema,
});

function Component() {
  const { policySetTemplateId } = Route.useParams();
  const navigate = useNavigate();
  const search = Route.useSearch();
  const { data, isLoading } = usePolicySetTemplate({
    id: policySetTemplateId,
  });
  const {
    mutateAsync: deletePolicySetTemplate,
    isPending,
    error,
  } = useAdminDeletePolicySetTemplate();

  return (
    <PageLoadingFallback isLoading={isLoading}>
      <ConfirmDialog
        onSubmit={() =>
          deletePolicySetTemplate(policySetTemplateId).then(() =>
            navigate({ to: "/admin/policy_set_templates" }),
          )
        }
        isActionPending={isPending}
        error={error}
        isOpen={Boolean(search.delete_modal_open)}
        title="Delete policy set template"
        isDanger
        onSubmitText="Delete"
        onCancelText="Cancel"
        description="Are you sure you want to delete this policy set template?"
        onClose={() =>
          navigate({
            replace: true,
            search: { delete_modal_open: false },
            to: "/admin/policy_set_templates/$policySetTemplateId",
            params: {
              policySetTemplateId,
            },
          })
        }
      />
      <Typography paddingBottom={2} level="h2">
        Policy set template: {data?.name}
      </Typography>

      <Stack spacing={1}>
        <Box>
          <Typography level="title-lg">Policy issuer</Typography>
          <Typography>{data?.policy_issuer}</Typography>
        </Box>

        <Box>
          <Typography level="title-lg">Access subject</Typography>
          <Typography>{data?.access_subject}</Typography>
        </Box>

        <Box>
          <Typography level="title-lg">Policies</Typography>
          <Stack direction="row" spacing={1}>
            {data?.policies.map((p, idx) => (
              <PolicyCard policy={p} key={idx} />
            ))}
          </Stack>
        </Box>
      </Stack>

      <Box paddingTop={2}>
        <Button
          onClick={() =>
            navigate({
              replace: true,
              search: { delete_modal_open: true },
              to: "/admin/policy_set_templates/$policySetTemplateId",
              params: {
                policySetTemplateId,
              },
            })
          }
          color="danger"
        >
          Delete
        </Button>
      </Box>
    </PageLoadingFallback>
  );
}
