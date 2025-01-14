import React, { useState } from "react";
import {
  Typography,
  Box,
  Divider,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  Stack,
  LinearProgress,
  Avatar,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Collapse,
  IconButton,
  InputBase,
  CircularProgress,
  DialogContentText,
} from "@mui/material";
import { useParams } from "react-router-dom";
import {
  useCreateUserWorkoutPlanMutation,
  useDeleteUserWorkoutPlanMutation,
  useEditUserWorkoutPlanMutation,
  useGetAllExercisesQuery,
  useGetMetricsByUserIdQuery,
  useGetUserByIdForTreinadorQuery,
  useGetUserWorkoutPlanQuery,
  useUpdateMetricsByUserIdMutation,
} from "state/api";
import PersonIcon from "@mui/icons-material/Person";
import EventNoteIcon from "@mui/icons-material/EventNote";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";
import ScaleIcon from "@mui/icons-material/Scale";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Header from "components/common/Header";
import {
  FitnessCenter as DumbbellIcon,
  Add as AddIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Delete as DeleteIcon,
  Event as EventIcon,
  Search,
} from "@mui/icons-material";
import SearchBar from "components/common/SearchBar";

const formatDate = (dateString) => {
  if (!dateString) return "Não disponível";
  try {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch (error) {
    return "Data inválida";
  }
};

const PersonalInfo = ({ userData, getInitials }) => {
  if (!userData) {
    return (
      <Grid item xs={12} md={6}>
        <Card variant="outlined">
          <CardContent>
            <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
              <CircularProgress />
            </Box>
          </CardContent>
        </Card>
      </Grid>
    );
  }

  const activeSignature = userData.signatures?.[0];
  const membershipStatus = activeSignature?.isActive ? "Ativa" : "Inativa";
  const gymPlanName = activeSignature?.gymPlan?.name;

  return (
    <Grid item xs={12} md={6}>
      <Card variant="outlined">
        <CardContent>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Avatar
              src={userData.profilePictureUrl}
              alt={`${userData.fname} ${userData.lname}`}
              sx={{
                width: 120,
                height: 120,
                mb: 2,
                fontSize: "2.5rem",
                bgcolor: "primary.main",
              }}
            >
              {getInitials(userData.fname, userData.lname)}
            </Avatar>
            <Typography variant="h6" align="center" gutterBottom>
              {`${userData.fname || ""} ${userData.lname || ""}`}
            </Typography>
            <Typography color="textSecondary" align="center">
              #{userData.membershipNumber || "N/A"}
            </Typography>
          </Box>
          <Stack spacing={2}>
            <Box>
              <Typography color="textSecondary">Primeiro Nome</Typography>
              <Typography variant="body1">
                {userData.fname || "Não disponível"}
              </Typography>
            </Box>
            <Box>
              <Typography color="textSecondary">Segundo Nome</Typography>
              <Typography variant="body1">
                {userData.lname || "Não disponível"}
              </Typography>
            </Box>
            <Box>
              <Typography color="textSecondary">Email</Typography>
              <Typography variant="body1">
                {userData.email || "Não disponível"}
              </Typography>
            </Box>
            <Box>
              <Typography color="textSecondary">Telemovel</Typography>
              <Typography variant="body1">
                {userData.phoneNumber
                  ? `+${userData.phoneNumber}`
                  : "Não disponível"}
              </Typography>
            </Box>
            <Box>
              <Typography color="textSecondary">Data de Nascimento</Typography>
              <Typography variant="body1">
                {formatDate(userData.birthDate)}
              </Typography>
            </Box>
            <Box>
              <Typography color="textSecondary">Género</Typography>
              <Typography variant="body1">
                {userData.gender || "Não disponível"}
              </Typography>
            </Box>
            <Box>
              <Typography color="textSecondary">
                Status da assinatura
              </Typography>
              <Typography variant="body1">
                {membershipStatus || "Não disponível"}
              </Typography>
            </Box>
            <Box>
              <Typography color="textSecondary">Plano de Treino</Typography>
              <Typography variant="body1">
                {gymPlanName || "Não disponível"}
              </Typography>
            </Box>
            <Box>
              <Typography color="textSecondary">Membro desde</Typography>
              <Typography variant="body1">
                {formatDate(userData.createdAt)}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Grid>
  );
};

const MetricField = ({
  label,
  value,
  field,
  unit,
  isEditing,
  metrics,
  handleMetricChange,
}) => {
  return isEditing ? (
    <Box>
      <Typography color="textSecondary">{label}</Typography>
      <TextField
        size="small"
        value={metrics[field] || ""}
        onChange={handleMetricChange(field)}
        fullWidth
        sx={{ mt: 1 }}
        inputProps={{
          inputMode: "decimal",
          pattern: "[0-9]*[.]?[0-9]*",
        }}
        InputProps={{
          endAdornment: <Typography>{unit}</Typography>,
        }}
      />
    </Box>
  ) : (
    <Box>
      <Typography color="textSecondary">{label}</Typography>
      <Typography variant="body1">
        {value ? `${value} ${unit}` : "Não disponível"}
      </Typography>
    </Box>
  );
};

const MetricsCard = ({
  data,
  isEditing,
  setIsEditing,
  metrics,
  handleMetricChange,
  handleSave,
  handleCancel,
  userId,
}) => {
  const [showHistory, setShowHistory] = useState(false);
  const {
    data: evaluationHistory,
    isLoading: isLoadingEvaluationHistory,
    refetch: refetchEvaluationHistory,
  } = useGetMetricsByUserIdQuery(userId);

  // Get the latest metrics safely
  const latestMetrics = data?.bodyMetrics?.[0];
  const evaluator = latestMetrics?.appointmentMadeBy;

  if (showHistory) {
    return (
      <Grid item xs={12} md={6}>
        <Card variant="outlined">
          <CardContent>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                mb: 2,
                justifyContent: "space-between",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <ScaleIcon sx={{ mr: 1 }} color="primary" />
                <Typography variant="h6">Histórico de Avaliações</Typography>
              </Box>
              <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => setShowHistory(false)}
                variant="outlined"
              >
                Voltar
              </Button>
            </Box>

            {isLoadingEvaluationHistory ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                <CircularProgress />
              </Box>
            ) : !evaluationHistory?.length ? (
              <Typography sx={{ textAlign: "center", p: 3 }}>
                Nenhum histórico disponível
              </Typography>
            ) : (
              <TableContainer sx={{ mt: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Data</TableCell>
                      <TableCell>Avaliador</TableCell>
                      <TableCell>Peso (kg)</TableCell>
                      <TableCell>Altura (cm)</TableCell>
                      <TableCell>Cintura (cm)</TableCell>
                      <TableCell>Quadril (cm)</TableCell>
                      <TableCell>Coxa (cm)</TableCell>
                      <TableCell>Peito (cm)</TableCell>
                      <TableCell>Bicep (cm)</TableCell>
                      <TableCell>% Gordura</TableCell>
                      <TableCell>Massa Muscular (kg)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {evaluationHistory.map((evaluation, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          {evaluation?.appointmentDate
                            ? new Date(
                                evaluation.appointmentDate
                              ).toLocaleDateString("pt-BR", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })
                            : "Data não disponível"}
                        </TableCell>
                        <TableCell>
                          {evaluation?.appointmentMadeBy
                            ? `${evaluation.appointmentMadeBy.fname} ${evaluation.appointmentMadeBy.lname}`
                            : "Não disponível"}
                        </TableCell>
                        <TableCell>{evaluation?.weight || "N/A"}</TableCell>
                        <TableCell>{evaluation?.height || "N/A"}</TableCell>
                        <TableCell>{evaluation?.waist || "N/A"}</TableCell>
                        <TableCell>{evaluation?.hip || "N/A"}</TableCell>
                        <TableCell>{evaluation?.thigh || "N/A"}</TableCell>
                        <TableCell>{evaluation?.chest || "N/A"}</TableCell>
                        <TableCell>{evaluation?.biceps || "N/A"}</TableCell>
                        <TableCell>
                          {evaluation?.fatPercentage || "N/A"}
                        </TableCell>
                        <TableCell>{evaluation?.muscleMass || "N/A"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </Grid>
    );
  }

  return (
    <Grid item xs={12} md={6}>
      <Card variant="outlined">
        <CardContent>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              mb: 2,
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <ScaleIcon sx={{ mr: 1 }} color="primary" />
              <Typography variant="h6">Métricas Corporais</Typography>
            </Box>
          </Box>
          <Box sx={{ mb: 2 }}>
            <Button
              variant="outlined"
              onClick={() => setShowHistory(true)}
              sx={{ mr: 1 }}
            >
              Histórico de Avaliação
            </Button>
            {isEditing ? (
              <>
                <Button
                  startIcon={<SaveIcon />}
                  onClick={() => {
                    handleSave();
                    refetchEvaluationHistory();
                  }}
                  color="primary"
                  variant="contained"
                  sx={{ mr: 1 }}
                >
                  Guardar
                </Button>
                <Button
                  startIcon={<CancelIcon />}
                  onClick={handleCancel}
                  color="error"
                  variant="contained"
                >
                  Cancelar
                </Button>
              </>
            ) : (
              <Button
                startIcon={<EditIcon />}
                onClick={() => setIsEditing(true)}
                color="primary"
                variant="contained"
              >
                Editar
              </Button>
            )}
          </Box>

          <Stack spacing={2}>
            <Box>
              <Typography color="textSecondary">
                Data da Última Avaliação
              </Typography>
              <Typography variant="body1">
                {latestMetrics?.appointmentDate
                  ? new Date(latestMetrics.appointmentDate).toLocaleDateString(
                      "pt-BR",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )
                  : "Não realizado"}
              </Typography>
              <Typography variant="body1">
                Realizada por:{" "}
                {evaluator
                  ? `${evaluator.fname} ${evaluator.lname}`
                  : "Não disponível"}
              </Typography>
            </Box>

            <MetricField
              label="Peso Corporal"
              value={latestMetrics?.weight || ""}
              field="weight"
              unit="kg"
              isEditing={isEditing}
              metrics={metrics}
              handleMetricChange={handleMetricChange}
            />
            <MetricField
              label="Altura"
              value={latestMetrics?.height || ""}
              field="height"
              unit="cm"
              isEditing={isEditing}
              metrics={metrics}
              handleMetricChange={handleMetricChange}
            />

            <Divider />
            <Typography variant="subtitle2" color="primary">
              Circunferências Corporais
            </Typography>

            <MetricField
              label="Cintura"
              value={latestMetrics?.waist || ""}
              field="waist"
              unit="cm"
              isEditing={isEditing}
              metrics={metrics}
              handleMetricChange={handleMetricChange}
            />
            <MetricField
              label="Quadril"
              value={latestMetrics?.hip || ""}
              field="hip"
              unit="cm"
              isEditing={isEditing}
              metrics={metrics}
              handleMetricChange={handleMetricChange}
            />
            <MetricField
              label="Coxa"
              value={latestMetrics?.thigh || ""}
              field="thigh"
              unit="cm"
              isEditing={isEditing}
              metrics={metrics}
              handleMetricChange={handleMetricChange}
            />
            <MetricField
              label="Peito"
              value={latestMetrics?.chest || ""}
              field="chest"
              unit="cm"
              isEditing={isEditing}
              metrics={metrics}
              handleMetricChange={handleMetricChange}
            />
            <MetricField
              label="Bíceps"
              value={latestMetrics?.biceps || ""}
              field="biceps"
              unit="cm"
              isEditing={isEditing}
              metrics={metrics}
              handleMetricChange={handleMetricChange}
            />

            <Divider />
            <MetricField
              label="Frequência Cardíaca de Repouso"
              value={latestMetrics?.restingHeartRate || ""}
              field="restingHeartRate"
              unit="bpm"
              isEditing={isEditing}
              metrics={metrics}
              handleMetricChange={handleMetricChange}
            />
            <MetricField
              label="Percentagem de Gordura"
              value={latestMetrics?.fatPercentage || ""}
              field="fatPercentage"
              unit="%"
              isEditing={isEditing}
              metrics={metrics}
              handleMetricChange={handleMetricChange}
            />
            <MetricField
              label="Quantidade de massa muscular"
              value={latestMetrics?.muscleMass || ""}
              field="muscleMass"
              unit="kg"
              isEditing={isEditing}
              metrics={metrics}
              handleMetricChange={handleMetricChange}
            />
          </Stack>
        </CardContent>
      </Card>
    </Grid>
  );
};
// Mock data for exercises
const exerciseDatabase = [
  { id: 1, name: "Supino Reto", muscle: "Peito", equipment: "Barra" },
  { id: 2, name: "Agachamento", muscle: "Pernas", equipment: "Barra" },
  { id: 3, name: "Puxada na Frente", muscle: "Costas", equipment: "Máquina" },
  { id: 4, name: "Rosca Direta", muscle: "Bíceps", equipment: "Barra W" },
  { id: 5, name: "Extensão Triceps", muscle: "Tríceps", equipment: "Corda" },
];

// Mock data f<or existing training plans
const mockTrainingPlans = [
  {
    id: 1,
    name: "Treino A - Superior",
    exercises: [
      { id: 1, sets: 4, reps: 12, weight: 60 },
      { id: 4, sets: 3, reps: 15, weight: 20 },
    ],
  },
];

const TrainingPlans = ({ userId }) => {
  // API Hooks
  const { data: dataExercises, isLoading: isLoadingExercises } =
    useGetAllExercisesQuery();
  const { data: userWorkoutPlan, isLoading: isLoadingPlans } =
    useGetUserWorkoutPlanQuery(userId);
  const { refetch: refetchUserWorkoutPlan } =
    useGetUserWorkoutPlanQuery(userId);

  const [createWorkoutPlan, { isLoading: isCreatingPlan }] =
    useCreateUserWorkoutPlanMutation();
  const [editUserWorkoutPlan] = useEditUserWorkoutPlanMutation();
  const [deleteUserWorkoutPlan] = useDeleteUserWorkoutPlanMutation();

  // Local State
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [expandedPlan, setExpandedPlan] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState(null);
  const exercisesPerPage = 6;

  const [newPlan, setNewPlan] = useState({
    name: "",
    exercises: [],
  });

  const [editingPlan, setEditingPlan] = useState(null);

  // Filtering and Pagination
  const filteredExercises =
    dataExercises?.filter(
      (exercise) =>
        exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exercise.targetMuscle
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        exercise.equipment.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
    ) || [];

  const totalPages = Math.ceil(filteredExercises.length / exercisesPerPage);
  const startIndex = (page - 1) * exercisesPerPage;
  const paginatedExercises = filteredExercises.slice(
    startIndex,
    startIndex + exercisesPerPage
  );

  // Handlers
  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const togglePlanExpansion = (planId) => {
    setExpandedPlan(expandedPlan === planId ? null : planId);
  };

  const handleEditClick = (plan) => {
    setEditingPlan({
      ...plan,
      exercises: plan.exercises.map((ex) => ({
        ...ex,
        exerciseId: ex.exercise.exerciseId,
        name: ex.exercise.name,
        targetMuscle: ex.exercise.targetMuscle,
        equipment: ex.exercise.equipment,
      })),
    });
    setIsEditing(true);
  };

  const handleEditWorkoutPlan = async () => {
    try {
      const updatedData = {
        name: editingPlan.name,
        exercises: editingPlan.exercises.map((exercise) => ({
          name: exercise.name,
          exerciseId: exercise.exerciseId,
          sets: parseInt(exercise.sets),
          reps: parseInt(exercise.reps),
          weight: parseInt(exercise.weight),
        })),
      };

      await editUserWorkoutPlan({
        workoutPlanId: editingPlan.workoutPlanId,
        ...updatedData,
      }).unwrap();

      setIsEditing(false);
      setEditingPlan(null);
      refetchUserWorkoutPlan();
      console.log("Workout plan updated successfully");
    } catch (error) {
      console.error("Failed to edit workout plan:", error);
    }
  };

  const handleDeleteClick = (workoutPlanId) => {
    setPlanToDelete(workoutPlanId);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteUserWorkoutPlan(planToDelete).unwrap();
      refetchUserWorkoutPlan();
      console.log("Workout plan deleted successfully");
    } catch (error) {
      console.error("Failed to delete workout plan:", error);
    } finally {
      setDeleteConfirmOpen(false);
      setPlanToDelete(null);
    }
  };

  const addExerciseToPlan = (exercise) => {
    const targetPlan = isEditing ? editingPlan : newPlan;
    const setTargetPlan = isEditing ? setEditingPlan : setNewPlan;

    setTargetPlan({
      ...targetPlan,
      exercises: [
        ...targetPlan.exercises,
        { ...exercise, sets: 3, reps: 12, weight: 0 },
      ],
    });
  };

  const handleExerciseUpdate = (index, field, value) => {
    const targetPlan = isEditing ? editingPlan : newPlan;
    const setTargetPlan = isEditing ? setEditingPlan : setNewPlan;

    const updatedExercises = [...targetPlan.exercises];
    updatedExercises[index][field] = parseInt(value) || 0;
    setTargetPlan({
      ...targetPlan,
      exercises: updatedExercises,
    });
  };

  const removeExercise = (index) => {
    const targetPlan = isEditing ? editingPlan : newPlan;
    const setTargetPlan = isEditing ? setEditingPlan : setNewPlan;

    const updatedExercises = targetPlan.exercises.filter((_, i) => i !== index);
    setTargetPlan({
      ...targetPlan,
      exercises: updatedExercises,
    });
  };

  const handleSaveWorkoutPlan = async () => {
    if (!newPlan.name) {
      console.log("Por favor, dê um nome ao plano de treino");
      return;
    }

    if (newPlan.exercises.length === 0) {
      console.log("Adicione pelo menos um exercício ao plano");
      return;
    }

    try {
      const workoutPlanData = {
        name: newPlan.name,
        userId: userId,
        exercises: newPlan.exercises.map((exercise) => ({
          name: exercise.name,
          exerciseId: exercise.exerciseId,
          sets: parseInt(exercise.sets),
          reps: parseInt(exercise.reps),
          weight: parseInt(exercise.weight),
        })),
      };
      console.log(workoutPlanData);
      await createWorkoutPlan(workoutPlanData).unwrap();
      console.log("Plano de treino criado com sucesso!");
      refetchUserWorkoutPlan();
      handleDialogClose();
    } catch (error) {
      console.error("Failed to create workout plan:", error);
      console.log(error.data?.message || "Erro ao criar plano de treino");
    }
  };

  const handleDialogClose = () => {
    if (isEditing) {
      setIsEditing(false);
      setEditingPlan(null);
    } else {
      setIsCreating(false);
      setNewPlan({ name: "", exercises: [] });
    }
    setSearchQuery("");
    setPage(1);
  };

  if (isLoadingExercises || isLoadingPlans) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  const activePlan = isEditing ? editingPlan : newPlan;

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <DumbbellIcon color="primary" />
          <Typography variant="h5" component="h2">
            Planos de Treino do cliente
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsCreating(true)}
        >
          Novo Treino
        </Button>
      </Box>

      {/* Create/Edit Plan Dialog */}
      <Dialog
        open={isCreating || isEditing}
        onClose={handleDialogClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {isEditing
            ? "Editar Plano de Treino"
            : "Criar um novo Plano de Treino"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              fullWidth
              label="Nome do plano de treino"
              value={activePlan.name}
              onChange={(e) =>
                isEditing
                  ? setEditingPlan({ ...editingPlan, name: e.target.value })
                  : setNewPlan({ ...newPlan, name: e.target.value })
              }
            />

            {/* Exercise Search */}
            <Typography variant="h6" sx={{ mt: 1 }}>
              Adicionar Exercícios
            </Typography>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                backgroundColor: (theme) => theme.palette.background.alt,
                borderRadius: "10px",
                p: "0.1rem 1.5rem",
                width: "100%",
              }}
            >
              <InputBase
                placeholder="Procurar..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                fullWidth
              />
              <IconButton>
                <Search />
              </IconButton>
            </Box>

            {/* Exercise Grid */}
            <Grid container spacing={2}>
              {paginatedExercises.map((exercise) => (
                <Grid item xs={12} sm={6} key={exercise.exerciseId}>
                  <Card
                    variant="outlined"
                    sx={{
                      cursor: "pointer",
                      "&:hover": { bgcolor: "action.hover" },
                    }}
                    onClick={() => addExerciseToPlan(exercise)}
                  >
                    <CardContent
                      sx={{ display: "flex", alignItems: "center", gap: 2 }}
                    >
                      <Avatar
                        variant="rounded"
                        sx={{ width: 80, height: 80, bgcolor: "grey.200" }}
                        src={exercise.imageUrl}
                        alt={exercise.name}
                      />
                      <Box>
                        <Typography variant="subtitle1">
                          {exercise.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {exercise.targetMuscle} - {exercise.equipment.name}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Pagination */}
            {filteredExercises.length > exercisesPerPage && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                />
              </Box>
            )}

            {/* Selected Exercises */}
            {activePlan.exercises.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6">Exercícios Selecionados</Typography>
                {activePlan.exercises.map((exercise, index) => (
                  <Card key={index} variant="outlined" sx={{ mt: 1, p: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Typography sx={{ flex: 1 }}>{exercise.name}</Typography>
                      <TextField
                        label="Séries"
                        type="number"
                        size="small"
                        value={exercise.sets}
                        onChange={(e) =>
                          handleExerciseUpdate(index, "sets", e.target.value)
                        }
                        sx={{ width: 100 }}
                      />
                      <TextField
                        label="Reps"
                        type="number"
                        size="small"
                        value={exercise.reps}
                        onChange={(e) =>
                          handleExerciseUpdate(index, "reps", e.target.value)
                        }
                        sx={{ width: 100 }}
                      />
                      <TextField
                        label="Peso (kg)"
                        type="number"
                        size="small"
                        value={exercise.weight}
                        onChange={(e) =>
                          handleExerciseUpdate(index, "weight", e.target.value)
                        }
                        sx={{ width: 100 }}
                      />
                      <IconButton
                        color="error"
                        onClick={() => removeExercise(index)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Card>
                ))}
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} disabled={isCreatingPlan}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={isEditing ? handleEditWorkoutPlan : handleSaveWorkoutPlan}
            disabled={
              isCreatingPlan ||
              !activePlan.name ||
              activePlan.exercises.length === 0
            }
          >
            {isCreatingPlan ? (
              <>
                <CircularProgress size={24} sx={{ mr: 1 }} />
                Salvando...
              </>
            ) : isEditing ? (
              "Guardar Alterações"
            ) : (
              "Guardar o Treino"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>Confirmar Eliminação</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja eliminar este plano de treino? Esta ação não
            pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancelar</Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Existing Plans List */}
      <Box sx={{ mt: 3 }}>
        {userWorkoutPlan?.map((plan) => (
          <Card key={plan.workoutPlanId} sx={{ mb: 2 }}>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  cursor: "pointer",
                }}
                onClick={() => togglePlanExpansion(plan.workoutPlanId)}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <EventIcon color="primary" />
                  <Box>
                    <Typography variant="h6">{plan.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Criada no dia:{" "}
                      {new Date(plan.createdAt).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Criada por: {plan.madeByUser.fname}{" "}
                      {plan.madeByUser.lname}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  {expandedPlan === plan.workoutPlanId ? (
                    <ExpandLessIcon />
                  ) : (
                    <ExpandMoreIcon />
                  )}
                </Box>
              </Box>

              <Collapse in={expandedPlan === plan.workoutPlanId}>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ mt: 2 }}>
                  {plan.exercises.map((exercise) => (
                    <Card
                      key={exercise.id}
                      variant="outlined"
                      sx={{ mb: 1, p: 2 }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Box>
                          <Typography variant="subtitle1">
                            {exercise.exercise.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {exercise.exercise.targetMuscle} -{" "}
                            {exercise.exercise.exerciseType}
                          </Typography>
                        </Box>
                        <Box sx={{ display: "flex", gap: 2 }}>
                          <Typography>{exercise.sets} séries</Typography>
                          <Typography>{exercise.reps} reps</Typography>
                          <Typography>{exercise.weight} kg</Typography>
                        </Box>
                      </Box>
                    </Card>
                  ))}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: 1,
                      mt: 2,
                    }}
                  >
                    <Button
                      startIcon={<EditIcon />}
                      variant="outlined"
                      size="small"
                      onClick={() => handleEditClick(plan)}
                    >
                      Editar
                    </Button>
                    <Button
                      startIcon={<DeleteIcon />}
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => handleDeleteClick(plan.workoutPlanId)}
                    >
                      Eliminar
                    </Button>
                  </Box>
                </Box>
              </Collapse>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Paper>
  );
};

const ClienteTreinadorIndividual = () => {
  const { userId } = useParams();
  const { data: userData, isLoading } = useGetUserByIdForTreinadorQuery(userId);
  const [updateUserMetrics, { isLoading: isLoadingUpdateUserMetrics }] =
    useUpdateMetricsByUserIdMutation();
  const [isEditing, setIsEditing] = useState(false);
  const [metrics, setMetrics] = useState({
    weight: "",
    height: "",
    waist: "",
    hip: "",
    thigh: "",
    chest: "",
    biceps: "",
    restingHeartRate: "",
    fatPercentage: "",
    muscleMass: "",
  });

  React.useEffect(() => {
    // Only update metrics if userData exists and has bodyMetrics array
    if (userData?.bodyMetrics?.length > 0) {
      const latestMetrics = userData.bodyMetrics[0];
      setMetrics({
        weight: latestMetrics?.weight?.toString() || "",
        height: latestMetrics?.height?.toString() || "",
        waist: latestMetrics?.waist?.toString() || "",
        hip: latestMetrics?.hip?.toString() || "",
        restingHeartRate: latestMetrics?.restingHeartRate?.toString() || "",
        fatPercentage: latestMetrics?.fatPercentage?.toString() || "",
        muscleMass: latestMetrics?.muscleMass?.toString() || "",
        thigh: latestMetrics?.thigh?.toString() || "",
        chest: latestMetrics?.chest?.toString() || "",
        biceps: latestMetrics?.biceps?.toString() || "",
      });
    }
  }, [userData]);

  const handleMetricChange = (field) => (event) => {
    const value = event.target.value;

    // Only allow numbers and dots, replace commas with dots
    const sanitizedValue = value
      .replace(/,/g, ".") // Replace commas with dots
      .replace(/[^\d.]/g, "") // Remove any character that's not a digit or dot
      .replace(/(\..*)\./g, "$1"); // Allow only one dot

    setMetrics((prev) => ({
      ...prev,
      [field]: sanitizedValue,
    }));
  };

  const handleSave = async () => {
    try {
      // Show loading state while updating
      if (isLoadingUpdateUserMetrics) return;

      // Validate metrics before sending
      const validatedMetrics = {
        weight: Number(metrics.weight) || null,
        height: Number(metrics.height) || null,
        waist: Number(metrics.waist) || null,
        hip: Number(metrics.hip) || null,
        thigh: Number(metrics.thigh) || null,
        chest: Number(metrics.chest) || null,
        biceps: Number(metrics.biceps) || null,
        restingHeartRate: Number(metrics.restingHeartRate) || null,
        fatPercentage: Number(metrics.fatPercentage) || null,
        muscleMass: Number(metrics.muscleMass) || null,
      };

      // Send update request
      await updateUserMetrics({
        userId: userId,
        metrics: validatedMetrics,
      }).unwrap();

      // Exit edit mode on successful update
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update metrics:", error);
      // Optionally add error handling UI here
    }
  };

  const handleCancel = () => {
    // Reset to the latest user metrics if available
    if (userData?.bodyMetrics?.length > 0) {
      const latestMetrics = userData.bodyMetrics[0];
      setMetrics({
        weight: latestMetrics?.weight?.toString() || "",
        height: latestMetrics?.height?.toString() || "",
        waist: latestMetrics?.waist?.toString() || "",
        hip: latestMetrics?.hip?.toString() || "",
        restingHeartRate: latestMetrics?.restingHeartRate?.toString() || "",
        fatPercentage: latestMetrics?.fatPercentage?.toString() || "",
        muscleMass: latestMetrics?.muscleMass?.toString() || "",
        thigh: latestMetrics?.thigh?.toString() || "",
        chest: latestMetrics?.chest?.toString() || "",
        biceps: latestMetrics?.biceps?.toString() || "",
      });
    }
    setIsEditing(false);
  };

  if (isLoading) {
    return <LinearProgress />;
  }

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
  };

  return (
    <>
      <Header
        title={userData ? `Cliente` : "Detalhes do Cliente"}
        subtitle="Gestão e Acompanhamento"
      />
      <Box sx={{ mx: "5rem" }}>
        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <PersonIcon sx={{ mr: 1 }} color="primary" />
            <Typography variant="h5" component="h2">
              Informações do Cliente
            </Typography>
          </Box>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            <PersonalInfo userData={userData} getInitials={getInitials} />
            <MetricsCard
              data={userData}
              isEditing={isEditing}
              setIsEditing={setIsEditing}
              metrics={metrics}
              handleMetricChange={handleMetricChange}
              handleSave={handleSave}
              handleCancel={handleCancel}
              userId={userId}
            />
          </Grid>
        </Paper>

        <TrainingPlans userId={userId} />
      </Box>
    </>
  );
};

export default ClienteTreinadorIndividual;
