import React, { useMemo, useEffect } from "react";
import { useSelector } from "react-redux";
import { createTheme } from "@mui/material/styles";
import { Navigate, Routes, Route } from "react-router-dom";
import { CssBaseline, ThemeProvider } from "@mui/material";

import { themeSettings } from "theme";
import Layout from "scenes/layout";
import LoginPage from "scenes/login";
import NotFound404 from "components/common/NotFound404";
import RequireAuth from "components/Auth/RequireAuth";
import ProtectedRoute from "components/Auth/ProtectedRoute";
import UnProtectedRoute from "components/Auth/UnprotectedRoute";

// Dashboard
import DashboardPage from "scenes/dashboard";

// Users
import RegisterCustomerPage from "scenes/Users/registerUser";
import UserDataGrid from "scenes/Users/getAllUsers";
import UserProfile from "scenes/Users/userById";

// Planos
import GymPlans from "scenes/Planos/getAllGymPlans";
import CreateGymPlan from "scenes/Planos/createGymPlan";
import EditGymPlan from "scenes/Planos/editGymPlan";
import CheckboxListSecondary from "scenes/Planos/listClientsByPlan";

// Assinaturas
import SignaturesPage from "scenes/Assinaturas/signatures";
import SignatureByIdPage from "scenes/Assinaturas/signatureByIdPage";

// Pagamentos
import PaymentsPage from "scenes/Pagamentos/getAllPayments";
import PaymentsByIdPage from "scenes/Pagamentos/paymentById";

// Funcionarios
import EmployeesPage from "scenes/Funcionarios/getAllFuncionarios";

// Aulas
import MapaAulas from "scenes/Aulas";

// Blog
import Blog from "scenes/blog";
import BlogCriation from "scenes/blog/createBlog";

// Messages
import MessagesPages from "scenes/messages";
import PlanosDieta from "scenes/Planos de Dieta";
import MealPlanCreation from "scenes/Planos de Dieta/MealPlanCreation";
import Negado from "components/common/Negado";
import BlogById from "scenes/blog/blogById";
import ClientesTreinador from "scenes/ClientesTreinador";
import Maquinas from "scenes/Maquinas";
import Exercicios from "scenes/Exercicios";
import MaquinaById from "scenes/Maquinas/MaquinaById";
import CriarExercicio from "scenes/Exercicios/CriarExercicio";
import ExercicioById from "scenes/Exercicios/exercicioById/index";
import ClienteTreinadorIndividual from "scenes/ClientesTreinador/ClienteTreinadorIndividual";

function App() {
  const mode = useSelector((state) => state.global.mode);
  const theme = useMemo(() => createTheme(themeSettings(mode)), [mode]);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--background-default",
      theme.palette.background.default
    );
    document.documentElement.style.setProperty(
      "--background-alt",
      theme.palette.background.alt
    );
    document.documentElement.style.setProperty(
      "--primary-main",
      theme.palette.primary.main
    );
    document.documentElement.style.setProperty(
      "--secondary-100",
      theme.palette.secondary[100]
    );
    document.documentElement.style.setProperty(
      "--secondary-200",
      theme.palette.secondary[200]
    );
    document.documentElement.style.setProperty(
      "--text-primary",
      theme.palette.text.primary
    );
    document.documentElement.style.setProperty("--text-focus", "#ffffff");
  }, [theme]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        {/* Public Route */}
        <Route
          path="/login"
          element={
            <UnProtectedRoute>
              <LoginPage />
            </UnProtectedRoute>
          }
        />

        {/* Protected Routes for Administrador */}
        <Route
          element={
            <>
              <RequireAuth />
              <Layout />
              <ProtectedRoute roles={["Administrador"]} />
            </>
          }
        >
          <Route>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            <Route path="/dashboard" element={<DashboardPage />} />

            <Route path="/form" element={<RegisterCustomerPage />} />

            <Route path="/users" element={<UserDataGrid />} />
            <Route path="/users/:userId" element={<UserProfile />} />

            <Route path="/planos" element={<GymPlans />} />
            <Route path="/planos/criar" element={<CreateGymPlan />} />
            <Route path="/planos/editar/:id" element={<EditGymPlan />} />
            <Route
              path="/planos/clientes/:id"
              element={<CheckboxListSecondary />}
            />
            <Route path="/assinaturas" element={<SignaturesPage />} />
            <Route path="/assinaturas/:id" element={<SignatureByIdPage />} />

            <Route path="/pagamentos" element={<PaymentsPage />} />
            <Route path="/pagamentos/:id" element={<PaymentsByIdPage />} />

            <Route path="/funcionarios" element={<EmployeesPage />} />
          </Route>
        </Route>

        {/* Protected Routes for Administrador , Nutricionista */}
        <Route
          element={
            <>
              <RequireAuth />
              <Layout />
              <ProtectedRoute roles={["Administrador", "Nutricionista"]} />
            </>
          }
        >
          <Route path="/planos-de-dieta" element={<PlanosDieta />} />
          <Route path="/planos-de-dieta/criar" element={<MealPlanCreation />} />
        </Route>
        {/* Protected Routes for Administrador , Treinador */}
        <Route
          element={
            <>
              <RequireAuth />
              <Layout />
              <ProtectedRoute roles={["Administrador", "Treinador"]} />
            </>
          }
        >
          <Route path="/aulas" element={<MapaAulas />} />
        </Route>
        <Route
          element={
            <>
              <RequireAuth />
              <Layout />
              <ProtectedRoute roles={["Administrador", "Treinador"]} />
            </>
          }
        >
          <Route path="/clientes" element={<ClientesTreinador />} />
          <Route
            path="/clientes/:userId"
            element={<ClienteTreinadorIndividual />}
          />

          <Route path="/exercicios" element={<Exercicios />} />
          <Route path="/exercicios/criar" element={<CriarExercicio />} />
          <Route path="/exercicios/:exercicioId" element={<ExercicioById />} />

          {/* apenas para efeitos de exemplo, o treinador não consegue criar máquinas ou eliminar */}
          <Route path="/maquinas" element={<Maquinas />} />
          <Route path="/maquinas/:maquinaId" element={<MaquinaById />} />
        </Route>
        {/* PARA TODOS */}
        <Route
          element={
            <>
              <RequireAuth />
              <Layout />
              <ProtectedRoute
                roles={["Administrador", "Nutricionista", "Treinador"]}
              />
            </>
          }
        >
          <Route path="/blog/:id" element={<BlogById />} />

          <Route path="/mensagens" element={<MessagesPages />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/criar" element={<BlogCriation />} />
        </Route>
        <Route
          element={
            <>
              <RequireAuth />
              <Layout />
            </>
          }
        >
          {/* 404 Page */}
          <Route path="/negado" element={<Negado />} />
          <Route path="*" element={<NotFound404 />} />
        </Route>
      </Routes>
    </ThemeProvider>
  );
}

export default App;
