import { Card, Box, Typography, Stack } from "@mui/joy";
import { PolicyCard } from "./policy-card";
import { PolicySetWithPolicies } from "@/network/policy-set";

export function PolicySetCard({
  policySet,
}: {
  policySet: PolicySetWithPolicies;
}) {
  return (
    <Card>
      <Stack direction="row" spacing={2}>
        <Box>
          <Typography level="title-sm">Policy issuer</Typography>
          <Typography level="body-xs">{policySet.policy_issuer}</Typography>
        </Box>
        <Box>
          <Typography level="title-sm">Access subject</Typography>
          <Typography level="body-xs">{policySet.access_subject}</Typography>
        </Box>
      </Stack>
      <Box>
        <Typography>Policies</Typography>
        <Stack spacing={2} direction="row" flexWrap="wrap" useFlexGap>
          {policySet.policies.map((p) => (
            <Box
              key={p.id}
              width={{
                xs: "100%",
                sm: "47%",
                md: "32%",
              }}
              height="100%"
            >
              <PolicyCard policy={p} />
            </Box>
          ))}
        </Stack>
      </Box>
    </Card>
  );
}
