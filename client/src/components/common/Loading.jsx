import { LinearProgress } from "@mui/material";
import React from "react";

const Loading = ({ showText = true }) => {
  return (
    <LinearProgress
      sx={{
        mt: "2.75rem",
      }}
      color="primary"
    />
  );
};

export default Loading;
