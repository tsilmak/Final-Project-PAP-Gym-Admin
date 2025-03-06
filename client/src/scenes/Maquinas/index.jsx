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
import Loading from "components/common/Loading";

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
  const machineTypesToSelect = ["Cardio", "Musculacao", "Funcional"];

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

  if (isLoading) return <Loading />;
  if (isError) return <Typography>Erro ao carregar máquinas</Typography>;

  return (
    <Box sx={{ minHeight: "100vh", px: { xs: 1, sm: 2 } }}>
      <Header
        title="Máquinas do Ginásio"
        subtitle="Gerencie e adicione máquinas de treino"
      />
      <SearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        placeholder="Buscar máquinas..."
        sx={{ mb: 2 }}
      />
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          mx: { xs: 0, sm: "1rem", md: "5rem" },
          my: 2,
          justifyContent: "space-between",
          alignItems: { xs: "stretch", sm: "center" },
          gap: { xs: 2, sm: 0 },
        }}
      >
        <FormControl sx={{ minWidth: { xs: "100%", sm: 200 } }}>
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
          sx={{
            width: { xs: "100%", sm: "auto" },
            mt: { xs: 0, sm: "1.25rem" },
          }}
          onClick={() => setOpenAddDialog(true)}
        >
          Adicionar Máquina
        </Button>
      </Box>
      <Box sx={{ mx: { sm: "1rem", md: "5rem" }, my: "1.5rem" }}>
        <Grid container spacing={{ xs: 2, md: 4 }}>
          {filteredMachines.map((machine) => (
            <Grid item xs={12} sm={6} md={4} key={machine.MachineId}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  transition: "transform 0.2s",
                  "&:hover": {
                    transform: { xs: "none", md: "scale(1.02)" },
                  },
                  backgroundColor: theme.palette.background.alt,
                }}
              >
                <CardMedia
                  component="img"
                  image={machine.imageUrl}
                  alt={machine.name}
                  sx={{
                    height: { xs: 200, sm: 250 },
                    objectFit: "contain",
                    objectPosition: "center",
                    backgroundColor: "#f5f5f5",
                    padding: "1rem",
                  }}
                />
                <CardContent
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    flexGrow: 1,
                  }}
                >
                  <Typography variant="h6" gutterBottom>
                    {machine.name}
                  </Typography>
                  <Typography variant="subtitle2" color="text.secondary">
                    Tipo: {MachineTypeDisplay[machine.type] || machine.type}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {machine.description}
                  </Typography>
                  <Box sx={{ mt: "auto", pt: 2 }}>
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
        fullWidth
        maxWidth="sm"
        sx={{
          "& .MuiPaper-root": {
            backgroundColor: theme.palette.background.alt,
            color: theme.palette.secondary[200],
            width: "100%",
            m: { xs: 1, sm: 2 },
          },
        }}
      >
        <DialogTitle sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}>
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
              {Object.values(machineTypesToSelect).map((type) => (
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
            style={{
              width: "100%",
              padding: "10px",
              border: `1px dashed ${theme.palette.divider}`,
              borderRadius: "4px",
              backgroundColor: theme.palette.background.default,
            }}
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
                  height: "auto",
                  maxHeight: "300px",
                  objectFit: "contain",
                }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions
          sx={{ flexDirection: { xs: "column", sm: "row" }, gap: 1 }}
        >
          <Button
            onClick={() => {
              setOpenAddDialog(false);
              clearForm();
            }}
            color="text.primary"
            fullWidth={true}
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
            fullWidth={true}
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
