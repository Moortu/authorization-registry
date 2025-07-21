import { useQuery } from "@tanstack/react-query";
import { baseAPIUrl, useAuthenticatedFetch } from "./fetch";
import { z } from "zod";

const configSchema = z.object({
  footer: z.object({
    navigation: z.object({
      passport: z.string(),
      catalogue: z.string(),
      authorization_registry: z.string(),
      datastation: z.string(),
    }),
    general: z.object({
      become_member: z.string(),
      faq: z.string(),
      about: z.string(),
      support: z.string(),
    }),
    contact: z.object({
      address: z.object({
        name: z.string(),
        address_content: z.array(z.string()),
      }),
      tax_number: z.string(),
      email: z.string(),
      phone_number: z.string(),
    }),
    socials: z.object({
      linkedin: z.string(),
      x: z.string(),
    }),
  }),
});

export function useConfig() {
  const authenticatedFetch = useAuthenticatedFetch();

  return useQuery({
    queryKey: ["config"],
    throwOnError: true,
    queryFn: async () => {
      const response = await authenticatedFetch(`${baseAPIUrl}/config`);

      const json = await response.json();

      return configSchema.parse(json);
    },
  });
}
