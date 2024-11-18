import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { initLogout } from "@/network/idp";
import { Box, Button } from "@mui/joy";
import { Logo } from "@/components/logo";

export const Route = createFileRoute("/__auth/member")({
  component: Component,
});

function Component() {
  const navigate = useNavigate();

  return (
    <Box>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        paddingY={2}
      >
        <Logo admin={false} />
        <Button
          variant="plain"
          color="neutral"
          onClick={() => navigate({ to: "/member" })}
        >
          Policy sets
        </Button>
        <Button variant="soft" onClick={() => initLogout()}>
          Logout
        </Button>
      </Box>
      <Outlet />
    </Box>
  );
}
