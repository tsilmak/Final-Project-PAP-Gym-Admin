import React, { useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import {
  useCreatePaymentMutation,
  useGetPaymentsBySignatureIdQuery,
  useGetStatusQuery,
} from "state/api";
import { useNavigate } from "react-router-dom";
import {
  Typography,
  Box,
  MenuItem,
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  DialogContentText,
  DialogContent,
  TextField,
} from "@mui/material";
import { FormatDate } from "components/common/FormatDate";
import { useTheme } from "@emotion/react";
import ErrorOverlay from "components/common/ErrorOverlay";

const PaymentDataGrid = ({
  signatureId,
  id,
  searchQuery,
  handleSnackbarOpen,
  fname,
  lname,
}) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    paymentDate: "",
    paymentAmount: "",
    paymentStatus: "",
    paymentTitle: "",
  });
  const [paymentNegativeError, setPaymentNegativeError] = useState("");

  const { data: paymentData, error: paymentError } =
    useGetPaymentsBySignatureIdQuery(id);
  const { data: paymentStatusData = [] } = useGetStatusQuery();
  console.log(paymentStatusData);
  const [createPayment] = useCreatePaymentMutation();

  console.log(paymentData);
  const filteredData = paymentData?.filter((payment) => {
    const query = searchQuery.toLowerCase();

    return (
      payment.paymentId.toString().includes(query) ||
      FormatDate(payment.date).includes(query) ||
      payment.amount.toString().includes(query) ||
      payment.paymentStatus.paymentStatusName.toLowerCase().includes(query) // Check status
    );
  });

  // DataGrid columns configuration
  const columns = [
    {
      field: "paymentId",
      headerName: "Identificador",
      width: 140,
      renderCell: (params) => (
        <Typography
          color="white"
          sx={{ cursor: "pointer", display: "inline-block" }}
          onClick={() => navigate(`/pagamentos/${params.row.paymentId}`)}
        >
          {params.row.paymentId}
        </Typography>
      ),
    },
    {
      field: "title",
      headerName: "Título",
      renderCell: (params) => params.row.title,
      width: 140,
    },
    {
      field: "date",
      headerName: "Data",
      renderCell: (params) => FormatDate(params.row.date),
      width: 140,
    },
    {
      field: "amount",
      headerName: "Valor",
      width: 110,
      renderCell: (params) => `${params.row.amount} €`,
    },
    {
      field: "status",
      headerName: "Estado Atual",
      width: 140,
      renderCell: (params) => params.row.paymentStatus.paymentStatusName,
    },
    {
      field: "action",
      headerName: "Rever",
      width: 100,
      renderCell: (params) => (
        <Typography
          color="secondary"
          sx={{
            cursor: "pointer",
            display: "inline-block",
            "&:hover": {
              boxShadow: "4px 4px 8px rgba(0, 0, 0, 0.2)",
            },
          }}
          onClick={() => navigate(`/pagamentos/${params.row.paymentId}`)}
        >
          Rever
        </Typography>
      ),
    },
  ];

  const handleClickOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const isPaymentNegative = (payment) => payment < 0;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "paymentAmount" && isPaymentNegative(Number(value))) {
      setPaymentNegativeError("O valor do pagamento não pode ser negativo.");
    } else {
      setPaymentNegativeError("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const paymentDate = new Date(formData.paymentDate);

      const response = await createPayment({
        signatureId: signatureId,
        date: paymentDate.toISOString(),
        amount: Number(formData.paymentAmount),
        paymentStatusId: Number(formData.paymentStatus),
        title: formData.paymentTitle,
      }).unwrap();

      if (response) {
        handleClose();
        handleSnackbarOpen("O Pagamento foi criado com sucesso!");
        setFormData({
          paymentDate: "",
          paymentAmount: "",
          paymentStatus: "",
          paymentTitle: "",
        });
      }
    } catch (error) {
      console.error("Error creating payment:", error);
      handleSnackbarOpen(
        "Ocorreu um erro ao adicionar este pagamento.",
        "error"
      );
    }
  };

  return (
    <>
      {paymentError ? (
        <Box
          sx={{
            height: "calc(100vh - 379px)",
            width: "70%",
          }}
        >
          <ErrorOverlay
            error={paymentError}
            dataName={"Pagamentos associados a esta assinatura"}
          />
        </Box>
      ) : (
        <Box sx={{ height: "calc(100vh - 379px)", width: "70%" }}>
          <DataGrid
            rows={filteredData || []}
            columns={columns}
            getRowId={(row) => row.paymentId}
            pageSize={5}
          />
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mt: "1rem",
            }}
          >
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate(-1)}
            >
              Voltar
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleClickOpen}
            >
              Criar um novo Pagamento
            </Button>
          </Box>

          <Dialog
            sx={{
              "& .MuiPaper-root": {
                backgroundColor: theme.palette.background.alt,
                color: theme.palette.secondary[200],
              },
            }}
            open={open}
            onClose={handleClose}
            PaperProps={{ component: "form", onSubmit: handleSubmit }}
          >
            <DialogTitle>Adicionar Pagamento</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Estás a adicionar um pagamento a:{" "}
                {`${fname || "N/A"} ${lname || "N/A"}`}
              </DialogContentText>
              <TextField
                label="Título do pagamento"
                name="paymentTitle"
                value={formData.paymentTitle}
                onChange={handleChange}
                margin="normal"
                type="text"
                required
                sx={{ width: "100%", mt: "1.5rem" }}
              />
              <TextField
                label="Valor do Pagamento €"
                name="paymentAmount"
                value={formData.paymentAmount}
                onChange={handleChange}
                margin="normal"
                type="number"
                required
                sx={{ width: "100%", mt: "1.5rem" }}
              />
              {paymentNegativeError && (
                <Typography color="error" variant="body2">
                  {paymentNegativeError}
                </Typography>
              )}
              <TextField
                label="Data do Pagamento"
                name="paymentDate"
                type="date"
                value={formData.paymentDate}
                onChange={handleChange}
                margin="normal"
                required
                sx={{ width: "100%" }}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                select
                label="Estado do Pagamento"
                name="paymentStatus"
                value={formData.paymentStatus}
                onChange={handleChange}
                margin="normal"
                required
                sx={{ width: "100%" }}
              >
                {paymentStatusData.map((status) => (
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
                onClick={handleClose}
                sx={{ color: theme.palette.secondary[100] }}
              >
                Cancelar
              </Button>
              <Button color="secondary" type="submit">
                Guardar
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      )}
    </>
  );
};

export default PaymentDataGrid;
