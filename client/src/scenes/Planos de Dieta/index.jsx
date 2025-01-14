import React, { useState } from "react";
import {
  Container,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import Header from "components/common/Header";

// Mock data for diet plans
const mockDietPlans = [
  {
    userId: "user1",
    name: "Plano A",
    meals: {
      breakfast: [{ food: "Ovos", quantity: "2" }],
      lunch: [{ food: "Frango grelhado", quantity: "200g" }],
      dinner: [{ food: "Salada", quantity: "1 prato" }],
    },
    profilePicture: "https://via.placeholder.com/50",
    firstName: "João",
    lastName: "Silva",
    membershipNumber: "123456",
  },
  {
    userId: "user2",
    name: "Plano B",
    meals: {
      breakfast: [{ food: "Iogurte", quantity: "1 copo" }],
      lunch: [{ food: "Peixe assado", quantity: "150g" }],
      dinner: [{ food: "Arroz", quantity: "1 porção" }],
    },
    profilePicture: "https://via.placeholder.com/50",
    firstName: "Maria",
    lastName: "Oliveira",
    membershipNumber: "654321",
  },
  // Add more mock data as needed
];

const PlanosDieta = () => {
  const navigate = useNavigate();
  const [dietPlans, setDietPlans] = useState(mockDietPlans);

  const [searchTerm, setSearchTerm] = useState("");

  // Delete a diet plan by name
  const handleDelete = (name) => {
    setDietPlans((prev) => prev.filter((plan) => plan.name !== name));
  };

  // Filter diet plans based on search term
  const filteredPlans = dietPlans.filter((plan) =>
    plan.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container>
      <Header
        title={"Planos de Dieta"}
        subtitle={"Gerencie os planos de dieta para seus clientes."}
      />
      <Box sx={{ mb: 3 }}>
        <TextField
          label="Pesquisar Plano"
          variant="outlined"
          fullWidth
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate("/planos-de-dieta/criar")}
        >
          Criar Plano
        </Button>
      </Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Foto do Cliente</TableCell>
              <TableCell>Nome do Plano</TableCell>
              <TableCell>Cliente</TableCell>
              <TableCell align="right">Número de Membro</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPlans.map((plan) => (
              <TableRow key={plan.name}>
                <TableCell>
                  <img
                    src={plan.profilePicture}
                    alt={`${plan.firstName} ${plan.lastName}`}
                    style={{ borderRadius: "50%" }}
                  />
                </TableCell>
                <TableCell component="th" scope="row">
                  {plan.name}
                </TableCell>
                <TableCell>
                  {plan.firstName} {plan.lastName}
                </TableCell>
                <TableCell align="right">{plan.membershipNumber}</TableCell>
                <TableCell align="right">
                  <Button
                    variant="outlined"
                    onClick={() =>
                      navigate(`/planos-de-dieta/editar/${plan.userId}`)
                    }
                  >
                    Editar
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => handleDelete(plan.name)}
                  >
                    Eliminar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default PlanosDieta;
