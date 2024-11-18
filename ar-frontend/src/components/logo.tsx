import { Typography, Box } from "@mui/joy";
import { LogoZwart } from "./logo-zwart";

export function Logo({ admin }: { admin: boolean }) {
  return (
    <Box>
      <LogoZwart />

      <Typography
        textColor="neutral.600"
        fontSize={10}
        fontWeight={600}
        letterSpacing="-0.5px"
      >
        Authorization registry {admin ? " (admin)" : ""}
      </Typography>
    </Box>
  );
}
