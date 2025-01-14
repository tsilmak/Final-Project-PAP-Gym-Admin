import React, { useState, useMemo } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Typography,
  Chip,
  ListItem,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
} from "@mui/material";
import { useTheme } from "@emotion/react";
import Header from "components/common/Header";
import { useGetGymPlanQuery, useDeleteGymPlanMutation } from "state/api";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle } from "@mui/icons-material";
import Loading from "components/common/Loading";
import SearchBar from "../../../components/common/SearchBar";
import ErrorOverlay from "components/common/ErrorOverlay";

const GymPlans = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const {
    data: responseData,
    isLoading,
    error,
    refetch,
  } = useGetGymPlanQuery();

  const [deleteGymPlan] = useDeleteGymPlanMutation();
  const [confirmDeleteDialogOpen, setConfirmDeleteDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const handleDelete = (planId) => {
    setSelectedPlan({ _id: planId });
    setConfirmDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedPlan?._id) {
      setSnackbarMessage("Plano não encontrado.");
      setSnackbarOpen(true);
      return;
    }

    try {
      await deleteGymPlan(selectedPlan._id).unwrap();
      setSnackbarMessage(
        "O plano foi elminado e não será mais vísivel pelos clientes, mais ainda terá que remove-lo manualmente na sua Stripe DASHBOARD. "
      );
      refetch();
    } catch (err) {
      console.log(err);
      setSnackbarMessage("Falha ao eliminar o plano. " + err.data.message);
    } finally {
      setConfirmDeleteDialogOpen(false);
      setSnackbarOpen(true);
    }
  };

  const handleCloseSnackbar = () => setSnackbarOpen(false);
  const handleEdit = (planId) => navigate(`/planos/editar/${planId}`);

  const rows = useMemo(() => {
    const gymPlans = responseData?.data || [];
    return Array.isArray(gymPlans)
      ? gymPlans.map((plan) => ({
          id: plan.gymPlanId,
          code: plan.productStripeId
            ? plan.productStripeId.toString().substring(0, 14)
            : "",
          ...plan,
        }))
      : [];
  }, [responseData]);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const matchesCode = (row.code || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesName = (row.name || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesFeature = (row.features || []).some(
        (feature) =>
          typeof feature === "string" &&
          feature.toLowerCase().includes(searchQuery.toLowerCase())
      );

      return matchesCode || matchesName || matchesFeature;
    });
  }, [rows, searchQuery]);
  console.log();
  if (isLoading) return <Loading />;
  if (error) return <ErrorOverlay error={error} dataName={"Todos os Planos"} />;

  return (
    <Box>
      <Header
        title="Visualização de Todos os Planos"
        subtitle="Gerencia os seus planos de ginásio"
      />

      <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <Box sx={{ display: "flex", justifyContent: "end", mr: "5rem" }}>
        <Button
          variant="contained"
          sx={{ ml: "5rem", width: 150, mb: "1.25rem" }}
          onClick={() => navigate("criar")}
        >
          Criar um Plano
        </Button>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          ml: "5rem",
          mr: "5rem",
        }}
      >
        {filteredRows.map((plan) => (
          <Card
            key={plan.id}
            variant="outlined"
            sx={{
              width: 350,
              height: 500,
              display: "flex",
              flexDirection: "column",
              boxShadow: 3,
              backgroundColor: theme.palette.background.alt,
              justifyContent: "space-between",
              border: plan.isHighlightedPlan
                ? `2px solid ${theme.palette.secondary.main}`
                : "",
            }}
          >
            <Box
              sx={{
                mx: 2,
                mt: 2,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <Chip
                size="small"
                label={`Código Stripe: ${plan.code}`}
                sx={{
                  backgroundColor: plan.isActive ? "green" : "red",
                }}
              />
              <Link to={`/planos/clientes/${plan.id}`}>
                <Chip
                  size="small"
                  label={`Clientes: ${plan.clientsCount}`}
                  style={{ textDecoration: "underline" }}
                />
              </Link>
            </Box>
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography variant="h5" component="div">
                {plan.price}
                {"€"}
                <Typography variant="body2" color="text.secondary">
                  /mês
                </Typography>
              </Typography>
              <Typography variant="body1" sx={{ mt: 1, fontWeight: "bold" }}>
                {plan.name}
              </Typography>
              <Box sx={{ mt: 1, maxHeight: 300, overflowY: "auto" }}>
                {plan.features.map((feature, index) => (
                  <ListItem
                    key={index}
                    sx={{ display: "flex", alignItems: "center" }}
                  >
                    <CheckCircle sx={{ mr: 1 }} />
                    <Typography color="secondary">{feature.feature}</Typography>
                  </ListItem>
                ))}
              </Box>
            </CardContent>
            <CardActions sx={{ justifyContent: "center", mb: 2 }}>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => handleEdit(plan.id)}
                startIcon={<EditIcon />}
                sx={{ mr: 1 }}
              >
                Editar
              </Button>
              <Tooltip
                title={
                  plan.clientsCount >= 1
                    ? "Impossível eliminar, existem clientes associados a este plano."
                    : ""
                }
              >
                <Box component="span" display="inline-block">
                  <Button
                    variant="contained"
                    color="error"
                    disabled={plan.clientsCount >= 1}
                    onClick={() => handleDelete(plan.id)}
                    startIcon={<DeleteIcon />}
                  >
                    Eliminar
                  </Button>
                </Box>
              </Tooltip>
            </CardActions>
          </Card>
        ))}
      </Box>

      {/* Snackbar  */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarMessage.includes("Falha") ? "error" : "success"}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* Confirmation dialog for deletion */}
      <Dialog
        open={confirmDeleteDialogOpen}
        onClose={() => setConfirmDeleteDialogOpen(false)}
        sx={{
          "& .MuiPaper-root": {
            backgroundColor: theme.palette.background.alt,
            color: theme.palette.secondary[200],
          },
        }}
      >
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <p>Tens a certeza que desejas eliminar este plano?</p>
          <p>Esta ação é irreversível!</p>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setConfirmDeleteDialogOpen(false)}
            sx={{ color: theme.palette.secondary[100] }}
          >
            Cancelar
          </Button>
          <Button onClick={confirmDelete} color="secondary" autoFocus>
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GymPlans;
