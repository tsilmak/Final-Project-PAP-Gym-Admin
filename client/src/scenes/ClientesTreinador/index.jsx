import React, { useState, useEffect, useMemo } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Box, Snackbar, Alert, Button } from "@mui/material";
import SearchBar from "components/common/SearchBar";
import Header from "components/common/Header";
import { useGetUsersForTreinadorQuery } from "state/api";
import { Link } from "react-router-dom";
import { useTheme } from "@emotion/react";
import ErrorOverlay from "components/common/ErrorOverlay";
import { useMediaQuery } from "@mui/material";

const columns = () => [
  {
    field: "profilePictureUrl",
    headerName: "Avatar",
    width: 100,
    renderCell: (params) => (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: 50,
          height: 50,
        }}
      >
        <img
          src={params.value}
          alt="Avatar"
          style={{
            width: 45,
            height: 45,
            borderRadius: "50%",
            objectFit: "cover",
          }}
        />
      </div>
    ),
  },
  {
    field: "membershipNumber",
    headerName: "Identificador",
    width: 100,
    renderCell: (params) => params.value || "N/A",
  },
  {
    field: "fname",
    headerName: "Primeiro Nome",
    width: 130,
    renderCell: (params) => params.value || "N/A",
  },
  {
    field: "lname",
    headerName: "Último Nome",
    width: 130,
    renderCell: (params) => params.value || "N/A",
  },
  {
    field: "email",
    headerName: "Email",
    width: 180,
    renderCell: (params) => params.value || "N/A",
  },
  {
    field: "phoneNumber",
    headerName: "Telemóvel",
    width: 120,
    renderCell: (params) => params.value || "N/A",
  },
  {
    field: "idade",
    headerName: "Idade",
    width: 50,
    renderCell: (params) => {
      if (params.row.birthDate) {
        const birth = new Date(params.row.birthDate);
        const now = new Date();
        let age = now.getFullYear() - birth.getFullYear();
        const monthDifference = now.getMonth() - birth.getMonth();

        if (
          monthDifference < 0 ||
          (monthDifference === 0 && now.getDate() < birth.getDate())
        ) {
          age--;
        }
        return age;
      }
      return "N/A";
    },
  },
  {
    field: "gymPlanId",
    headerName: "Plano",
    width: 80,
    renderCell: (params) => {
      const gymPlanName = params.row.signatures[0]?.gymPlan.name;
      return gymPlanName ? gymPlanName : "Sem Plano";
    },
  },
  {
    field: "createdAt",
    headerName: "Membro desde",
    width: 130,
    renderCell: (params) => {
      return new Date(params.row.createdAt).toLocaleDateString() || "N/A";
    },
  },
  {
    field: "actions",
    headerName: "Ações",
    width: 120,
    renderCell: (params) => {
      return (
        <Button
          component={Link}
          to={`/clientes/${params.row.userId}`}
          variant="contained"
          color="primary"
          size="small"
        >
          Ver Cliente
        </Button>
      );
    },
  },
];

const ClientesTreinador = () => {
  const theme = useTheme();
  const isMedium = useMediaQuery(theme.breakpoints.down("md"));

  const { data: users = [], error, isLoading } = useGetUsersForTreinadorQuery();

  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = useMemo(() => {
    const filtered = users.filter((user) => user.role.rolesName === "Cliente");

    const searchWords = searchQuery
      .toLowerCase()
      .trim()
      .split(" ")
      .filter(Boolean);

    return filtered.filter((user) => {
      const membershipNumber = user.membershipNumber?.toLowerCase() || "";
      const firstName = user.fname?.toLowerCase() || "";
      const lastName = user.lname?.toLowerCase() || "";
      const email = user.email?.toLowerCase() || "";
      const phoneNumber = user.phoneNumber || "";

      return searchWords.every(
        (word) =>
          membershipNumber.includes(word) ||
          firstName.includes(word) ||
          lastName.includes(word) ||
          email.includes(word) ||
          phoneNumber.includes(word)
      );
    });
  }, [searchQuery, users]);

  if (error) return <ErrorOverlay error={error} dataName={"Utilizadores"} />;

  return (
    <>
      <Box>
        <Header title="Cliente" subtitle="Todos os clientes." />
        <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <Box sx={{ position: "relative", height: "calc(100vh - 300px)" }}>
          <DataGrid
            loading={isLoading}
            sx={{
              ml: isMedium ? "" : "5rem",
              mr: "5rem",
              height: "calc(100vh - 300px)",
            }}
            rows={filteredUsers}
            columns={columns()}
            pageSize={10}
            rowsPerPageOptions={[10]}
            getRowId={(row) => row.userId}
            checkboxSelection
          />
        </Box>
      </Box>
    </>
  );
};

export default ClientesTreinador;
