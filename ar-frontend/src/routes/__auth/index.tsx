import { getTokenContent, isAuthenticated, useAuth } from "@/auth";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/__auth/")({
  component: Component,
});

function Component() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const { token } = useAuth();

  useEffect(() => {
    if (isAuthenticated(token) && token) {
      const tokenContent = getTokenContent(token);
      console.log("helloo ");
      navigate({
        to: tokenContent.realm_access_roles.includes("dexspace_adminzzs")
          ? "/admin"
          : "/member",
        replace: true,
        search: {
          ...search,
          // @ts-ignore
          token: undefined,
        },
      });
    }
  });

  return null;
}
