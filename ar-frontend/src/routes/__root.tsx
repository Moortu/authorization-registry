import {
  Outlet,
  createRootRoute,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import { Box } from "@mui/joy";
import { z } from "zod";
import backgroundImage from "../assets/background.png";
import { Footer } from "@/components/footer";
import { AuthContext } from "@/auth";

const searchSchema = z
  .object({
    token: z.string().optional(),
  })
  .optional();

export const Route = createRootRouteWithContext<AuthContext>()({
  validateSearch: searchSchema,
  component: () => {
    return (
      <Box>
        <Box
          sx={{
            backgroundColor: "#f4f5f6",
            minHeight: "100vh",
            backgroundImage: `url(${backgroundImage})`,
            backgroundPosition: "top 200px left 0px",
            backgroundRepeat: "repeat-x",
          }}
        >
          <Outlet />
          <Box sx={{ height: 240 }} />
        </Box>
        <Footer />
      </Box>
    );
  },
});
