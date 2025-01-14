import React, { useState, useEffect, useMemo } from "react";
import { DataGrid } from "@mui/x-data-grid";
import {
  Box,
  IconButton,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchBar from "../../../components/common/SearchBar";
import Header from "../../../components/common/Header";
import { useGetUsersQuery, useDeleteUserMutation } from "state/api";
import { Link } from "react-router-dom";
import { useTheme } from "@emotion/react";
import ErrorOverlay from "components/common/ErrorOverlay";

const columns = (handleDelete) => [
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
    renderCell: (params) => (
      <Link
        to={`/users/${params.row.userId}`}
        style={{ textDecoration: "underline", color: "inherit" }}
      >
        {params.value || "N/A"}
      </Link>
    ),
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
    width: 130,
    renderCell: (params) => {
      const gymPlanName = params.row.signatures[0]?.gymPlan.name;
      return gymPlanName ? gymPlanName : "Sem Plano";
    },
  },
  {
    field: "createdAt",
    headerName: "Membro desde",
    width: 110,
    renderCell: (params) => {
      return new Date(params.row.createdAt).toLocaleDateString() || "N/A";
    },
  },
  {
    field: "delete",
    headerName: "Eliminar",
    width: 80,
    renderCell: (params) => (
      <IconButton
        color="error"
        aria-label="delete"
        onClick={() => handleDelete(params.row)}
      >
        <DeleteIcon />
      </IconButton>
    ),
  },
];

const UserDataGrid = () => {
  const theme = useTheme();

  const { data: users = [], error, isLoading, refetch } = useGetUsersQuery();

  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [userIdToDelete, setUserIdToDelete] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const handleDelete = (user) => {
    setUserIdToDelete(user.userId);
    setDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteUser(userIdToDelete).unwrap();
      setSnackbarMessage(
        "Utilizador excluído juntamente com a sua assinatura."
      );
      setSnackbarOpen(true);
      refetch();
    } catch (err) {
      setSnackbarMessage(
        "Falha ao eliminar o Cliente ou assinatura." +
          JSON.stringify(err.data.message)
      );
      setSnackbarOpen(true);
      console.error("Delete error:", err);
    } finally {
      setDialogOpen(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setUserIdToDelete(null);
  };

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
        <Header
          title="Gestão de Clientes"
          subtitle="Visualize, edite e exclua Clientes."
        />
        <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <Box sx={{ position: "relative", height: "calc(100vh - 300px)" }}>
          <DataGrid
            loading={isLoading}
            sx={{
              mx: "5rem",
              mx: { xs: "1rem", md: "5rem" },
              height: "calc(100vh - 300px)",
            }}
            rows={filteredUsers}
            columns={columns(handleDelete)}
            pageSize={10}
            rowsPerPageOptions={[10]}
            getRowId={(row) => row.userId}
            checkboxSelection
          />
        </Box>

        <Dialog
          open={dialogOpen}
          onClose={handleCloseDialog}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          sx={{
            "& .MuiPaper-root": {
              backgroundColor: theme.palette.background.alt,
              color: theme.palette.secondary[200],
            },
          }}
        >
          <DialogTitle id="alert-dialog-title">
            Confirmar Eliminação
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Ao eliminares este Usuário vais também eliminar a sua assinatura.
              Esta ação é irreversível.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={handleCloseDialog}
              sx={{ color: theme.palette.secondary[100] }}
            >
              Cancelar
            </Button>
            <Button
              onClick={confirmDelete}
              color="secondary"
              autoFocus
              disabled={isDeleting}
            >
              {isDeleting ? "A eliminar..." : "Eliminar"}
            </Button>
          </DialogActions>
        </Dialog>
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbarMessage.includes("Falha") ? "error" : "success"}
            sx={{ width: "100%" }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    </>
  );
};

export default UserDataGrid;
