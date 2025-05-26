import {
  createFileRoute,
  Outlet,
  useLocation,
  useNavigate,
} from "@tanstack/react-router";
import { initLogout } from "@/network/idp";
import { Box, Button, Typography } from "@mui/joy";
import { Logo } from "@/components/logo";
import { SlashIcon } from "@/icons/slash-icon";
import { KeyIcon } from "@/icons/key-icon";

export const Route = createFileRoute("/__auth/admin")({
  component: Component,
});

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const splittedPathname = location.pathname.split("/");

  console.log({ splittedPathname });

  return (
    <Box padding={2}>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        flexGrow={1}
        paddingLeft={3}
        paddingRight={3}
        paddingY={1}
        sx={{ backgroundColor: "white", borderRadius: "64px" }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <Logo admin />

          <Box
            width="24px"
            height="24px"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <SlashIcon />
          </Box>

          <Box
            sx={{
              height: "40px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "#f4f5f6",
              borderRadius: "4px",
            }}
          >
            <Box
              gap={1}
              display="flex"
              flexDirection="row"
              alignItems="center"
              padding={1}
            >
              <KeyIcon />
              <Typography fontWeight={400} fontSize="16px" textColor="#3602A7">
                Authorization registry
              </Typography>
            </Box>
          </Box>

          <Box paddingLeft={4}>
            <Button
              variant="plain"
              color="neutral"
              onClick={() => navigate({ to: "/admin" })}
              sx={{
                typography: {
                  color:
                    splittedPathname?.[splittedPathname.length - 1] === "admin"
                      ? "#4890DA"
                      : "#49525B",
                  fontWeight: 300,
                },
              }}
            >
              Policy sets
            </Button>
            <Button
              variant="plain"
              color="neutral"
              onClick={() => navigate({ to: "/admin/policy_set_templates" })}
              sx={{
                typography: {
                  color:
                    splittedPathname?.[splittedPathname.length - 1] ===
                    "policy_set_templates"
                      ? "#4890DA"
                      : "#49525B",
                  fontWeight: 300,
                },
              }}
            >
              Policy set templates
            </Button>
          </Box>
        </Box>
        <Button variant="soft" onClick={() => initLogout()}>
          Logout
        </Button>
      </Box>
    </Box>
  );
}

function Component() {
  return (
    <>
      <Header />
      <Box maxWidth={1360} display="flex" justifyContent="center">
        <Box>
          <Outlet />
        </Box>
      </Box>
    </>
  );
}
