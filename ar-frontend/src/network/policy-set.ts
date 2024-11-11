import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { baseAPIUrl, ErrorResponse, useAuthenticatedFetch } from "./fetch";
import { z } from "zod";
import { CreatePolicySet } from "@/routes/__auth/new_policy_set";

const policySchema = z.object({
  id: z.string(),
  actions: z.array(z.string()),
  identifiers: z.array(z.string()),
  resource_type: z.string(),
  attributes: z.array(z.string()),
  service_providers: z.array(z.string()),
  rules: z.array(
    z.union([
      z.object({
        effect: z.literal("Permit"),
      }),
      z.object({
        effect: z.literal("Deny"),
        target: z.object({
          actions: z.array(z.string()),
          resource: z.object({
            type: z.string(),
            attributes: z.array(z.string()),
            identifiers: z.array(z.string()),
          }),
        }),
      }),
    ]),
  ),
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
    queryKey: ["admin", "policy-sets", policySetId],
    queryFn: async function () {
      const response = await authenticatedFetch(
        `${baseAPIUrl}/admin/policy-set/${policySetId}`,
      );
      const json = await response.json();

      try {
        return policySetWithPoliciesSchema.parse(json);
      } catch (e) {
        console.error(e);
      }
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

      try {
        return z.array(policySetWithPoliciesSchema).parse(json);
      } catch (e) {
        console.error(e);
      }
    },
  });
}

export function useAddAdminPolicyToPolicySet({
  policySetId,
}: {
  policySetId: string;
}) {
  const authenticatedFetch = useAuthenticatedFetch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ policy }: { policy: Omit<Policy, "id"> }) => {
      await authenticatedFetch(
        `${baseAPIUrl}/admin/policy-set/${policySetId}/policy`,
        {
          method: "POST",
          body: JSON.stringify({
            target: {
              actions: policy.actions,
              environment: {
                serviceProviders: policy.service_providers,
              },
              resource: {
                type: policy.resource_type,
                identifiers: policy.identifiers,
                attributes: policy.attributes,
              },
            },
            rules: policy.rules,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      queryClient.invalidateQueries({
        queryKey: ["admin", "policy-sets"],
      });

      queryClient.invalidateQueries({
        queryKey: ["admin", "policy-sets", policySetId],
      });
    },
  });
}

export function useDeleteAdminPolicyFromPolicySet({
  policySetId,
}: {
  policySetId: string;
}) {
  const authenticatedFetch = useAuthenticatedFetch();
  const queryClient = useQueryClient();

  return useMutation<void, ErrorResponse, { policyId: string }>({
    mutationFn: async ({ policyId }: { policyId: string }) => {
      await authenticatedFetch(
        `${baseAPIUrl}/admin/policy-set/${policySetId}/policy/${policyId}`,
        {
          method: "DELETE",
        },
      );

      queryClient.invalidateQueries({
        queryKey: ["admin", "policy-sets"],
      });

      queryClient.invalidateQueries({
        queryKey: ["admin", "policy-sets", policySetId],
      });
    },
  });
}

export function useDeleteAdminPolicySet({
  policySetId,
}: {
  policySetId: string;
}) {
  const authenticatedFetch = useAuthenticatedFetch();
  const queryClient = useQueryClient();

  return useMutation<void, ErrorResponse, void>({
    mutationFn: async () => {
      await authenticatedFetch(
        `${baseAPIUrl}/admin/policy-set/${policySetId}`,
        {
          method: "DELETE",
        },
      );

      queryClient.invalidateQueries({
        queryKey: ["admin", "policy-sets"],
      });

      queryClient.invalidateQueries({
        queryKey: ["admin", "policy-sets", policySetId],
      });
    },
  });
}

export function useAdminCreatePolicySet() {
  const authenticatedFetch = useAuthenticatedFetch();
  const queryClient = useQueryClient();

  return useMutation<void, ErrorResponse, CreatePolicySet>({
    mutationFn: async (policySet: CreatePolicySet) => {
      await authenticatedFetch(`${baseAPIUrl}/admin/policy-set`, {
        method: "POST",
        body: JSON.stringify({
          target: {
            accessSubject: policySet.access_subject,
          },
          licences: ["ISHARE.0001"],
          maxDelegationDepth: 1,
          policies: policySet.policies.map((p) => ({
            rules: p.rules,
            target: {
              actions: p.actions,
              resource: {
                type: p.resource_type,
                identifiers: p.identifiers,
                attributes: p.attributes,
              },
              environment: {
                serviceProviders: p.service_providers,
              },
            },
          })),
          policyIssuer: policySet.policy_issuer,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      queryClient.invalidateQueries({
        queryKey: ["admin", "policy-sets"],
      });
    },
  });
}
