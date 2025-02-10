import { Stepper, Step, StepIndicator, Typography } from "@mui/joy";

const NEW_POLICY_SET_STEPS = [
  "Prefill from template",
  "Define policy set",
  "Add policies",
  "Review and submit",
] as const;

const NEW_POLICY_SET_TEMPLATE_STEPS = [
  "Define policy set template",
  "Add policies",
  "Review and submit",
] as const;

export function AddPolicySetStepper({
  activeStep,
}: {
  activeStep: (typeof NEW_POLICY_SET_STEPS)[keyof typeof NEW_POLICY_SET_STEPS];
}) {
  return (
    <Stepper sx={{ width: "100%" }}>
      {NEW_POLICY_SET_STEPS.map((s, idx) => (
        <Step
          key={idx}
          indicator={
            <StepIndicator
              variant={activeStep === s ? "solid" : "outlined"}
              color="neutral"
            >
              {idx + 1}
            </StepIndicator>
          }
        >
          <Typography
            textColor={activeStep === s ? "neutral.700" : "neutral.500"}
          >
            {s}
          </Typography>
        </Step>
      ))}
    </Stepper>
  );
}

export function AddPolicySetTemplateStepper({
  activeStep,
}: {
  activeStep: (typeof NEW_POLICY_SET_TEMPLATE_STEPS)[keyof typeof NEW_POLICY_SET_TEMPLATE_STEPS];
}) {
  return (
    <Stepper sx={{ width: "100%" }}>
      {NEW_POLICY_SET_TEMPLATE_STEPS.map((s, idx) => (
        <Step
          key={idx}
          indicator={
            <StepIndicator
              variant={activeStep === s ? "solid" : "outlined"}
              color="neutral"
            >
              {idx + 1}
            </StepIndicator>
          }
        >
          <Typography
            textColor={activeStep === s ? "neutral.700" : "neutral.500"}
          >
            {s}
          </Typography>
        </Step>
      ))}
    </Stepper>
  );
}
