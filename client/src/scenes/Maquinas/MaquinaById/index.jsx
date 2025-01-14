import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  CardContent,
  Typography,
  Container,
  Box,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Divider,
  TextField,
  MenuItem,
  Paper,
  Alert,
  Snackbar,
  Chip,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  ArrowBack as BackIcon,
} from "@mui/icons-material";
import {
  useGetMachineByIdQuery,
  useDeleteMachineByIdMutation,
  useUpdateMachineByIdMutation,
} from "state/api";
import ErrorOverlay from "components/common/ErrorOverlay";
import Loading from "components/common/Loading";
import { useTheme } from "@emotion/react";
import Header from "components/common/Header";

const MACHINE_TYPES = [
  { value: "Cardio", label: "Cardio" },
  { value: "Musculacao", label: "Musculação" },
  { value: "Funcional", label: "Funcional" },
];

const MaquinaById = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { maquinaId } = useParams();
  const { data, isLoading, error } = useGetMachineByIdQuery(maquinaId);
  const [deleteMachine, { isLoading: isDeleting }] =
    useDeleteMachineByIdMutation();
  const [updateMachine] = useUpdateMachineByIdMutation();

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedMachine, setEditedMachine] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const handleOpenDeleteDialog = () => setOpenDeleteDialog(true);
  const handleCloseDeleteDialog = () => setOpenDeleteDialog(false);
  const handleSnackbarClose = () => setSnackbarOpen(false);

  const showSnackbar = (message, severity = "success") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteMachine(maquinaId).unwrap();
      showSnackbar("Máquina eliminada com sucesso");
      navigate("/maquinas");
    } catch (err) {
      showSnackbar("Erro ao eliminar a máquina", "error");
    } finally {
      handleCloseDeleteDialog();
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      setIsEditing(false);
      setEditedMachine(null);
      setImagePreview("");
    } else {
      setIsEditing(true);
      setEditedMachine({ ...data });
      setImagePreview(data.imageUrl || "");
    }
  };

  const handleSave = async () => {
    try {
      await updateMachine({
        MachineId: maquinaId,
        ...editedMachine,
      }).unwrap();
      showSnackbar("Alterações guardadas com sucesso");
      setIsEditing(false);
      setEditedMachine(null);
      setImagePreview("");
    } catch (err) {
      showSnackbar("Falha ao guardar as alterações", "error");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedMachine((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setEditedMachine((prev) => ({
          ...prev,
          imageBase64: reader.result,
        }));
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  if (isLoading) return <Loading />;

  if (error) return <ErrorOverlay />;
  if (!data) return <ErrorOverlay message="Máquina não encontrada" />;
  const selectedMachineType = MACHINE_TYPES.find(
    (t) => t.value === (isEditing ? editedMachine.type : data.type)
  );

  return (
    <>
      <Header
        title="Detalhes da Máquina"
        subtitle={"Edita, elimina a máquina"}
      />
      <Container
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {" "}
        <Box sx={{ width: "100%" }}>
          <Paper
            elevation={6}
            sx={{
              borderRadius: 4,
              overflow: "hidden",
              backgroundColor: theme.palette.background.alt,
              color: theme.palette.secondary[200],
            }}
          >
            <CardContent>
              <Grid container spacing={4}>
                <Grid item xs={12} md={5}>
                  <Box
                    sx={{
                      position: "relative",
                      borderRadius: 2,
                      overflow: "hidden",
                      boxShadow: 2,
                    }}
                  >
                    {isEditing ? (
                      <>
                        <img
                          src={imagePreview}
                          alt="Preview da máquina"
                          style={{
                            width: "100%",
                            height: "300px",
                            objectFit: "cover",
                          }}
                        />
                        <Button
                          variant="contained"
                          component="label"
                          fullWidth
                          color="secondary"
                          sx={{ mt: 2 }}
                        >
                          Mudar a imagem
                          <input
                            type="file"
                            accept="image/*"
                            hidden
                            onChange={handleImageChange}
                          />
                        </Button>
                      </>
                    ) : (
                      <img
                        src={data.imageUrl}
                        alt={data.name}
                        style={{
                          width: "100%",
                          height: "300px",
                          objectFit: "cover",
                        }}
                      />
                    )}
                  </Box>
                </Grid>

                <Grid item xs={12} md={7}>
                  <Box>
                    {isEditing ? (
                      <TextField
                        fullWidth
                        name="name"
                        label="Nome da Máquina"
                        variant="outlined"
                        value={editedMachine.name}
                        onChange={handleInputChange}
                        sx={{ mb: 2 }}
                      />
                    ) : (
                      <Typography
                        variant="h4"
                        gutterBottom
                        color="secondary"
                        sx={{ fontWeight: "bold" }}
                      >
                        {data.name}
                      </Typography>
                    )}

                    <Typography
                      variant="subtitle1"
                      color="text.secondary"
                      gutterBottom
                    >
                      ID: {data.MachineId}
                    </Typography>

                    <Divider sx={{ my: 2 }} />

                    {isEditing ? (
                      <TextField
                        fullWidth
                        name="type"
                        label="Tipo de Máquina"
                        variant="outlined"
                        select
                        value={editedMachine.type}
                        onChange={handleInputChange}
                        sx={{ mb: 2 }}
                      >
                        {MACHINE_TYPES.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    ) : (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          mb: 2,
                        }}
                      >
                        <Typography sx={{ mr: 2 }}>
                          <strong>Tipo:</strong>
                        </Typography>
                        <Chip
                          label={selectedMachineType?.label || data.type}
                          color="white"
                          variant="outlined"
                        />
                      </Box>
                    )}

                    {isEditing ? (
                      <TextField
                        fullWidth
                        name="description"
                        label="Descrição"
                        variant="outlined"
                        multiline
                        rows={4}
                        value={editedMachine.description}
                        onChange={handleInputChange}
                        sx={{ mb: 3 }}
                      />
                    ) : (
                      <Typography variant="body1" color="text.secondary">
                        {data.description}
                      </Typography>
                    )}

                    <Grid container spacing={2} sx={{ mt: 2 }}>
                      {isEditing ? (
                        <>
                          <Grid item xs={6}>
                            <Button
                              variant="contained"
                              color="primary"
                              startIcon={<SaveIcon />}
                              fullWidth
                              onClick={handleSave}
                            >
                              Guardar alterações
                            </Button>
                          </Grid>
                          <Grid item xs={6}>
                            <Button
                              variant="outlined"
                              color="error"
                              startIcon={<CancelIcon />}
                              fullWidth
                              onClick={handleEditToggle}
                            >
                              Cancelar
                            </Button>
                          </Grid>
                        </>
                      ) : (
                        <>
                          <Grid item xs={6}>
                            <Button
                              variant="contained"
                              color="primary"
                              startIcon={<EditIcon />}
                              fullWidth
                              onClick={handleEditToggle}
                            >
                              Editar
                            </Button>
                          </Grid>
                          <Grid item xs={6}>
                            <Button
                              variant="contained"
                              color="error"
                              startIcon={<DeleteIcon />}
                              fullWidth
                              onClick={handleOpenDeleteDialog}
                              disabled={isDeleting}
                            >
                              {isDeleting ? "A eliminar..." : "Eliminar"}
                            </Button>
                          </Grid>
                        </>
                      )}
                      <Grid item xs={12}>
                        <Button
                          variant="outlined"
                          color="white"
                          startIcon={<BackIcon />}
                          onClick={() => navigate(-1)}
                          fullWidth
                        >
                          Voltar
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Paper>
        </Box>
        <Dialog
          open={openDeleteDialog}
          onClose={handleCloseDeleteDialog}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle>Confirmação</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Tem a certeza absoluta de que deseja eliminar esta máquina? Esta
              ação não pode ser desfeita e irá remover permanentemente a máquina
              do sistema.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={handleCloseDeleteDialog}
              color="secondary"
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmDelete}
              color="error"
              variant="contained"
              disabled={isDeleting}
            >
              {isDeleting ? "A eliminar..." : "Confirmar"}
            </Button>
          </DialogActions>
        </Dialog>
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert
            onClose={handleSnackbarClose}
            severity={snackbarSeverity}
            sx={{ width: "100%" }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Container>
    </>
  );
};

export default MaquinaById;
