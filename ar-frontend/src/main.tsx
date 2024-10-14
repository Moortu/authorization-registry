import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createRouter, RouterProvider } from '@tanstack/react-router'
import './index.css'
import "@fontsource-variable/merriweather-sans";

import { CssVarsProvider, extendTheme } from "@mui/joy";

import { routeTree } from './routeTree.gen'

// Create a new router instance
const router = createRouter({ routeTree })

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}


const theme = extendTheme({
  fontFamily: {
    display: "Merriweather Sans Variable", // applies to `h1`–`h4`
    body: "Merriweather Sans Variable", // applies to `title-*` and `body-*`
  },
});

function WrappedApp() {
  return (
    <CssVarsProvider theme={theme}>
      <RouterProvider router={router} />
    </CssVarsProvider>
  )
}


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WrappedApp />
  </StrictMode>,
)
