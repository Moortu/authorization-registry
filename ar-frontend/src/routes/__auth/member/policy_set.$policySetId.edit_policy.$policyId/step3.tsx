import { Step3 } from '@/components/add-edit-policy'
import { Policy, useReplacePolicyToPolicySet } from '@/network/policy-set'
import { createFileRoute, useNavigate } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/__auth/member/policy_set/$policySetId/edit_policy/$policyId/step3',
)({
  component: Component,
})

function Component() {
  const navigate = useNavigate()
  const params = Route.useParams()
  const {
    mutateAsync: replacePolicy,
    isPending,
    error,
  } = useReplacePolicyToPolicySet({
    policyId: params.policyId,
    policySetId: params.policySetId,
  })

  function onBack() {
    navigate({
      to: '/member/policy_set/$policySetId/edit_policy/$policyId/step2',
      params,
    })
  }

  function onSubmit({ policy }: { policy: Omit<Policy, 'id'> }) {
    replacePolicy({ policy }).then(() => {
      navigate({
        to: '/member/policy_set/$policySetId',
        params: {
          policySetId: params.policySetId,
        },
      })
    })
  }

  return (
    <Step3
      onBack={onBack}
      onSubmit={onSubmit}
      isSubmitting={isPending}
      error={error}
    />
  )
}
