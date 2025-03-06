import React, { useState, useMemo, useEffect } from "react";
import {
  Box,
  Button,
  Grid,
  Typography,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  TextField,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  InputAdornment,
  IconButton,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Input,
  useMediaQuery,
} from "@mui/material";
import {
  Search,
  Clear,
  FitnessCenter,
  Edit,
  CloudUpload,
  DeleteOutline,
} from "@mui/icons-material";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";

import {
  useDeleteExerciseByIdMutation,
  useEditExerciseByIdMutation,
  useGetAllMachinesQuery,
  useGetExerciseByIdQuery,
} from "state/api";
import Header from "components/common/Header";
import { useNavigate, useParams } from "react-router-dom";
import { useTheme } from "@emotion/react";
import Loading from "components/common/Loading";
import ErrorOverlay from "components/common/ErrorOverlay";

const MACHINE_TYPE_COLORS = {
  Cardio: "#3f51b5",
  Musculacao: "#f50057",
  Funcional: "#4caf50",
};

const responsiveButtonStyles = {
  minWidth: { xs: "100%", sm: "auto" },
  margin: { xs: "0.5rem 0", sm: "0 0.5rem" },
  padding: { xs: "8px 16px", sm: "6px 16px" },
};

const ExercicioById = () => {
  const params = useParams();
  const theme = useTheme();
  const navigate = useNavigate();
  const { exercicioId } = params;
  const { data: exercise } = useGetExerciseByIdQuery(exercicioId);
  const { data: machines = [], isLoading, isError } = useGetAllMachinesQuery();
  const [updateExercise, { isLoading: isEditingLoading }] =
    useEditExerciseByIdMutation();
  const [deleteExercise, { isLoading: isDeleting }] =
    useDeleteExerciseByIdMutation();

  const [isEditing, setIsEditing] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    targetMuscle: "",
    secondaryMuscle: "",
    exerciseType: "",
    equipmentId: "",
    experienceLevel: "",
    videoUrl: "",
    execution: "",
    commentsAndTips: "",
    imageBase64: "",
  });
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [openEquipmentDialog, setOpenEquipmentDialog] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [newExerciseImage, setNewExerciseImage] = useState(null);

  useEffect(() => {
    if (exercise) {
      setFormData({
        name: exercise.name || "",
        targetMuscle: exercise.targetMuscle || "",
        secondaryMuscle: exercise.secondaryMuscle || "",
        exerciseType: exercise.exerciseType || "",
        equipmentId: exercise.equipment?.MachineId || "",
        experienceLevel: exercise.experienceLevel || "",
        videoUrl: exercise.videoUrl || "",
        execution: Array.isArray(exercise.execution)
          ? exercise.execution.join("\n")
          : exercise.execution || "",
        commentsAndTips: Array.isArray(exercise.commentsAndTips)
          ? exercise.commentsAndTips.join("\n")
          : exercise.commentsAndTips || "",
      });

      if (exercise.equipment) {
        setSelectedEquipment(exercise.equipment);
      }
    }
  }, [exercise]);

  const filteredMachines = useMemo(() => {
    if (!searchTerm) return machines;
    return machines.filter(
      (machine) =>
        machine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        machine.type.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [machines, searchTerm]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const requiredFields = [
      "name",
      "targetMuscle",
      "secondaryMuscle",
      "exerciseType",
      "equipmentId",
      "experienceLevel",
    ];

    const missingFields = requiredFields.filter((field) => !formData[field]);

    if (missingFields.length > 0) {
      setSnackbarMessage("Por favor, preencha todos os campos obrigatórios.");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
      return false;
    }

    return true;
  };

  const handleToggleEdit = () => {
    if (isEditing) {
      console.log("Updated form data:", formData);
    }
    setIsEditing(!isEditing);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
  };

  const handleConfirmDelete = async (exerciseId) => {
    try {
      await deleteExercise(exerciseId).unwrap();
      setSnackbarMessage("Exercício eliminado com sucesso!");
      setSnackbarSeverity("success");
      setOpenSnackbar(true);
      navigate(-1);
    } catch (error) {
      console.log(error);
      setSnackbarMessage("Erro ao eliminar o exercício.");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    }
    handleCloseDeleteDialog();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const formattedData = {
        ...formData,
        execution: formData.execution
          .split("\n")
          .map((step) => step.trim())
          .filter((step) => step),
        commentsAndTips: formData.commentsAndTips
          .split("\n")
          .map((comment) => comment.trim())
          .filter((comment) => comment),
        imageBase64: newExerciseImage || "",
      };

      console.log("Submitting data:", formattedData);
      await updateExercise({
        exerciseId: exercicioId,
        body: formattedData,
      }).unwrap();
      setSnackbarMessage("Exercício atualizado com sucesso!");
      setSnackbarSeverity("success");
      setOpenSnackbar(true);
      setIsEditing(false);
    } catch (error) {
      console.error(error);
      setSnackbarMessage("Erro ao atualizar o exercício.");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    }
  };

  const handleSearchChange = (e) => setSearchTerm(e.target.value);
  const handleClearSearch = () => setSearchTerm("");
  const handleOpenEquipmentDialog = () => setOpenEquipmentDialog(true);
  const handleCloseEquipmentDialog = () => {
    setOpenEquipmentDialog(false);
    setSearchTerm("");
  };
  const handleSelectEquipment = (machine) => {
    setSelectedEquipment(machine);
    setFormData((prevData) => ({
      ...prevData,
      equipmentId: machine.MachineId,
    }));
    handleCloseEquipmentDialog();
  };
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewExerciseImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  if (isLoading) return <Loading />;
  if (isError) return <ErrorOverlay />;

  return (
    <>
      <Header
        title={"Formulário de edição do Exercício"}
        subtitle={"Atualiza os dados deste exercício"}
      />

      <Box
        sx={{
          mx: { xs: "1rem", md: "5rem" },
          padding: { xs: 2, sm: 4 },
          boxShadow: 3,
          borderRadius: "8px",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "stretch", sm: "center" },
            mb: 5,
            gap: { xs: 2, sm: 0 },
          }}
        >
          <Button
            color="white"
            variant="outlined"
            onClick={() => navigate(-1)}
            sx={responsiveButtonStyles}
          >
            Voltar
          </Button>

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: 2,
              width: { xs: "100%", sm: "auto" },
            }}
          >
            <Button
              variant="contained"
              color={isEditing ? "secondary" : "primary"}
              startIcon={<Edit />}
              onClick={handleToggleEdit}
              sx={responsiveButtonStyles}
            >
              {isEditing ? "Cancelar Edição" : "Editar"}
            </Button>
            <Button
              variant="contained"
              color="error"
              startIcon={<DeleteForeverIcon />}
              onClick={() => setDeleteDialogOpen(true)}
              disabled={isEditing}
              sx={responsiveButtonStyles}
            >
              Eliminar
            </Button>
          </Box>
        </Box>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={{ xs: 2, sm: 3 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Nome do Exercício"
                name="name"
                fullWidth
                variant="outlined"
                value={formData.name}
                onChange={handleInputChange}
                required
                disabled={!isEditing}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Músculo Alvo"
                name="targetMuscle"
                fullWidth
                variant="outlined"
                value={formData.targetMuscle}
                onChange={handleInputChange}
                required
                disabled={!isEditing}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Músculo Secundário"
                name="secondaryMuscle"
                fullWidth
                variant="outlined"
                value={formData.secondaryMuscle}
                onChange={handleInputChange}
                required
                disabled={!isEditing}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Tipo de Exercício</InputLabel>
                <Select
                  label="Tipo de Exercício"
                  name="exerciseType"
                  value={formData.exerciseType}
                  onChange={handleInputChange}
                  required
                  disabled={!isEditing}
                >
                  <MenuItem value="Forca">Força</MenuItem>
                  <MenuItem value="Cardio">Cardio</MenuItem>
                  <MenuItem value="Funcional">Funcional</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Paper
                variant="outlined"
                sx={{
                  backgroundColor: theme.palette.background.alt,
                  color: theme.palette.secondary[200],
                  p: { xs: 1, sm: 2 },
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  alignItems: { xs: "stretch", sm: "center" },
                  justifyContent: "space-between",
                  gap: { xs: 1, sm: 0 },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <FitnessCenter sx={{ mr: 2, color: "text.secondary" }} />
                  <Typography>
                    {selectedEquipment
                      ? `${selectedEquipment.name} (${selectedEquipment.type})`
                      : "Nenhum equipamento selecionado"}
                  </Typography>
                </Box>
                {isEditing && (
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={handleOpenEquipmentDialog}
                    disabled={!isEditing || isEditingLoading}
                    sx={responsiveButtonStyles}
                  >
                    Selecionar Máquina
                  </Button>
                )}
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Nível de Experiência</InputLabel>
                <Select
                  label="Nível de Experiência"
                  name="experienceLevel"
                  value={formData.experienceLevel}
                  onChange={handleInputChange}
                  required
                  disabled={!isEditing}
                >
                  <MenuItem value="Iniciante">Iniciante</MenuItem>
                  <MenuItem value="Intermediario">Intermediário</MenuItem>
                  <MenuItem value="Avancado">Avançado</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Passos de Execução"
                name="execution"
                fullWidth
                variant="outlined"
                value={formData.execution}
                onChange={handleInputChange}
                helperText="Separe os passos com uma nova linha (pressione Enter)."
                multiline
                rows={4}
                disabled={!isEditing}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Comentários e Dicas"
                name="commentsAndTips"
                fullWidth
                variant="outlined"
                value={formData.commentsAndTips}
                onChange={handleInputChange}
                helperText="Separe os comentários com uma nova linha (pressione Enter)."
                multiline
                rows={4}
                disabled={!isEditing}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="URL do Vídeo"
                name="videoUrl"
                fullWidth
                variant="outlined"
                value={formData.videoUrl}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </Grid>

            <Grid item xs={12}>
              <Input
                accept="image/*"
                type="file"
                onChange={handleImageChange}
                style={{ display: "none" }}
                id="upload-image"
              />
              <label htmlFor="upload-image">
                <Button
                  variant="contained"
                  color="primary"
                  component="span"
                  disabled={!isEditing || isEditingLoading}
                  startIcon={<CloudUpload />}
                  sx={responsiveButtonStyles}
                >
                  Carregar Imagem*
                </Button>
              </label>
              {!newExerciseImage && exercise?.imageUrl && (
                <Box sx={{ mt: 2 }}>
                  <Typography sx={{ mb: 1.5 }}>Imagem Atual:</Typography>
                  <img
                    src={exercise?.imageUrl}
                    alt="Imagem Atual"
                    style={{
                      width: "100%",
                      maxWidth: "550px",
                      height: "auto",
                    }}
                  />
                </Box>
              )}
              {newExerciseImage && (
                <Box sx={{ position: "relative", mt: 2 }}>
                  <Typography sx={{ mb: 1.5 }}>
                    Pré-visualização da Imagem:
                  </Typography>

                  <IconButton
                    onClick={() => setNewExerciseImage(null)}
                    sx={{
                      position: "absolute",
                      zIndex: 1,
                    }}
                  >
                    <DeleteOutline color="error" />
                  </IconButton>

                  <img
                    src={newExerciseImage}
                    alt="Pré-visualização"
                    style={{
                      width: "100%",
                      maxWidth: "550px",
                      height: "auto",
                    }}
                  />
                </Box>
              )}
            </Grid>

            <Grid item xs={12}>
              {isEditing && (
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={isEditingLoading}
                  sx={{
                    ...responsiveButtonStyles,
                    width: { xs: "100%", sm: "auto" },
                  }}
                >
                  {isEditingLoading ? "A Guardar..." : "Guardar Alterações"}
                </Button>
              )}
            </Grid>
          </Grid>
        </form>

        <Dialog
          open={openEquipmentDialog}
          onClose={handleCloseEquipmentDialog}
          maxWidth="md"
          fullWidth
          fullScreen={useMediaQuery(theme.breakpoints.down("sm"))}
        >
          <DialogTitle>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Search sx={{ mr: 2, mt: 2 }} />
              <TextField
                label="Pesquisar Equipamento"
                variant="standard"
                fullWidth
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  endAdornment: searchTerm && (
                    <InputAdornment position="end">
                      <IconButton onClick={handleClearSearch} size="small">
                        <Clear />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          </DialogTitle>
          <DialogContent dividers>
            <List>
              {filteredMachines.map((machine) => (
                <ListItem
                  key={machine.MachineId}
                  button
                  onClick={() => handleSelectEquipment(machine)}
                  sx={{
                    borderLeft: `4px solid ${
                      MACHINE_TYPE_COLORS[machine.type] || "grey"
                    }`,
                    cursor: "pointer",
                  }}
                >
                  <ListItemAvatar>
                    <Avatar
                      sx={{
                        bgcolor: `${
                          MACHINE_TYPE_COLORS[machine.type] || "grey"
                        }20`,
                        color: MACHINE_TYPE_COLORS[machine.type] || "grey",
                      }}
                    >
                      <FitnessCenter />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={machine.name}
                    secondary={`Tipo: ${machine.type}`}
                  />
                </ListItem>
              ))}
            </List>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={handleCloseEquipmentDialog}
              color="secondary"
              sx={responsiveButtonStyles}
            >
              Cancelar
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={deleteDialogOpen}
          onClose={handleCloseDeleteDialog}
          aria-labelledby="delete-dialog-title"
          aria-describedby="delete-dialog-description"
          fullScreen={useMediaQuery(theme.breakpoints.down("sm"))}
        >
          <DialogTitle id="delete-dialog-title">
            Confirmar Eliminação
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="delete-dialog-description">
              Tem a certeza que pretende eliminar este exercício? Esta ação não
              pode ser revertida.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={handleCloseDeleteDialog}
              color="secondary"
              sx={responsiveButtonStyles}
            >
              Cancelar
            </Button>
            <Button
              onClick={() => handleConfirmDelete(exercicioId)}
              color="error"
              autoFocus
              disabled={isDeleting}
              sx={responsiveButtonStyles}
            >
              {isDeleting ? "A Eliminar..." : "Eliminar"}
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={openSnackbar}
          autoHideDuration={3000}
          onClose={() => setOpenSnackbar(false)}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={() => setOpenSnackbar(false)}
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

export default ExercicioById;
