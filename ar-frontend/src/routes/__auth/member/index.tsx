import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/__auth/member/')({
  component: () => <div>Hello /__auth/member/!</div>,
})
