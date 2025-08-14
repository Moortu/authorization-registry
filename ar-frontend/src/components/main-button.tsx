import { Button, ButtonProps } from "@mui/joy";
import { darken } from "@mui/system";

const MAIN_COLOR = "#007EFF";

export function MainButton(props: ButtonProps) {
  return (
    <Button
      sx={{
        borderRadius: "8px",
        height: "43px",
        boxShadow: "0px 0px 36px 0px #FF358340",
        backgroundColor: MAIN_COLOR,
        "&:hover": {
          backgroundColor: darken(MAIN_COLOR, 0.1),
        },
        "&&:active": {
          backgroundColor: darken(MAIN_COLOR, 0.3),
        },
      }}
      {...props}
    />
  );
}
