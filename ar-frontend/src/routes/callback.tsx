import { getTokenContent, useAuthStore } from "@/auth";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";

const validateSearch = z.object({
  token: z.string(),
});

export const Route = createFileRoute("/callback")({
  validateSearch: validateSearch,
  component: Component,
  beforeLoad: ({ search }) => {
    useAuthStore.getState().setToken(search.token);

    const tokenContent = getTokenContent(search.token);

    throw redirect({
      to: tokenContent.realm_access_roles.includes("dexspace_admin")
        ? "/admin/policy_set"
        : "/member",
    });
  },
});

function Component() {
  return null;
}
