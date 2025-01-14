import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const NotFound404 = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1); // Go to the previous page
  };

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        color: "text.primary",
        textAlign: "center",
        p: 3,
      }}
    >
      <Typography variant="h1" sx={{ fontWeight: 700, fontSize: "8rem" }}>
        404
      </Typography>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Esta página não existe.
      </Typography>

      <Button
        variant="contained"
        color="primary"
        onClick={() => navigate(-1)}
        sx={{ px: 5, py: 1 }}
      >
        Voltar
      </Button>
    </Box>
  );
};

export default NotFound404;
