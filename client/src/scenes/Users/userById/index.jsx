import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  MenuItem,
  Typography,
  Button,
  Grid,
  Snackbar,
  Alert,
  Card,
  Chip,
  CardActions,
  CardContent,
} from "@mui/material";
import Header from "components/common/Header";
import { useParams, useNavigate } from "react-router-dom";
import {
  useGetUserQuery,
  useGetRolesQuery,
  useUpdateUserMutation,
} from "state/api.js";
import PhoneInput from "react-phone-input-2";
import { GraphQLClient, gql } from "graphql-request";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { useTheme } from "@emotion/react";
import { FormatDate } from "components/common/FormatDate";
import { ProfilePicture } from "components/common/ProfilePicture";
import Loading from "components/common/Loading";
import ErrorOverlay from "components/common/ErrorOverlay";

// !THIS COMPONENT DOESN'T HAS ANY VALIDATION
const UserProfile = () => {
  const theme = useTheme();
  const { userId } = useParams();
  const {
    data: userData,
    error: userError,
    isLoading: userLoading,
  } = useGetUserQuery(userId);
  const navigate = useNavigate();
  const handleNavigate = (signatureId) => {
    navigate(`/assinaturas/${signatureId}`);
  };
  const picturePublicId = userData?.picturePublicId;
  console.log("ProfilePictureId from userbtid", picturePublicId);

  const [updateUser] = useUpdateUserMutation();
  const { data: roles = [] } = useGetRolesQuery();
  const [formData, setFormData] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [countries, setCountries] = useState([]);
  const [, setZipcode] = useState("");
  const [cityError, setCityError] = useState("");

  const handleZipcodeBlur = async () => {
    try {
      const response = await fetch(
        `https://api.zippopotam.us/${formData.country}/${formData.zipcode}`
      );
      if (response.ok) {
        const data = await response.json();
        setFormData((prevFormData) => ({
          ...prevFormData,
          city: data.places[0]["place name"],
        }));
        setCityError("");
      } else {
        setFormData((prevFormData) => ({ ...prevFormData, city: "" }));
        setCityError("Código postal inválido");
      }
    } catch (error) {
      console.error("Failed to fetch city data:", error);
      setCityError("Erro ao verificar o código postal");
    }
  };

  const handleZipcodeChange = (event) => {
    const zipcodeValue = event.target.value;
    setZipcode(zipcodeValue);
    setFormData((prevFormData) => ({ ...prevFormData, zipcode: zipcodeValue }));
  };

  useEffect(() => {
    const client = new GraphQLClient("https://countries.trevorblades.com/");
    const FETCH_COUNTRIES_QUERY = gql`
      {
        countries {
          code
          name
          continent {
            name
          }
        }
      }
    `;
    const fetchCountries = async () => {
      try {
        const data = await client.request(FETCH_COUNTRIES_QUERY);
        const europeanCountries = data.countries.map((country) => ({
          code: country.code.toLowerCase(),
          name: country.name,
        }));
        europeanCountries.sort((a, b) => a.name.localeCompare(b.name));
        setCountries(europeanCountries);
      } catch (error) {
        console.error("Error fetching countries:", error);
      }
    };

    fetchCountries();
  }, []);
  useEffect(() => {
    if (userData) {
      const initialFormData = {
        userId: userData.userId,
        membershipNumber: userData.membershipNumber,
        fname: userData.fname,
        lname: userData.lname,
        gender: userData.gender,
        email: userData.email,
        phoneNumber: userData.phoneNumber,
        birthDate: new Date(userData.birthDate).toISOString().split("T")[0],
        docType: userData.docType,
        docNumber: userData.docNumber,
        nif: userData.nif,
        address: userData.address,
        address2: userData.address2,
        country: userData.country,
        zipcode: userData.zipcode,
        city: userData.city,
        role: userData.roleId,
      };
      setFormData(initialFormData);
    }
  }, [userData]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    let updatedFormData = {
      ...formData,
      [name]: value,
    };

    setFormData(updatedFormData);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (cityError) return;
    try {
      const payload = { ...formData };
      await updateUser({ userId, user: payload }).unwrap();
      setSnackbarMessage("Perfil atualizado com sucesso");
      setSnackbarSeverity("success");
      setOpenSnackbar(true);
    } catch (error) {
      console.error("Error details:", error);
      setSnackbarMessage(
        `Ocorreu um erro ao editar o usuário: ${
          error?.data?.message || error?.error || "Erro desconhecido"
        }`
      );
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    }
  };
  console.log(formData);

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  if (userLoading) return <Loading />;
  if (userError) return <ErrorOverlay error={userError} />;

  // ! Não apagar
  if (!formData) return null;

  return (
    <>
      <Header title="Perfil do Cliente" subtitle="Edite as Informações" />

      <Box
        sx={{
          mx: "5rem",
          mx: { xs: "1rem", md: "5rem" },
          height: "calc(100vh - 300px)",
        }}
      >
        <Grid container spacing={14}>
          <Grid item xs={12} md={8}>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Nome"
                    name="fname"
                    value={formData.fname}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Apelido"
                    name="lname"
                    value={formData.lname}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    select
                    label="Role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    fullWidth
                    required
                  >
                    {roles.map((role) => (
                      <MenuItem key={role.rolesId} value={role.rolesId}>
                        {role.rolesName}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    select
                    label="Género"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    fullWidth
                    required
                  >
                    <MenuItem value="Masculino">Masculino</MenuItem>
                    <MenuItem value="Feminino">Feminino</MenuItem>
                    <MenuItem value="PrefiroNaoDivulgar">
                      Prefiro Não Divulgar
                    </MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="Email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <PhoneInput
                    value={formData.phoneNumber}
                    onChange={(phone) =>
                      setFormData((prev) => ({ ...prev, phoneNumber: phone }))
                    }
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Data de Nascimento"
                    name="birthDate"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={formData.birthDate}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    select
                    label="Tipo de Documento"
                    name="docType"
                    value={formData.docType}
                    onChange={handleChange}
                    fullWidth
                    required
                  >
                    <MenuItem value="cc">CC - Cartão de Cidadão</MenuItem>
                    <MenuItem value="bi">BI - Bilhete de Identidade</MenuItem>
                    <MenuItem value="cn">CN - Certidão de Nascimento</MenuItem>
                    <MenuItem value="p">P - Passaporte</MenuItem>
                    <MenuItem value="bim">
                      BIM - Bilhete de Identidade Militar
                    </MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Número do Documento"
                    name="docNumber"
                    value={formData.docNumber}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="NIF"
                    name="nif"
                    value={formData.nif}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Morada"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Morada 2"
                    name="address2"
                    value={formData.address2}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="País"
                    name="country"
                    select
                    value={formData.country}
                    onChange={handleChange}
                    fullWidth
                    required
                  >
                    {countries.map((country) => (
                      <MenuItem key={country.code} value={country.code}>
                        {country.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Código Postal"
                    name="zipcode"
                    value={formData.zipcode}
                    onChange={handleZipcodeChange}
                    onBlur={handleZipcodeBlur}
                    fullWidth
                    required
                  />
                  {cityError && (
                    <Typography color="error">{cityError}</Typography>
                  )}
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Cidade"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    fullWidth
                    required
                    disabled
                  />
                </Grid>
              </Grid>
              <Grid
                item
                xs={12}
                md={6}
                sx={{
                  mt: 5,
                }}
              >
                <Button type="submit" variant="contained" color="secondary">
                  Guardar
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => navigate(-1)}
                  style={{ marginLeft: "10px" }}
                >
                  Voltar
                </Button>
              </Grid>
            </form>
          </Grid>
          <Grid item xs={12} md={4}>
            <ProfilePicture
              isEditable={true}
              src={userData.profilePictureUrl}
              alt="Foto de Perfil"
              name={`${formData.fname} ${formData.lname}`}
              membershipNumber={formData.membershipNumber}
              role={userData.role.rolesName}
              picturePublicId={picturePublicId}
              handleChange={handleChange}
            />

            <Grid container justifyContent="center">
              {userData.signatures && userData.signatures.length > 0 ? (
                userData.signatures.map((signature) => (
                  <Card
                    key={signature.signatureId}
                    variant="outlined"
                    sx={{
                      width: 350,
                      height: 350,
                      flexDirection: "column",
                      boxShadow: 3,
                      backgroundColor: theme.palette.background.alt,
                    }}
                  >
                    <Box
                      sx={{
                        padding: 2,
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <Chip
                        size="small"
                        label={`Código: ${signature.gymPlan.gymPlanId}`}
                      />
                      <Chip
                        size="small"
                        label={
                          "Estado: " +
                          (signature.isActive ? "Ativo" : "Inativo")
                        }
                      />
                    </Box>
                    <CardContent
                      sx={{ display: "flex", justifyContent: "space-between" }}
                    >
                      <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                        {signature.gymPlan.name}
                      </Typography>
                      <Typography variant="h5">
                        {`${signature.gymPlan.price}€`}
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
                          signature.startDate
                        )}`}</Typography>
                      </Box>
                      <Box sx={{ p: 2 }}>
                        <Typography variant="h6">{`Término da Assinatura:`}</Typography>
                        <Typography variant="h6">{`${FormatDate(
                          signature.endDate
                        )}`}</Typography>
                      </Box>
                    </Box>
                    <CardActions sx={{ justifyContent: "center" }}>
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => handleNavigate(signature.signatureId)}
                        endIcon={<NavigateNextIcon />}
                      >
                        Assinatura do cliente
                      </Button>
                    </CardActions>
                  </Card>
                ))
              ) : (
                <Box>Sem Assinatura</Box>
              )}
            </Grid>
          </Grid>
        </Grid>
      </Box>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default UserProfile;
