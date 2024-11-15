import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { z } from "zod";
import { isAuthenticated, useAuth } from "../auth";
import { initLogin, initLogout } from "../network/idp";
import { Box, Button } from "@mui/joy";
import { Logo } from "../components/logo";

const searchSchema = z
  .object({
    token: z.string().optional(),
  })
  .optional();

export const Route = createFileRoute("/__auth")({
  component: Component,
  validateSearch: searchSchema,
});

function Component() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const { token, setToken } = useAuth();

  useEffect(() => {
    if (search?.token && isAuthenticated(token)) {
      navigate({
        replace: true,
        search: {
          ...search,
          // @ts-ignore
          token: undefined,
        },
      });
    }

    if (!isAuthenticated(token)) {
      if (search?.token) {
        setToken(search?.token);

        return;
      }

      initLogin();
    }
  }, [token, search?.token, search, setToken, navigate]);

  if (!isAuthenticated(token)) {
    return null;
  }

  return (
    <Box>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        paddingY={2}
      >
        <Logo />
        <Button
          variant="plain"
          color="neutral"
          onClick={() => navigate({ to: "/" })}
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
