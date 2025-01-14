import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Avatar,
  IconButton,
  Grid,
  Menu,
  MenuItem,
  ListItemText,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

// Mock user data for demonstration
const mockUserData = {
  name: "João Silva",
  profilePicture: "https://via.placeholder.com/150",
  membershipNumber: "12345",
};

// Custom Time Picker Component
const CustomTimePicker = ({ value, onChange }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [inputValue, setInputValue] = useState(value || "10:00");

  // Handle opening the time selection menu
  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);

  // Handle closing the time selection menu
  const handleMenuClose = () => setAnchorEl(null);

  // Handle time selection from menu
  const handleTimeSelect = (time) => {
    setInputValue(time);
    onChange(time);
    handleMenuClose();
  };

  // Generate time slots (every 15 minutes for 24 hours)
  const generateTimeSlots = () => {
    return Array.from({ length: 96 }, (_, index) => {
      const hour = String(Math.floor(index / 4)).padStart(2, "0");
      const minute = String((index % 4) * 15).padStart(2, "0");
      return `${hour}:${minute}`;
    });
  };

  // Handle input change for custom time entry
  const handleInputChange = (e) => {
    const { value } = e.target;
    // Allow empty input or valid time format
    if (/^([01]?\d|2[0-3]):([0-5]?\d)?$/.test(value) || value === "") {
      setInputValue(value);
    }
  };

  // Validate input when it loses focus
  const handleInputBlur = () => {
    if (!/^([01]?\d|2[0-3]):([0-5]?\d)$/.test(inputValue)) {
      setInputValue("10:00");
    }
    onChange(inputValue);
  };

  return (
    <Box>
      <TextField
        label="Horário"
        value={inputValue}
        onClick={handleMenuOpen}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        fullWidth
      />
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {generateTimeSlots().map((time) => (
          <MenuItem key={time} onClick={() => handleTimeSelect(time)}>
            <ListItemText primary={time} />
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

// Meal Plan Creation Component
const MealPlanCreation = ({ userId, setIsCreating }) => {
  const [mealPlan, setMealPlan] = useState({});
  const [foodDetails, setFoodDetails] = useState({
    name: "",
    calories: "",
    type: "",
    time: "10:00",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [editMeal, setEditMeal] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [mealToDelete, setMealToDelete] = useState(null);
  const [isEditModalOpen, setEditModalOpen] = useState(false);

  // Function to save meal details
  const handleSaveMeal = () => {
    const { name, calories, type, time } = foodDetails;

    // Validation checks
    if (!name || !calories || !type || !time) {
      setErrorMessage("Por favor, preencha todos os campos.");
      return;
    }
    if (isNaN(calories) || Number(calories) < 0) {
      setErrorMessage("As calorias devem ser um número positivo.");
      return;
    }

    const mealId = Date.now();
    const updatedMeals = mealPlan[type] || [];

    // If editing an existing meal, update it; otherwise, add a new meal
    setMealPlan((prev) => {
      const meals = editMeal
        ? updatedMeals.map((meal) =>
            meal.id === editMeal.id
              ? { ...meal, name, calories: Number(calories), time }
              : meal
          )
        : [
            ...updatedMeals,
            { id: mealId, name, calories: Number(calories), time },
          ];

      return { ...prev, [type]: meals };
    });
    resetForm();
  };

  // Reset form fields to initial state
  const resetForm = () => {
    setFoodDetails({ name: "", calories: "", type: "", time: "10:00" });
    setErrorMessage("");
    setEditModalOpen(false);
  };

  // Set up meal editing
  const handleEditMeal = (meal, type) => {
    setFoodDetails({
      name: meal.name,
      calories: meal.calories.toString(),
      type,
      time: meal.time,
    });
    setEditMeal({ id: meal.id, type });
    setEditModalOpen(true);
  };

  // Set up meal deletion
  const handleDeleteMeal = (meal) => {
    setMealToDelete(meal);
    setConfirmDelete(true);
  };

  // Confirm deletion of the meal
  const confirmDeletion = () => {
    const { type } = mealToDelete;
    setMealPlan((prev) => ({
      ...prev,
      [type]: prev[type].filter((meal) => meal.id !== mealToDelete.id),
    }));
    setConfirmDelete(false);
    setMealToDelete(null);
  };

  // Handle meal plan submission
  const handleSubmit = () => {
    if (Object.keys(mealPlan).length === 0) {
      setErrorMessage("Por favor, adicione pelo menos uma refeição ao plano.");
      return;
    }

    console.log("Submitting Meal Plan:", { userId, mealPlan });
    setIsCreating(false);
  };

  return (
    <Box
      sx={{
        mt: 2,
        p: 3,
        border: "1px solid #ccc",
        borderRadius: "8px",
        maxWidth: 600,
        boxShadow: 2,
      }}
    >
      <Typography variant="h5" gutterBottom>
        Criar Novo Plano de Refeição
      </Typography>

      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <Avatar
          src={mockUserData.profilePicture}
          sx={{ width: 64, height: 64, mr: 2 }}
        />
        <Box>
          <Typography variant="h6">{mockUserData.name}</Typography>
          <Typography variant="body2" color="text.secondary">
            Membro nº {mockUserData.membershipNumber}
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h6">Adicionar Refeição</Typography>
          <TextField
            label="Nome da Refeição"
            value={foodDetails.name}
            onChange={(e) =>
              setFoodDetails({ ...foodDetails, name: e.target.value })
            }
            fullWidth
            margin="normal"
          />
          <TextField
            label="Calorias"
            value={foodDetails.calories}
            onChange={(e) => {
              const value = e.target.value;
              // Only allow positive integer input
              if (/^\d*$/.test(value)) {
                setFoodDetails({ ...foodDetails, calories: value });
              }
            }}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Tipo de Refeição"
            value={foodDetails.type}
            onChange={(e) =>
              setFoodDetails({ ...foodDetails, type: e.target.value })
            }
            fullWidth
            margin="normal"
          />
          <CustomTimePicker
            value={foodDetails.time}
            onChange={(time) => setFoodDetails({ ...foodDetails, time })}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleSaveMeal}
            sx={{ mt: 2 }}
          >
            Adicionar Refeição
          </Button>
          {errorMessage && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
              {errorMessage}
            </Typography>
          )}
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6">Refeições Adicionadas</Typography>
          {Object.keys(mealPlan).length > 0 ? (
            Object.entries(mealPlan).map(([type, meals]) => (
              <Box key={type} sx={{ mb: 2 }}>
                <Typography variant="h6">{type}</Typography>
                {meals.map((meal) => (
                  <Box
                    key={meal.id}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      borderBottom: "1px solid #ccc",
                      py: 1,
                    }}
                  >
                    <Box>
                      <Typography variant="body1">
                        {meal.name} - Hora {meal.time}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {meal.calories} calorias
                      </Typography>
                    </Box>
                    <Box>
                      <IconButton onClick={() => handleEditMeal(meal, type)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteMeal(meal)}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                ))}
              </Box>
            ))
          ) : (
            <Typography variant="body2">
              Nenhuma refeição adicionada ainda.
            </Typography>
          )}
        </Grid>

        <Grid item xs={12} sx={{ mt: 2 }}>
          <Button variant="contained" color="primary" onClick={handleSubmit}>
            Salvar Plano de Refeição
          </Button>
        </Grid>
      </Grid>

      {/* Delete Confirmation Dialog */}
      <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Você tem certeza de que deseja excluir a refeição "
            {mealToDelete?.name}"?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(false)} color="primary">
            Cancelar
          </Button>
          <Button onClick={confirmDeletion} color="secondary">
            Excluir
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Meal Modal */}
      <Dialog open={isEditModalOpen} onClose={() => setEditModalOpen(false)}>
        <DialogTitle>
          {editMeal ? "Editar Refeição" : "Adicionar Refeição"}
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Nome da Refeição"
            value={foodDetails.name}
            onChange={(e) =>
              setFoodDetails({ ...foodDetails, name: e.target.value })
            }
            fullWidth
            margin="normal"
          />
          <TextField
            label="Calorias"
            value={foodDetails.calories}
            onChange={(e) => {
              const value = e.target.value;
              // Only allow positive integer input
              if (/^\d*$/.test(value)) {
                setFoodDetails({ ...foodDetails, calories: value });
              }
            }}
            fullWidth
            margin="normal"
          />
          <CustomTimePicker
            value={foodDetails.time}
            onChange={(time) => setFoodDetails({ ...foodDetails, time })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditModalOpen(false)} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleSaveMeal} color="primary">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MealPlanCreation;
