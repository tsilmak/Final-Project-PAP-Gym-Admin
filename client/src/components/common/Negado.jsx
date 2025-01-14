import React, { useEffect } from "react";
import { Container, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useRefreshMutation } from "state/api";
import {
  setCredetials,
  logOut,
  selectCurrentToken,
  selectCurrentUser,
} from "state/authSlice";
import { useLogoutMutation } from "state/api";

const Negado = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [refresh] = useRefreshMutation();
  const [logout, { isLoading }] = useLogoutMutation();
  const token = useSelector(selectCurrentToken);
  const user = useSelector(selectCurrentUser);

  useEffect(() => {
    // This runs only once on mount
    const attemptRefresh = async () => {
      if (!user) return; // No user, nothing to do
      //if response is unauth to refresh token logout
      try {
        // Case: user exists without a token
        if (user && !token) {
          await logout().unwrap();
          useLogoutMutation();
        }

        // Case: user and token are both present, proceed with refresh
        if (user && token) {
          const refreshResult = await refresh().unwrap();
          console.log("token", refreshResult);
          if (refreshResult) {
            dispatch(
              setCredetials({
                accessToken: refreshResult.accessToken,
                user: refreshResult.user,
              })
            );
          }
        }
      } catch (error) {
        console.log("Error refreshing token:", error);
      }
    };

    attemptRefresh();
  }, []);

  const handleHomeRedirect = () => {
    navigate("/"); // Redirect to home or another route
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        backgroundColor: "#f8d7da",
        color: "#721c24",
        textAlign: "center",
        padding: "20px",
        borderRadius: "8px",
        boxShadow: 3,
      }}
    >
      <Typography variant="h4" component="h1" gutterBottom>
        Acesso Negado
      </Typography>
      <Typography variant="body1" paragraph>
        Você não possui as permissões necessárias para acessar esta página.
        Entre em contato com o administrador do sistema para obter mais
        informações.
      </Typography>
      <Button
        variant="contained"
        color="secondary"
        onClick={handleHomeRedirect}
        sx={{ marginTop: "20px", color: "#ffffff" }}
      >
        Voltar à Página Inicial
      </Button>
    </Container>
  );
};

export default Negado;
