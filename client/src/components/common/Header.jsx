import { Typography, Box, useTheme, useMediaQuery } from "@mui/material";
import React from "react";

const Header = ({ title, subtitle }) => {
  const theme = useTheme();
  const isMedium = useMediaQuery(theme.breakpoints.down("md"));
  return (
    <Box>
      <Typography
        variant="h2"
        color={theme.palette.secondary[100]}
        fontWeight="bold"
        sx={{
          mt: "4.05rem",
          mb: "0.25rem",
          ml: isMedium ? "2rem" : "5rem",
        }}
      >
        {title}
      </Typography>
      <Typography
        variant="h5"
        color={theme.palette.secondary[300]}
        sx={{
          mb: "1.5rem",
          ml: isMedium ? "2rem" : "5rem",
        }}
      >
        {subtitle}
      </Typography>
    </Box>
  );
};

export default Header;
