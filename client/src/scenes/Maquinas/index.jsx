import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Typography,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Snackbar,
  Alert,
} from "@mui/material";
import Header from "components/common/Header";
import SearchBar from "components/common/SearchBar";
import AddIcon from "@mui/icons-material/Add";
import { useTheme } from "@emotion/react";
import { useAddMachineMutation } from "state/api";
import { useGetAllMachinesQuery } from "state/api";
import { useNavigate } from "react-router-dom";

const MachineTypeDisplay = {
  Cardio: "Cardio",
  Musculacao: "Musculação",
  Funcional: "Funcional",
};

const Maquinas = () => {
  const { data: machines = [], isLoading, isError } = useGetAllMachinesQuery();
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [machineType, setMachineType] = useState("Todos");
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [newMachineName, setNewMachineName] = useState("");
  const [newMachineType, setNewMachineType] = useState(
    MachineTypeDisplay.Cardio
  );
  const [newMachineDescription, setNewMachineDescription] = useState("");
  const [newMachineImage, setNewMachineImage] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [uploadMachine, { isLoading: isLoadingAddMachine }] =
    useAddMachineMutation();
  const [formErrors, setFormErrors] = useState({
    name: false,
    description: false,
    image: false,
  });

  const filteredMachines = machines.filter(
    (machine) =>
      machine.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (machineType === "Todos" ||
        machine.type ===
          Object.keys(MachineTypeDisplay).find(
            (key) => MachineTypeDisplay[key] === machineType
          ))
  );

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewMachineImage(reader.result);
        setFormErrors((prev) => ({ ...prev, image: false }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddMachine = async () => {
    setFormErrors({
      name: !newMachineName,
      description: !newMachineDescription,
      image: !newMachineImage,
    });

    if (!newMachineName || !newMachineDescription || !newMachineImage) {
      return;
    }

    const data = {
      name: newMachineName,
      type: newMachineType,
      description: newMachineDescription,
      imageBase64: newMachineImage,
    };

    try {
      await uploadMachine(data);
      setSnackbarOpen(true);
      setOpenAddDialog(false);
      clearForm();
    } catch (error) {
      console.error(error);
    }
  };

  const clearForm = () => {
    setNewMachineName("");
    setNewMachineType(MachineTypeDisplay.Cardio);
    setNewMachineDescription("");
    setNewMachineImage(null);
    setFormErrors({
      name: false,
      description: false,
      image: false,
    });
  };

  if (isLoading) return <Typography>Carregando máquinas...</Typography>;
  if (isError) return <Typography>Erro ao carregar máquinas</Typography>;

  return (
    <Box>
      <Header
        title="Máquinas do Ginásio"
        subtitle="Gerencie e adicione máquinas de treino"
      />
      <SearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        placeholder="Buscar máquinas..."
      />
      <Box
        sx={{
          display: "flex",
          mx: "5rem",
          my: "1rem",
          justifyContent: "space-between",
        }}
      >
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Tipo de Máquina</InputLabel>
          <Select
            value={machineType}
            label="Tipo de Máquina"
            onChange={(e) => setMachineType(e.target.value)}
          >
            <MenuItem value="Todos">Todos os Tipos</MenuItem>
            {Object.values(MachineTypeDisplay).map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          sx={{ ml: "5rem", mb: "1.25rem" }}
          onClick={() => setOpenAddDialog(true)}
        >
          Adicionar Máquina
        </Button>
      </Box>
      <Box sx={{ mx: "5rem", my: "1.5rem" }}>
        <Grid container spacing={4}>
          {filteredMachines.map((machine) => (
            <Grid item xs={12} sm={6} md={4} key={machine.MachineId}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  transition: "transform 0.2s",
                  "&:hover": {
                    transform: "scale(1.02)",
                  },
                  backgroundColor: theme.palette.background.alt,
                }}
              >
                <CardMedia
                  component="img"
                  image={machine.imageUrl}
                  alt={machine.name}
                  sx={{
                    height: 250,
                    objectFit: "cover",
                    objectPosition: "center",
                    width: "100%",
                  }}
                />
                <CardContent
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Typography variant="h6" gutterBottom>
                    {machine.name}
                  </Typography>
                  <Typography variant="subtitle2" color="text.secondary">
                    Tipo: {MachineTypeDisplay[machine.type] || machine.type}
                  </Typography>
                  <Typography variant="body2">{machine.description}</Typography>
                  <Box sx={{ mt: "1rem" }}>
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={() => navigate(`/maquinas/${machine.MachineId}`)}
                    >
                      Visualizar
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Dialog for Adding a Machine */}
      <Dialog
        open={openAddDialog}
        onClose={() => {
          setOpenAddDialog(false);
          clearForm();
        }}
        maxWidth="md"
        sx={{
          "& .MuiPaper-root": {
            backgroundColor: theme.palette.background.alt,
            color: theme.palette.secondary[200],
          },
        }}
      >
        <DialogTitle sx={{ fontSize: "1rem" }}>
          Adicionar Nova Máquina
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Nome da Máquina"
            fullWidth
            value={newMachineName}
            onChange={(e) => {
              setNewMachineName(e.target.value);
              setFormErrors((prev) => ({ ...prev, name: false }));
            }}
            sx={{ my: 2 }}
            error={formErrors.name}
            helperText={formErrors.name ? "Nome é obrigatório" : ""}
            required
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Tipo de Máquina</InputLabel>
            <Select
              value={newMachineType}
              onChange={(e) => setNewMachineType(e.target.value)}
              label="Tipo de Máquina"
            >
              {Object.values(MachineTypeDisplay).map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Descrição"
            fullWidth
            value={newMachineDescription}
            onChange={(e) => {
              setNewMachineDescription(e.target.value);
              setFormErrors((prev) => ({ ...prev, description: false }));
            }}
            sx={{ mb: 2 }}
            multiline
            rows={4}
            error={formErrors.description}
            helperText={formErrors.description ? "Descrição é obrigatória" : ""}
            required
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ marginBottom: "1rem" }}
          />
          {formErrors.image && (
            <Typography
              color="error"
              variant="caption"
              display="block"
              sx={{ mb: 1 }}
            >
              Imagem é obrigatória
            </Typography>
          )}
          {newMachineImage && (
            <Box sx={{ mb: 2 }}>
              <Typography>Pré-visualização da Imagem:</Typography>
              <img
                src={newMachineImage}
                alt="Pré-visualização"
                style={{
                  width: "100%",
                  maxWidth: "550px",
                  height: "auto",
                }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenAddDialog(false);
              clearForm();
            }}
            color="text.primary"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleAddMachine}
            color="secondary"
            variant="contained"
            disabled={
              isLoadingAddMachine ||
              !newMachineName ||
              !newMachineDescription ||
              !newMachineImage
            }
          >
            {isLoadingAddMachine ? "A Adicionar..." : "Adicionar Máquina"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar Notification */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="success"
          sx={{ width: "100%" }}
        >
          Máquina adicionada com sucesso!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Maquinas;
