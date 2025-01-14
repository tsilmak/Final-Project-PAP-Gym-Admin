import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setCredetials } from "state/authSlice";
import { useLoginMutation } from "state/api";
import LoadingButton from "@mui/lab/LoadingButton";
import SaveIcon from "@mui/icons-material/Save";
import { useTheme } from "@emotion/react";
import {
  TextField,
  Button,
  Container,
  Typography,
  Box,
  Paper,
  Grid,
} from "@mui/material";

const LoginPage = () => {
  const theme = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const [login, { isLoading, isError, error }] = useLoginMutation();
  const [customError, setCustomError] = useState("");
  const dispatch = useDispatch();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const { accessToken, user } = await login({
        email,
        password,
      }).unwrap();
      dispatch(setCredetials({ accessToken, user }));
      navigate("/dashboard");
    } catch (error) {
      console.error("Erro ao inicar sessão:", error);
      if (!error.status) {
        setCustomError("Nenhuma resposta por parte do servidor");
      }
    }
  };

  return (
    <Container component="main" maxWidth="md" sx={{ mt: "10rem" }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Paper
            elevation={3}
            sx={{ padding: 3, backgroundColor: theme.palette.background.alt }}
          >
            <Typography variant="h4" component="h1" gutterBottom>
              Login
            </Typography>
            <form onSubmit={handleLogin}>
              <Box mb={2}>
                <TextField
                  fullWidth
                  label="Email"
                  variant="outlined"
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Box>
              <Box mb={2}>
                <TextField
                  fullWidth
                  label="Password"
                  variant="outlined"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Box>
              {isLoading ? (
                <LoadingButton
                  loading
                  loadingPosition="start"
                  startIcon={<SaveIcon />}
                  fullWidth
                  variant="outlined"
                >
                  A carregar, aguarde.
                </LoadingButton>
              ) : (
                <Button
                  type="submit"
                  color="secondary"
                  variant="contained"
                  fullWidth
                  disabled={isLoading}
                >
                  Login
                </Button>
              )}

              {(isError || customError) && (
                <Typography color="error" mt={2}>
                  {error?.data?.message ||
                    customError ||
                    "O Login falhou: Erro desconhecido"}
                </Typography>
              )}
            </form>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Box display="flex" flexDirection="column" alignItems="center">
            <Typography variant="h4" sx={{ mb: 2 }}>
              ADMINISTRADOR
            </Typography>
            <Typography variant="h5" sx={{ mb: 2, mt: 4 }}>
              Email: admin@gymhub.com
            </Typography>
            <Typography variant="h5" sx={{ mb: 2 }}>
              Password: jB7vcFKY
            </Typography>
          </Box>
          <Box display="flex" flexDirection="column" alignItems="center">
            <Typography variant="h4" sx={{ mb: 2 }}>
              TREINADOR
            </Typography>
            <Typography variant="h5" sx={{ mb: 2, mt: 4 }}>
              Email: treinador@gymhub.com
            </Typography>
            <Typography variant="h5" sx={{ mb: 2 }}>
              Password: wvngsMtH
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default LoginPage;
