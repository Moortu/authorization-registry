import { Box, Typography } from "@mui/joy";
import { MainButton } from "./main-button";

export function PolicySetOverviewHeader({
  onNewPolicySet,
}: {
  onNewPolicySet: () => void;
}) {
  return (
    <Box paddingY={4} display="flex" gap={4}>
      <Typography level="h2">Policy sets</Typography>
      <div>
        <MainButton onClick={onNewPolicySet}>New policy set</MainButton>
      </div>
    </Box>
  );
}
