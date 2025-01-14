import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  CardActions,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  MenuItem,
  Switch,
  FormControlLabel,
  Snackbar,
  Alert,
} from "@mui/material";
import Header from "components/common/Header";
import { useTheme } from "@emotion/react";
import { useParams } from "react-router-dom";
import {
  useGetSignatureByIdQuery,
  useGetGymPlanQuery,
  useUpdateSignatureMutation,
  useGetUserQuery,
} from "state/api";
import PaymentDataGrid from "./PaymentDataGrid";
import { FormatDate } from "components/common/FormatDate";
import { ProfilePicture } from "components/common/ProfilePicture";
import EditIcon from "@mui/icons-material/Edit";
import SearchBar from "../../../components/common/SearchBar";
import Loading from "components/common/Loading";
import ErrorOverlay from "components/common/ErrorOverlay";

const SignatureByIdPage = () => {
  const { id } = useParams();
  const {
    data: signatureData,
    isLoading: signatureLoading,
    refetch,
  } = useGetSignatureByIdQuery(id);

  const {
    data: userData,
    error: userError,
    isLoading: userLoading,
  } = useGetUserQuery(signatureData?.data.userId);

  const { data: gymPlans } = useGetGymPlanQuery();
  const [updateSignature] = useUpdateSignatureMutation();
  const theme = useTheme();

  const [formData, setFormData] = useState({
    gymPlanId: "",
    gymPlanFeatures: "",
    gymPlanPrice: "",
    signatureStartDate: "",
    signatureEndDate: "",
    isActive: false,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [dateError, setDateError] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  //EDITING SIGNATURE
  useEffect(() => {
    if (signatureData) {
      setFormData({
        gymPlanId: signatureData.data.gymPlanId || "",
        gymPlanFeatures: (signatureData.data.gymPlan.features || [])
          .map((featureObj) => featureObj.feature)
          .join(", "),
        gymPlanPrice: signatureData.data.gymPlan.price || "",
        signatureStartDate: signatureData.data.startDate || "",
        signatureEndDate: signatureData.data.endDate || "",
        isActive: signatureData.data.isActive || false,
      });
      if (gymPlans) {
        const selectedPlan =
          Array.isArray(gymPlans?.data) &&
          gymPlans?.data.find(
            (plan) => plan.gymPlanId === signatureData.data.gymPlanId
          );
        setGymPlanName(selectedPlan?.name || "");
      }
    }
  }, [signatureData, gymPlans]);

  const formatDateToYYYYMMDD = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const validateDates = (startDate, endDate) => {
    if (startDate && endDate) {
      return new Date(endDate) >= new Date(startDate);
    }
    return true;
  };

  const [gymPlanName, setGymPlanName] = useState("");

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    const newValue = type === "checkbox" ? checked : value;

    const updateFormData = (updatedFields) => {
      setFormData((prevData) => ({
        ...prevData,
        ...updatedFields,
      }));
    };
    if (name === "gymPlanId") {
      const selectedPlan = gymPlans?.data.find(
        (plan) => plan.gymPlanId === value
      );

      if (selectedPlan) {
        updateFormData({
          gymPlanId: value,
          gymPlanFeatures: selectedPlan.features
            .map((featureObj) => featureObj.feature)
            .join(", "),
          gymPlanPrice: selectedPlan.price,
        });

        setGymPlanName(selectedPlan.name);
      } else {
        updateFormData({
          gymPlanId: "",
          gymPlanFeatures: "",
          gymPlanPrice: "",
        });
        setGymPlanName("");
      }
      return;
    }

    if (name === "signatureEndDate") {
      const isValid = validateDates(formData.signatureStartDate, value);
      if (isValid) {
        updateFormData({ [name]: value });
        setDateError("");
      } else {
        setDateError("A data de fim não pode ser anterior à data de início."); // Show error message
      }
      return;
    }

    updateFormData({ [name]: newValue });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!dateError) {
      try {
        const startDateISO = formData.signatureStartDate
          ? new Date(formData.signatureStartDate).toISOString()
          : null;
        const endDateISO = formData.signatureEndDate
          ? new Date(formData.signatureEndDate).toISOString()
          : null;

        await updateSignature({
          id,
          gymPlanId: formData.gymPlanId,
          startDate: startDateISO,
          endDate: endDateISO || null,
          isActive: formData.isActive,
          userId: userData.userId,
        }).unwrap();

        handleClose();
        handleSnackbarOpen("A assinatura foi atualizada com sucesso!");

        refetch();
      } catch (error) {
        handleSnackbarOpen(
          "Ocorreu um erro ao atualizar a assinatura.",
          "error"
        );
      }
    }
  };

  const handleSnackbarOpen = (message, severity = "success") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  if (signatureLoading || userLoading) return <Loading />;
  if (!userData)
    return (
      <ErrorOverlay
        dataName={"Dados do utilizador"}
        error={{
          status: 404,
          data: {
            message:
              "Assinatura não encontrada, verifique se o ID está correto. -> " +
              id,
          },
        }}
      />
    );

  return (
    <>
      <Header
        title="Assinatura Individual"
        subtitle={`Identificador único desta assinatura -> ${id}`}
      />

      <SearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        width="63%"
      />

      <Box sx={{ px: "5rem", display: "flex" }}>
        <PaymentDataGrid
          id={id}
          signatureId={id}
          searchQuery={searchQuery}
          handleSnackbarOpen={handleSnackbarOpen}
          fname={userData.fname}
          lname={userData.lname}
        />

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            ml: "5rem",
            mt: "-4rem",
          }}
        >
          <ProfilePicture
            src={userData?.profilePictureUrl}
            name={`${userData?.fname} ${userData?.lname}`}
            membershipNumber={userData?.membershipNumber}
            role={userData?.role.rolesName}
            clientId={userData?._id}
          />

          <Dialog
            sx={{
              "& .MuiPaper-root": {
                backgroundColor: theme.palette.background.alt,
                color: theme.palette.secondary[200],
              },
            }}
            open={open}
            onClose={handleClose}
            PaperProps={{
              component: "form",
              onSubmit: handleSubmit,
            }}
          >
            <DialogTitle>Editar Assinatura</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Estás a editar a assinatura de{" "}
                {`${userData.fname} ${userData.lname}`}
              </DialogContentText>
              <TextField
                select
                label="Plano de Ginásio"
                name="gymPlanId"
                value={formData.gymPlanId}
                onChange={handleChange}
                margin="normal"
                required
                sx={{ width: "100%", mt: "1.5rem" }}
              >
                {Array.isArray(gymPlans?.data) &&
                  gymPlans?.data.map((gymPlan) => (
                    <MenuItem key={gymPlan.gymPlanId} value={gymPlan.gymPlanId}>
                      {gymPlan.name}
                    </MenuItem>
                  ))}
              </TextField>

              <TextField
                label="Descrição do Plano"
                name="gymPlanFeatures"
                value={formData.gymPlanFeatures}
                margin="normal"
                multiline
                rows={5}
                sx={{ width: "100%" }}
                disabled
              />

              <TextField
                label="Data de Inicio da Assinatura"
                name="signatureStartDate"
                type="date"
                value={formatDateToYYYYMMDD(formData.signatureStartDate)}
                onChange={handleChange}
                margin="normal"
                required
                sx={{ width: "100%" }}
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                label="Data de Fim da Assinatura (caso aplicável)"
                name="signatureEndDate"
                type="date"
                value={formatDateToYYYYMMDD(formData.signatureEndDate) || ""}
                onChange={handleChange}
                margin="normal"
                sx={{ width: "100%" }}
                InputLabelProps={{ shrink: true }}
              />
              {dateError && (
                <Typography color="error" variant="body2">
                  {dateError}
                </Typography>
              )}
              <TextField
                disabled
                label="Preço"
                name="gymPlanPrice"
                value={`${formData.gymPlanPrice} € /mês (Debitado após 30 dias desde o inicio da inscrição)`}
                margin="normal"
                sx={{ width: "100%" }}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={handleChange}
                    name="isActive"
                    color="secondary"
                  />
                }
                label={formData.isActive ? "Ativa" : "Inativa"}
                sx={{ mt: 2 }}
              />
              <Button
                variant="outlined"
                color="warning"
                onClick={() =>
                  setFormData((prevData) => ({
                    ...prevData,
                    signatureEndDate: undefined,
                  }))
                }
                sx={{ mt: 2 }}
              >
                Limpar Data de Fim
              </Button>
            </DialogContent>

            <DialogActions>
              <Button
                sx={{ color: theme.palette.secondary[100] }}
                onClick={handleClose}
              >
                Cancelar
              </Button>
              <Button color="secondary" type="submit">
                Guardar
              </Button>
            </DialogActions>
          </Dialog>

          {/* GYM SIGNATURE CARD */}
          <Card
            variant="outlined"
            sx={{
              width: 300,
              height: 362,
              display: "flex",
              flexDirection: "column",
              boxShadow: 3,
              backgroundColor: theme.palette.background.alt,
              justifyContent: "space-between",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {userError && (
              <ErrorOverlay
                error={userError}
                dataName={"Utilizador"}
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                }}
              />
            )}

            {!userError && (
              <>
                <Box
                  sx={{
                    padding: 2,
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <Chip size="small" label={`Código: ${formData.gymPlanId}`} />
                  <Chip
                    size="small"
                    sx={{ ml: "3rem" }}
                    label={
                      "Estado: " + (formData.isActive ? "Ativo" : "Inativo")
                    }
                  />
                </Box>

                <CardContent
                  sx={{ display: "flex", justifyContent: "space-between" }}
                >
                  <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                    {gymPlanName}{" "}
                  </Typography>
                  <Typography variant="h5">
                    {`${formData.gymPlanPrice}€`}{" "}
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      component="span"
                    >
                      /mês
                    </Typography>
                  </Typography>
                </CardContent>
                <Box>
                  <Box sx={{ p: 2 }}>
                    <Typography variant="h6">{`Inicio da Assinatura:`}</Typography>
                    <Typography variant="h6">{`${FormatDate(
                      formData.signatureStartDate
                    )}`}</Typography>
                  </Box>
                  <Box sx={{ p: 2 }}>
                    <Typography variant="h6">{`Término da Assinatura:`}</Typography>
                    <Typography variant="h6">{`${FormatDate(
                      formData.signatureEndDate
                    )}`}</Typography>
                  </Box>
                </Box>
                <CardActions sx={{ justifyContent: "center", mb: 2 }}>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={handleClickOpen}
                    startIcon={<EditIcon />}
                  >
                    Editar esta Assinatura
                  </Button>
                </CardActions>
              </>
            )}
          </Card>
        </Box>
      </Box>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default SignatureByIdPage;
