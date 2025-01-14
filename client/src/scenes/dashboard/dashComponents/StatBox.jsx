import { useTheme } from "@emotion/react";
import { Box, Typography, Skeleton } from "@mui/material";
import React from "react";
import FlexBetween from "../../../components/common/FlexBetween";

const StatBox = ({ title, icon, value, increase, description, isLoading }) => {
  const theme = useTheme();

  return (
    <Box
      gridColumn="span 2"
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      p="1.25rem 1rem"
      flex="1 1 100%"
      backgroundColor={theme.palette.background.alt}
      borderRadius="0.55rem"
    >
      {isLoading ? (
        <>
          <Skeleton variant="text" width={120} height={30} />
          <Skeleton variant="rectangular" height={25} />
          <Skeleton variant="text" width={80} height={20} />
        </>
      ) : (
        <>
          <FlexBetween>
            <Typography
              variant="h6"
              sx={{ color: theme.palette.secondary[100] }}
            >
              {title}
            </Typography>
            {icon}
          </FlexBetween>
          <Typography
            variant="h3"
            fontWeight="600"
            sx={{ color: theme.palette.secondary[200] }}
          >
            {value}
          </Typography>
          <FlexBetween gap="1rem">
            <Typography
              variant="h5"
              fontStyle="italic"
              sx={{ color: theme.palette.secondary.light }}
            >
              {increase}
            </Typography>
            <Typography>{description}</Typography>
          </FlexBetween>
        </>
      )}
    </Box>
  );
};

export default StatBox;
