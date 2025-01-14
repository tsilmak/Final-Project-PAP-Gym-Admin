import React, { useState, useEffect } from "react";
import Header from "components/common/Header";
import {
  Box,
  Button,
  Card,
  CardContent,
  List,
  ListItem,
  TextField,
  Typography,
  Snackbar,
  Alert,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { useTheme } from "@emotion/react";
import {
  CheckCircle,
  AddCircle,
  RemoveCircleRounded,
  CheckBox,
} from "@mui/icons-material";
import { useGetGymPlanByIdQuery, useUpdateGymPlanMutation } from "state/api";
import { useNavigate, useParams } from "react-router-dom";
import Loading from "components/common/Loading";
import ErrorOverlay from "components/common/ErrorOverlay";

const EditGymPlan = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();

  const { data: gymPlan, isLoading, error } = useGetGymPlanByIdQuery(id);

  const [editGymPlan, { isLoading: isGuardarLoading }] =
    useUpdateGymPlanMutation();

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [features, setFeatures] = useState([]);
  const [newFeature, setNewFeature] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isHighlightedPlan, setIsHighlightedPlan] = useState(false);

  const [open, setOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  useEffect(() => {
    if (gymPlan && gymPlan.data) {
      setName(gymPlan.data.name || "");
      setPrice(gymPlan.data.price || "");
      setFeatures(
        Array.isArray(gymPlan.data.features) ? gymPlan.data.features : []
      );
    }
  }, [gymPlan]);

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setFeatures([...features, { feature: newFeature }]);
      setNewFeature("");
    }
  };

  const handleRemoveFeature = (indexToRemove) => {
    setFeatures(features.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const gymPlanData = {
      gymPlanId: id,
      gymPlan: {
        name,
        price: parseFloat(price),
        features,
        isActive,
        isHighlightedPlan,
      },
    };

    try {
      await editGymPlan(gymPlanData).unwrap();
      setSnackbarMessage("Plano editado com sucesso!");
      setSnackbarSeverity("success");
      setOpen(true);
    } catch (error) {
      setSnackbarMessage("Falha ao editar o plano. Tente novamente.");
      setSnackbarSeverity("error");
      console.error("Failed to edit gym plan:", error);
      setOpen(true);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  if (isLoading) return <Loading />;
  if (error)
    return <ErrorOverlay error={error} dataName={"O plano de ginásio"} />;

  return (
    <>
      <Header
        title={"Edita o Plano"}
        subtitle={
          "Utiliza este formulário para editar o teu plano de ginásio. Lembra-te que todas as informações fornecidas serão apresentadas ao utilizador final."
        }
      />
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          mt: "5rem",
          mr: "5rem",
          ml: "5rem",
        }}
      >
        <form onSubmit={handleSubmit}>
          <Card
            variant="outlined"
            sx={{
              display: "flex",
              flexDirection: "row",
              boxShadow: 3,
              backgroundColor: theme.palette.background.alt,
              justifyContent: "space-between",
            }}
          >
            <CardContent sx={{ flex: 1 }}>
              <TextField
                label="Nome do Plano"
                margin="normal"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                sx={{
                  display: "flex",
                }}
              />

              <Box
                sx={{
                  display: "flex",
                  alignItems: "baseline",
                }}
              >
                <TextField
                  label="Preço"
                  type="number"
                  margin="normal"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  sx={{
                    display: "flex",
                  }}
                />

                <Typography
                  variant="h3"
                  component="span"
                  sx={{ ml: 2, fontWeight: "bold" }}
                >
                  € /Mês
                </Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", my: 2 }}>
                <TextField
                  label="Nova Descrição"
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  sx={{ flexGrow: 1, mr: 2 }}
                />
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleAddFeature}
                  startIcon={<AddCircle />}
                >
                  Adicionar
                </Button>
              </Box>

              <List sx={{ my: 3 }}>
                {features.map((featureObj, index) => (
                  <ListItem
                    key={index}
                    sx={{ display: "flex", alignItems: "center" }}
                  >
                    <CheckCircle sx={{ mr: 1 }} />
                    <Typography color="secondary">
                      {featureObj.feature}
                    </Typography>{" "}
                    {/* Access the feature property */}
                    <RemoveCircleRounded
                      onClick={() => handleRemoveFeature(index)}
                      sx={{ ml: 5, color: "red", cursor: "pointer" }}
                    />
                  </ListItem>
                ))}
              </List>

              <FormControlLabel
                control={
                  <Checkbox
                    checked={isActive}
                    onChange={() => setIsActive(!isActive)}
                    color="primary"
                  />
                }
                label="Plano Vísivel?"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={isHighlightedPlan}
                    onChange={() => setIsHighlightedPlan(!isHighlightedPlan)}
                    color="primary"
                  />
                }
                label="Destacar este plano?"
              />
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => navigate(-1)}
                >
                  Voltar
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="secondary"
                  disabled={isGuardarLoading}
                >
                  {isGuardarLoading ? "A Guardar..." : "Guardar"}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </form>
        <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
          <Alert
            onClose={handleClose}
            severity={snackbarSeverity}
            sx={{ width: "100%" }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    </>
  );
};

export default EditGymPlan;
