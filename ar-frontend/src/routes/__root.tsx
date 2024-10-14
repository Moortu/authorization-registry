import * as React from 'react'
import { Outlet, createRootRoute } from '@tanstack/react-router'
import { Typography } from '@mui/joy'

export const Route = createRootRoute({
  component: () => (
    <React.Fragment>
      <Typography>Hello "__root"!</Typography>
      <Outlet />
    </React.Fragment>
  ),
})
