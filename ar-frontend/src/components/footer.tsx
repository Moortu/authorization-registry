import { Box, Stack, StackProps, Typography, TypographyProps } from "@mui/joy";
import XIcon from "@mui/icons-material/X";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import backgroundImage2 from "../assets/background-2.png";
import { useConfig } from "../network/config";
import { DexesLogo } from "./dexes-logo";
import { EmailIcon } from "./email-icon";
import { PhoneIcon } from "./phone-icon";

function NavigationLink(props: TypographyProps) {
  return (
    <Typography
      textColor="#F8F8FA"
      fontFamily="Inter Variable"
      fontWeight={700}
      fontSize="16px"
      letterSpacing={0}
      sx={{
        "&:hover": {
          textDecoration: "underline",
        },
      }}
      {...props}
    />
  );
}

function NavigationHeader(props: TypographyProps) {
  return (
    <Typography
      textColor="#F8F8FA"
      fontFamily="Inter Variable"
      fontWeight={600}
      fontSize="24px"
      letterSpacing={0}
      {...props}
    />
  );
}

function Column(props: StackProps) {
  return (
    <Stack
      display="flex"
      flexBasis="25%"
      flexDirection="column"
      spacing={4}
      minWidth={200}
      {...props}
    />
  );
}

export function Footer() {
  const { data: config } = useConfig();

  if (!config) {
    return;
  }

  return (
    <Box
      sx={{
        backgroundImage: `url(${backgroundImage2})`,
        backgroundRepeat: "repeat-x",
        backgroundColor: "#330080",
        backgroundSize: "cover",
        width: "100%",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Box sx={{ maxWidth: 1440, width: 1440, height: 657 }}>
        <Box padding={8}>
          <Box paddingBottom={8}>
            <DexesLogo />
          </Box>
          <Box display="flex" flexWrap="wrap">
            <Column>
              <NavigationHeader>Navigation</NavigationHeader>
              <a href={config.footer.navigation.passport}>
                <NavigationLink>Paspoort</NavigationLink>
              </a>
              <a href={config.footer.navigation.catalogue}>
                <NavigationLink>Data catalogue</NavigationLink>
              </a>
              <a href={config.footer.navigation.authorization_registry}>
                <NavigationLink>Clearing</NavigationLink>
              </a>
              <a href={config.footer.navigation.datastation}>
                <NavigationLink>Datastation</NavigationLink>
              </a>
            </Column>
            <Column>
              <NavigationHeader>General</NavigationHeader>
              <a href={config.footer.general.become_member}>
                <NavigationLink>Become member</NavigationLink>
              </a>
              <a href={config.footer.general.faq}>
                <NavigationLink>FAQ</NavigationLink>
              </a>
              <a href={config.footer.general.about}>
                <NavigationLink>About</NavigationLink>
              </a>
              <a href={config.footer.general.support}>
                <NavigationLink>Support</NavigationLink>
              </a>
            </Column>
            <Column>
              <Stack spacing={0.5}>
                <NavigationHeader paddingBottom={1}>Contact</NavigationHeader>
                <Typography textColor="#F8F8FA" fontWeight={600}>
                  {config.footer.contact.address.name}
                </Typography>
                {config.footer.contact.address.address_content.map(
                  (line, idx) => (
                    <Typography key={idx} textColor="#F8F8FA" fontWeight={200}>
                      {line}
                    </Typography>
                  ),
                )}
              </Stack>
              <Typography textColor="#F8F8FA" fontWeight={200}>
                KVK {config.footer.contact.tax_number}
              </Typography>
              <a href={`mailto:${config.footer.contact.email}`}>
                <Box display="flex" alignItems="center" gap={1}>
                  <EmailIcon />
                  <Typography
                    textColor="#F8F8FA"
                    fontFamily="Inter Variable"
                    fontWeight={600}
                    fontSize="18px"
                    letterSpacing={0}
                  >
                    {config.footer.contact.email}
                  </Typography>
                </Box>
              </a>
              <a href={`tel:${config.footer.contact.phone_number}`}>
                <Box display="flex" alignItems="center" gap={1}>
                  <PhoneIcon />
                  <Typography
                    textColor="#F8F8FA"
                    fontFamily="Inter Variable"
                    fontWeight={600}
                    fontSize="18px"
                    letterSpacing={0}
                  >
                    {config.footer.contact.phone_number}
                  </Typography>
                </Box>
              </a>
            </Column>
            <Column>
              <Box
                display="flex"
                flexDirection="row-reverse"
                alignItems="baseline"
                width="100%"
                gap={2}
              >
                <Box>
                  <a href={config.footer.socials.x}>
                    <XIcon
                      sx={{
                        color: "#F8F8FA",
                        marginTop: 0,
                        root: { marginTop: 0 },
                        height: 36,
                        width: 36,
                      }}
                    />
                  </a>
                </Box>
                <Box>
                  <a href={config.footer.socials.linkedin}>
                    <LinkedInIcon
                      sx={{
                        marginTop: 0,
                        color: "#F8F8FA",
                        height: 40,
                        width: 40,
                      }}
                    />
                  </a>
                </Box>
              </Box>
            </Column>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
