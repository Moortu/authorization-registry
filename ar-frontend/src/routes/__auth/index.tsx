import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useAdminPolicySets } from '../../network/policy-set'
import { Box, Card, FormLabel, Input, Stack, Typography } from '@mui/joy';
import { z } from 'zod';
import { useDebounce } from '@uidotdev/usehooks';

const searchSchema = z.object({
  access_subject: z.string().optional()
})

export const Route = createFileRoute('/__auth/')({
  component: Component,
  validateSearch: searchSchema,
})

function Component() {
  const search = Route.useSearch();
  const accessSubject = useDebounce(search.access_subject, 300);
  const navigate = useNavigate();
  const {
    data,
    error,
  } = useAdminPolicySets({
    accessSubject
  });

  console.log({
    error
  })

  return (
    <div>
      <div>
        <Box sx={{ width: 180 }}>
          <FormLabel>
            Access subject
          </FormLabel>
          <Input
            size="lg"
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
      </div>

      {
        data?.map(d => (
          <Card sx={{ margin: 1}} key={d.policy_set_id}>
            <Typography>{d.policy_set_id}</Typography>
            <Box>
              <Typography>Access subject</Typography>
              <Typography level="body-sm">{d.access_subject}</Typography>
            </Box>
            <Box>
              <Typography>Policy issuer</Typography>
              <Typography level="body-sm">{d.policy_issuer}</Typography>
            </Box>

            <Box>
              <Typography>Policies</Typography>
              <Stack spacing={2}>

                {
                  d.policies.map(p => (
                    <Box key={p.id}>
                      <Typography level="body-xs">Actions: {p.actions.join(", ")}</Typography>
                      <Typography level="body-xs">Resource type: {p.resource_type}</Typography>
                      <Typography level="body-xs">Service providers: {p.service_providers.join(", ")}</Typography>
                      <Typography level="body-xs">Attributes: {p.attributes.join(", ")}</Typography>
                      <Typography level="body-xs">Identifiers: {p.identifiers.join(", ")}</Typography>
                    </Box>
                  ))
                }

              </Stack>
            </Box>
          </Card>
        ))
      }
    </div>
  )
}
