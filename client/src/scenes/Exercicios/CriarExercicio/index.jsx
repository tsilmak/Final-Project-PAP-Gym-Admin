import React, { useState, useMemo } from "react";
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
} from "@mui/material";
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  FitnessCenter as EquipmentIcon,
  CloudUpload,
} from "@mui/icons-material";
import { useGetAllMachinesQuery } from "state/api";
import { useCreateExerciseMutation } from "state/api";
import Header from "components/common/Header";
import Loading from "components/common/Loading";
import ErrorOverlay from "components/common/ErrorOverlay";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@emotion/react";

const MACHINE_TYPE_COLORS = {
  Cardio: "#3f51b5",
  Musculacao: "#f50057",
  Funcional: "#4caf50",
};

const CriarExercicio = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { data: machines = [], isLoading, isError } = useGetAllMachinesQuery();
  const [createExercise, { isLoading: isCreating }] =
    useCreateExerciseMutation();
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

  const [searchTerm, setSearchTerm] = useState("");
  const [openEquipmentDialog, setOpenEquipmentDialog] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [newExerciseImage, setNewExerciseImage] = useState(null);

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

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
  };

  const handleOpenEquipmentDialog = () => {
    setOpenEquipmentDialog(true);
  };

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
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(formData);

    if (
      !formData.name ||
      !formData.targetMuscle ||
      !formData.secondaryMuscle ||
      !formData.exerciseType ||
      !formData.equipmentId ||
      !formData.experienceLevel ||
      !formData.execution ||
      !formData.commentsAndTips ||
      !newExerciseImage
    ) {
      setSnackbarMessage("Por favor, preencha todos os campos obrigatórios.");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
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
        imageBase64: newExerciseImage,
      };

      await createExercise({ body: formattedData }).unwrap();

      setSnackbarMessage("Exercício criado com sucesso!");
      setSnackbarSeverity("success");
      setOpenSnackbar(true);

      setFormData({
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
      setNewExerciseImage(null);
    } catch (error) {
      console.error(error);
      setSnackbarMessage("Erro ao criar exercício.");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    }
  };

  if (isLoading) return <Loading />;
  if (isError) return <ErrorOverlay />;

  return (
    <>
      <Header
        title={"Formulário de Criação de Exercício"}
        subtitle={"Cria um novo exercício"}
      />

      <Box
        sx={{
          mx: { xs: "1rem", md: "5rem" },
          padding: 4,
          boxShadow: 3,
          borderRadius: "8px",
        }}
      >
        <Button
          color="white"
          variant="outlined"
          onClick={() => navigate(-1)}
          sx={{ mb: 4 }}
        >
          Voltar
        </Button>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Nome do Exercício"
                name="name"
                fullWidth
                variant="outlined"
                value={formData.name}
                onChange={handleInputChange}
                required
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
                >
                  <MenuItem value="Forca">Força</MenuItem>
                  <MenuItem value="Cardio">Cardio</MenuItem>
                  <MenuItem value="Funcional">Funcional</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Equipment Selection */}
            <Grid item xs={12}>
              <Paper
                variant="outlined"
                sx={{
                  backgroundColor: theme.palette.background.alt,
                  color: theme.palette.secondary[200],
                  p: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <EquipmentIcon sx={{ mr: 2, color: "text.secondary" }} />
                  <Typography>
                    {selectedEquipment
                      ? `${selectedEquipment.name} (${selectedEquipment.type})`
                      : "Nenhum equipamento selecionado"}
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={handleOpenEquipmentDialog}
                  disabled={isCreating}
                >
                  Selecionar Máquina
                </Button>
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
                  startIcon={<CloudUpload />}
                  disabled={isCreating}
                >
                  Carregar Imagem*
                </Button>
              </label>
              {newExerciseImage && (
                <Box sx={{ mt: 2 }}>
                  <Typography sx={{ mb: 1.5 }}>
                    Pré-visualização da Imagem:
                  </Typography>
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
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={isCreating}
              >
                {isCreating ? "A Criar..." : "Criar Exercício"}
              </Button>
            </Grid>
          </Grid>
        </form>

        {/* Equipment Selection Dialog */}
        <Dialog
          open={openEquipmentDialog}
          onClose={handleCloseEquipmentDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <SearchIcon sx={{ mr: 2, mt: 2 }} />
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
                        <ClearIcon />
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
                    "&:hover": {
                      backgroundColor: "action.hover",
                    },
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
                      <EquipmentIcon />
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
            <Button onClick={handleCloseEquipmentDialog} color="secondary">
              Cancelar
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar Notification */}
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

export default CriarExercicio;
