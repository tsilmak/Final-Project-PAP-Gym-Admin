import { Box, Button, Typography } from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";

const ErrorOverlay = ({ error, dataName, isButtonVisible = true }) => {
  const navigate = useNavigate();
  const errorStatus = error.status || "Status desconhecido";
  const errorMessage = error.data?.message || "Erro desconhecido";
  console.error(error);
  return (
    <Box
      sx={{
        display: "fixed",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255, 0, 0, 0.1)",
        border: "1px solid red",
        textAlign: "center",
        borderRadius: 1,
        height: "100%",
        p: 4,
      }}
    >
      <Box>
        <Typography color="error" variant="h4" sx={{ mb: 2.5 }}>
          {`Ocorreu um erro ao carregar: ${dataName}`}
        </Typography>
        <Typography variant="h5" color="secondary" sx={{ mb: 2 }}>
          <strong>Nome do Erro:</strong> {errorStatus}
        </Typography>
        <Typography variant="h5" color="secondary" sx={{ mb: 4 }}>
          <strong>Tipo de Erro:</strong> {errorMessage}
        </Typography>
        {isButtonVisible && (
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate(-1)}
          >
            Voltar
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default ErrorOverlay;
