import { useQuery } from "@tanstack/react-query";
import { baseAPIUrl, useAuthenticatedFetch } from "./fetch";
import { z } from "zod";

const policySchema = z.object({
  id: z.string(),
  actions: z.array(z.string()),
  identifiers: z.array(z.string()),
  resource_type: z.string(),
  attributes: z.array(z.string()),
  service_providers: z.array(z.string()),
});

const policySetWithPoliciesSchema = z.object({
  policy_set_id: z.string(),
  policies: z.array(policySchema),
  access_subject: z.string(),
  policy_issuer: z.string(),
});

export type Policy = z.infer<typeof policySchema>;
export type PolicySetWithPolicies = z.infer<typeof policySetWithPoliciesSchema>;

export function useAdminPolicySet({ policySetId }: { policySetId: string }) {
  const authenticatedFetch = useAuthenticatedFetch();

  return useQuery({
    throwOnError: true,
    queryKey: ["admin", "policy-set", policySetId],
    queryFn: async function () {
      const response = await authenticatedFetch(
        `${baseAPIUrl}/admin/policy-set/${policySetId}`,
      );
      const json = await response.json();

      return policySetWithPoliciesSchema.parse(json);
    },
  });
}

export function useAdminPolicySets({
  accessSubject,
  policyIssuer,
}: {
  accessSubject?: string;
  policyIssuer?: string;
}) {
  const search = new URLSearchParams();
  const authenticatedFetch = useAuthenticatedFetch();

  if (accessSubject) {
    search.append("access_subject", accessSubject);
  }

  if (policyIssuer) {
    search.append("policy_issuer", policyIssuer);
  }

  return useQuery({
    throwOnError: true,
    queryKey: ["admin", "policy-sets", search.toString()],
    queryFn: async function () {
      const response = await authenticatedFetch(
        `${baseAPIUrl}/admin/policy-set?${search}`,
      );
      const json = await response.json();

      return z.array(policySetWithPoliciesSchema).parse(json);
    },
  });
}
