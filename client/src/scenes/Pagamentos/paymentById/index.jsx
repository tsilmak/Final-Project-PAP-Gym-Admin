import React, { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  MenuItem,
  Snackbar,
  TextField,
} from "@mui/material";
import Header from "components/common/Header";
import { ProfilePicture } from "components/common/ProfilePicture";
import { useTheme } from "@mui/material/styles";
import EditIcon from "@mui/icons-material/Edit";

import {
  useDeletePaymentMutation,
  useGetPaymentByIdQuery,
  useGetStatusQuery,
  useUpdatePaymentMutation,
} from "state/api";
import { useParams, useNavigate } from "react-router-dom";
import DeleteIcon from "@mui/icons-material/Delete";
import Loading from "components/common/Loading";
import { DataGrid } from "@mui/x-data-grid";
import ErrorOverlay from "components/common/ErrorOverlay";

const PaymentById = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const theme = useTheme();

  // API hooks
  const {
    data: paymentData,
    error: paymentError,
    isLoading: paymentIsLoading,
  } = useGetPaymentByIdQuery(id);
  const { data: paymentsStatus = [] } = useGetStatusQuery();

  const [deletePayment, { isLoading: isDeleting, error: deleteError }] =
    useDeletePaymentMutation();
  const [updatePayment] = useUpdatePaymentMutation();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [paymentIdToDelete, setPaymentIdToDelete] = useState(null);
  const [editedPayment, setEditedPayment] = useState({
    date: "",
    amount: "",
    status: "",
    title: "",
  });

  if (paymentIsLoading) return <Loading />;
  if (paymentError)
    return (
      <ErrorOverlay error={paymentError} dataName={"Pagamento especifico"} />
    );

  // Set up the columns for the DataGrid
  const columns = [
    {
      field: "paymentId",
      headerName: "Identificador",
      flex: 2,
      renderCell: () => id,
    },
    {
      field: "title",
      headerName: "Título",
      flex: 2,
      renderCell: (params) => params.row.title,
    },
    {
      field: "date",
      headerName: "Data e hora",
      renderCell: (params) => params.row.date,
      flex: 2,
    },
    {
      field: "amount",
      headerName: "Valor",
      flex: 2,
      renderCell: (params) => `${params.row.amount} €`,
    },
    {
      field: "status",
      headerName: "Estado Atual",
      flex: 2,
      renderCell: (params) => params.row.status,
    },
    {
      field: "edit",
      headerName: "Editar",
      flex: 1,
      renderCell: (params) => (
        <IconButton
          color="secondary"
          aria-label="edit"
          onClick={() => handleEdit(params.row)}
        >
          <EditIcon />
        </IconButton>
      ),
    },
    {
      field: "delete",
      headerName: "Eliminar",
      flex: 1,
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

  const rows = paymentData
    ? [
        {
          id: paymentData.paymentId,
          title: paymentData.title,
          date: paymentData.date,
          amount: paymentData.amount,
          status: paymentData.paymentStatus.paymentStatusName,
          paymentStatusId: paymentData.paymentStatusId,
        },
      ]
    : [];

  const handleDelete = (payment) => {
    setPaymentIdToDelete(paymentData.paymentId);
    setDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      deletePayment(paymentIdToDelete).unwrap();
      navigate(-1);
      setSnackbarOpen(true);
    } catch (err) {
      setSnackbarMessage("Falha ao eliminar o Pagamento." + deleteError);
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
    setPaymentIdToDelete(null);
  };

  // Handle edit action
  const handleEdit = (payment) => {
    setEditedPayment({
      title: paymentData.title,
      date: payment.date,
      amount: payment.amount,
      status: payment.paymentStatusId,
    });
    setEditDialogOpen(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditedPayment({ ...editedPayment, [name]: value });
  };
  console.log("PYAMENT DATA", paymentData);
  const confirmEdit = async () => {
    try {
      await updatePayment({
        id: paymentData.paymentId,
        signatureId: paymentData.signature.signatureId,
        ...editedPayment,
      }).unwrap();
      setSnackbarMessage("Pagamento atualizado com sucesso.");
      setSnackbarSeverity("success");
      //Debug
      setSnackbarOpen(true);
    } catch (err) {
      setSnackbarMessage("Falha ao atualizar o Pagamento.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      console.error("Update error:", err);
    } finally {
      setEditDialogOpen(false);
    }
  };

  const formatDateToYYYYMMDD = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  return (
    <>
      <Header title="Pagamento individual" subtitle="Revê este pagamento" />
      <ProfilePicture
        src={paymentData.signature.user.profilePictureUrl}
        name={
          paymentData.signature.user.fname +
          " " +
          paymentData.signature.user.lname
        }
        membershipNumber={paymentData.signature.user.membershipNumber}
        role={paymentData.signature.user.role.rolesName}
        clientId={paymentData.signature.user.userId}
      />
      <Box sx={{ height: 200, mx: "5rem" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          sx={{
            backgroundColor: theme.palette.background.alt,
            borderRadius: "15px",
            boxShadow: theme.shadows[1],
          }}
        />
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate(-1)}
            sx={{ mt: "1rem" }}
          >
            Voltar
          </Button>
        </Box>
      </Box>

      {/* Edit Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        aria-labelledby="edit-dialog-title"
        aria-describedby="edit-dialog-description"
        sx={{
          "& .MuiPaper-root": {
            backgroundColor: theme.palette.background.alt,
            color: theme.palette.secondary[200],
          },
        }}
      >
        <DialogTitle id="edit-dialog-title">Editar Pagamento</DialogTitle>
        <DialogContent>
          <DialogContentText id="edit-dialog-description">
            Edita os detalhes deste pagamento.
          </DialogContentText>
          <TextField
            margin="dense"
            name="title"
            label="Título"
            type="text"
            fullWidth
            variant="outlined"
            value={editedPayment.title}
            onChange={handleEditChange}
          />
          <TextField
            autoFocus
            margin="dense"
            name="date"
            label="Data"
            type="date"
            fullWidth
            variant="outlined"
            value={formatDateToYYYYMMDD(editedPayment.date)}
            onChange={handleEditChange}
          />
          <TextField
            margin="dense"
            name="amount"
            label="Valor €"
            type="number"
            fullWidth
            variant="outlined"
            value={editedPayment.amount}
            onChange={handleEditChange}
          />
          <TextField
            select
            margin="dense"
            name="status"
            label="Estado"
            fullWidth
            variant="outlined"
            value={editedPayment.status} // This should be the paymentStatusId
            onChange={handleEditChange}
          >
            {paymentsStatus.map((status) => (
              <MenuItem
                key={status.paymentStatusId}
                value={status.paymentStatusId}
              >
                {status.paymentStatusName}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setEditDialogOpen(false)}
            sx={{ color: theme.palette.secondary[100] }}
          >
            Cancelar
          </Button>
          <Button onClick={confirmEdit} color="secondary" autoFocus>
            {isDeleting ? "A atualizar..." : "Atualizar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
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
          {"Eliminar Pagamento?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Tens certeza que desejas eliminar este pagamento permanentemente?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseDialog}
            sx={{ color: theme.palette.secondary[100] }}
          >
            Cancelar
          </Button>
          <Button onClick={confirmDelete} color="secondary" autoFocus>
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
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default PaymentById;
