import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { z } from "zod";
import { getTokenContent, isAuthenticated, useAuth } from "../auth";
import { initLogin } from "../network/idp";

const searchSchema = z
  .object({
    token: z.string().optional(),
  })
  .optional();

export const Route = createFileRoute("/__auth")({
  component: Component,
  validateSearch: searchSchema,
  beforeLoad: async ({ context, location }) => {
    const search = new URLSearchParams(location.search);
    const token = search.get("token");

    if (!isAuthenticated(context.token) && !token) {
      await initLogin();
    }
  },
});

function Component() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const { token, setToken } = useAuth();

  useEffect(() => {
    const searchToken = search?.token;
    if (searchToken) {
      setToken(searchToken);
      navigate({
        search: {
          ...search,
          // @ts-ignore
          token: undefined,
        },
      });
      return;
    }

    if (isAuthenticated(token) && token) {
      const tokenContent = getTokenContent(token);

      navigate({
        to: tokenContent.realm_access_roles.includes("dexspace_admin")
          ? "/admin/policy_set"
          : "/member",
        replace: true,
        search: {
          ...search,
          // @ts-ignore
          token: undefined,
        },
      });
    }
  }, [token, setToken, navigate, search]);

  useEffect(() => {}, [search, setToken]);

  if (!isAuthenticated(token) || !token) {
    return null;
  }

  return <Outlet />;
}
