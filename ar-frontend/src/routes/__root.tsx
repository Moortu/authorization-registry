import { Outlet, createRootRoute } from "@tanstack/react-router";
import { Box } from "@mui/joy";

export const Route = createRootRoute({
  component: () => {
    return (
      <Box
        sx={{
          backgroundImage:
            "linear-gradient(to right bottom, #efe3eb, #fefefe, #fefefe, #efe3eb)",
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Box sx={{ maxWidth: 900, width: 900, paddingX: 1 }}>
          <Outlet />
        </Box>
      </Box>
    );
  },
});
