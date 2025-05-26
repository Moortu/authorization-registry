import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import "./index.css";
import "@fontsource-variable/merriweather-sans";
import "@fontsource-variable/karla";

import { CssVarsProvider, extendTheme } from "@mui/joy";

import { routeTree } from "./routeTree.gen";
import { AuthProvider } from "./auth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Create a new router instance
const router = createRouter({ routeTree });

const queryClient = new QueryClient();

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const theme = extendTheme({
  fontFamily: {
    display: "Merriweather Sans Variable", // applies to `h1`–`h4`
    body: "Karla Variable", // applies to `title-*` and `body-*`
  },
  typography: {
    h2: {
      fontSize: "32px",
    },
    h3: {
      color: "#363D44",
    },
    "body-lg": {
      fontSize: "16px",
      color: "#363D44",
    },
    "body-md": {
      fontWeight: 300,
      fontSize: "14px",
      letterSpacing: "-0.43px",
      lineHeight: "16.52px",
      color: "#6D7A88",
    },
    "title-lg": {
      fontSize: "14px",
      color: "#363D44",
      fontFamily: "Merriweather Sans Variable",
    },
    "title-md": {
      fontWeight: 400,
      textTransform: "uppercase",
      letterSpacing: "0px",
      fontSize: "11px",
      color: "#828F9B",
      fontFamily: "Merriweather Sans Variable",
    },
  },
  components: {
    JoyChip: {
      styleOverrides: {
        label: () => ({
          whiteSpace: "pre",
        }),
      },
    },
    JoyButton: {
      styleOverrides: {
        root: ({ ownerState }) => ({
          minHeight: "14px",
          borderRadius: "48px",
          fontFamily: "Karla Variable",
          paddingLeft: "16px",
          paddingRight: "16px",
          lineHeight: "16.52px",
          paddingTop: "8px",
          paddingBottom: "8px",
          letterSpacing: "1.1px",
          textTransform: "uppercase",
          fontWeight: 500,
          fontSize: "14px",
          ...(ownerState.size === "lg"
            ? {
                paddingLeft: "20px",
                paddingRight: "20px",
                minHeight: "14px",
                paddingTop: "12px",
                paddingBottom: "12px",
              }
            : {}),
        }),
      },
    },
  },
});

function WrappedApp() {
  return (
    <CssVarsProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </QueryClientProvider>
    </CssVarsProvider>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <WrappedApp />
  </StrictMode>,
);
