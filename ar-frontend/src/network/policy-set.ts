import { useQuery } from "@tanstack/react-query";
import { baseAPIUrl, useAuthenticatedFetch } from "./fetch";
import { z } from "zod";

const policySetSchema = z.object({
  policy_set_id: z.string(),
  policies: z.array(z.object({
    id: z.string(),
    actions: z.array(z.string()),
    identifiers: z.array(z.string()),
    resource_type: z.string(),
    attributes: z.array(z.string()),
    service_providers: z.array(z.string())
  })),
  access_subject: z.string(),
  policy_issuer: z.string(),
})


export function useAdminPolicySets({
  accessSubject
}: {
  accessSubject?: string
}) {
  const search = new URLSearchParams();
  const authenticatedFetch = useAuthenticatedFetch();

  if (accessSubject) {
    search.append("access_subject", accessSubject)
  }

  return useQuery({
    queryKey: ["admin", "policy-sets", search.toString()],
    queryFn: async function() {
      const response = await authenticatedFetch(`${baseAPIUrl}/admin/policy-set?${search}`);
      const json = await response.json();

      console.log({
        json
      })

      return z.array(policySetSchema).parse(json);
    } 
  })
}