import { createFileRoute, Outlet } from "@tanstack/react-router";
import { z } from "zod";
import { isAuthenticated, useAuthStore } from "../auth";
import { initLogin } from "../network/idp";

const searchSchema = z
  .object({
    token: z.string().optional(),
  })
  .optional();

export const Route = createFileRoute("/__auth")({
  component: Component,
  validateSearch: searchSchema,
  beforeLoad: async () => {
    const auth = useAuthStore.getState();

    if (!isAuthenticated(auth.token)) {
      await initLogin();
    }
  },
});

function Component() {
  return <Outlet />;
}
