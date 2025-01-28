import { z } from "zod";
import { policySchema } from "@/network/policy-set";
import { useQuery } from "@tanstack/react-query";
import { baseAPIUrl, useAuthenticatedFetch } from "./fetch";

const policySetTemplateSchema = z.object({
  name: z.string(),
  policies: z.array(policySchema.omit({ id: true })),
  access_subject: z.string().optional(),
  policy_issuer: z.string().optional(),
});

export function usePolicySetTemplates() {
  const authenticatedFetch = useAuthenticatedFetch();

  return useQuery({
    throwOnError: true,
    queryKey: ["policy-set-template"],
    queryFn: async function () {
      const response = await authenticatedFetch(
        `${baseAPIUrl}/policy-set-template`,
      );
      const json = await response.json();

      try {
        return z.array(policySetTemplateSchema).parse(json);
      } catch (e) {
        console.error(e);
      }
    },
  });
}
