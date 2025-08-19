import { Box } from "@mui/joy";
import backgroundImage from "../assets/background.png";
import { ReactNode } from "react";
import { Footer } from "./footer";

export function PageContainer({ children }: { children: ReactNode }) {
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
        {children}
        <Box sx={{ height: 240 }} />
      </Box>
      <Footer />
    </Box>
  );
}
