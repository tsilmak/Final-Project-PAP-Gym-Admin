import { CircularProgress, Box, Typography } from "@mui/material";
import React from "react";

const Loading = ({ showText = true }) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
      }}
    >
      {showText && (
        <Typography variant="body1" gutterBottom>
          Os Dados estão a carregar, Por favor aguarde
        </Typography>
      )}
      <CircularProgress />
    </Box>
  );
};

export default Loading;
