import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  MenuItem,
  Alert,
  Typography,
  Checkbox,
  FormControlLabel,
  Stack,
  useMediaQuery,
  CircularProgress,
} from "@mui/material";
import Header from "../../../components/common/Header";
import {
  useGetGymPlanQuery,
  useCreateUserMutation,
  useGetRolesQuery,
} from "../../../state/api";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/material.css";
import { useTheme } from "@emotion/react";
import { validatePhoneNumber } from "components/common/PhoneValidator";
import Loading from "components/common/Loading";
import ErrorOverlay from "components/common/ErrorOverlay";
import { useForm } from "react-hook-form";

const RegisterCustomer = () => {
  const theme = useTheme();
  const isSmallerThanLarge = useMediaQuery(theme.breakpoints.down("lg"));
  const [countryData, setCountryData] = useState([]);
  const [phoneErrors, setPhoneErrors] = useState("");
  const [cityError, setCityError] = useState("");
  const [message, setMessage] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [checkBoxChecked, setCheckBoxChecked] = useState(false);

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    clearErrors,
    trigger,
    getValues,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      fname: "",
      lname: "",
      email: "",
      phoneNumber: "",
      gender: "",
      birthDate: "",
      docType: "",
      docNumber: "",
      nif: "",
      countryNif: "",
      address: "",
      address2: "",
      zipcode: "",
      city: "",
      country: "",
      gymPlanId: "",
      role: 1,
    },
  });

  const {
    data: gymPlans = [],
    isLoading: isLoadingGymPlans,
    error: errorGymPlans,
  } = useGetGymPlanQuery();

  const {
    data: roles = [],
    isLoading: isLoadingRoles,
    error: errorRoles,
  } = useGetRolesQuery();

  const handlePhoneNumberChange = (value) => {
    setPhoneNumber(value);
    const isPhoneNumberValid = validatePhoneNumber("+" + value);
    setPhoneErrors(isPhoneNumberValid ? "" : "Número de telemóvel inválido");
  };

  const handleZipcodeBlur = async () => {
    const country = watch("country");
    const zipcodeValue = watch("zipcode");

    try {
      const response = await fetch(
        `https://api.zippopotam.us/${country}/${zipcodeValue}`
      );
      if (response.ok) {
        const data = await response.json();
        setValue("city", data.places[0]["place name"]);
        setCityError("");
      } else {
        setValue("city", "");
        setCityError("Código postal inválido");
      }
    } catch (error) {
      console.error("Failed to fetch city data:", error);
      setCityError("Erro ao verificar o código postal");
    }
  };

  // Fetch countries on first load
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch(
          "https://restcountries.com/v3.1/all?fields=name,tld"
        );
        const data = await response.json();

        // Map the data to extract only tld and name.common
        const countryData = data.map((country) => ({
          tld: country.tld[0]?.replace(".", "") || "", // Extract the first tld and remove "."
          name: country.name.common, // Extract common name
        }));

        // Sort the countries alphabetically by name
        countryData.sort((a, b) => a.name.localeCompare(b.name));

        // Update the state with the fetched data
        setCountryData(countryData);
      } catch (error) {
        console.error("Error fetching countries:", error);
      }
    };

    fetchCountries();
  }, []);

  const fetchCityData = async (countryTld, zipcode) => {
    try {
      // Fetch city data using TLD
      const response = await fetch(
        `https://api.zippopotam.us/${countryTld}/${zipcode}`
      );
      if (response.ok) {
        const data = await response.json();
        setValue("city", data.places[0]["place name"]);
        setCityError(""); // Clear cityError if data is successfully fetched
        clearErrors("city");
      } else {
        setCityError("Código postal inválido");
        setValue("city", "");
        clearErrors("city");
      }
    } catch (error) {
      console.error("Error fetching city data:", error);
      setCityError("Erro ao verificar o código postal");
      setValue("city", "");
      clearErrors("city");
    }
  };

  const handleZipcodeChange = (event) => {
    const zipcodeValue = event.target.value;
    setValue("zipcode", zipcodeValue);
    trigger("zipcode");
  };

  useEffect(() => {
    if (watch("country") && watch("zipcode")) {
      fetchCityData(watch("country"), watch("zipcode"));
    } else {
      setValue("city", "");
      clearErrors("city");
    }
  }, [watch("country"), watch("zipcode")]);

  // Calculate minimum date for birthdate to ensure user is at least 16 years old
  const currentDate = new Date();
  const minDate = new Date(
    currentDate.getFullYear() - 16,
    currentDate.getMonth(),
    currentDate.getDate()
  )
    .toISOString()
    .split("T")[0];

  const handleCheckBoxChecked = (e) => {
    const isChecked = e.target.checked;
    setCheckBoxChecked(isChecked);

    setValue("countryNif", isChecked ? "" : "PT");
    setValue("nif", isChecked ? "" : "");
  };

  const selectedPlanId = watch("gymPlanId");

  useEffect(() => {
    if (!gymPlans?.data) {
      return;
    }

    const selectedPlan = gymPlans.data.find(
      (plan) => plan.gymPlanId === selectedPlanId
    );

    if (!selectedPlan) {
      setValue("gymPlanDescription", "");
      setValue("gymPlanPrice", "");
      return;
    }

    const selectedPlanFeatures = selectedPlan.features
      ?.map((feature) => feature.feature)
      .join(", ");
    const selectedPlanPrice = selectedPlan?.price;

    setValue("gymPlanDescription", selectedPlanFeatures);
    setValue(
      "gymPlanPrice",
      `${selectedPlanPrice} € /mês (Debitado após 30 dias desde o inicio da inscrição)`
    );

    trigger(["gymPlanDescription", "gymPlanPrice"]);
  }, [selectedPlanId, gymPlans, setValue, trigger]);

  const [createUser, { isSuccess, isError, error, isLoading }] =
    useCreateUserMutation();

  useEffect(() => {
    if (isSuccess) {
      setMessage(
        "Registado com sucesso! A password foi enviada para o e-mail informado."
      );
      reset();
    } else if (isError) {
      console.error("Error details:", error);
      setMessage(
        `Ocorreu um erro ao criar o usuário: ${
          error?.data?.message || error?.error || "Erro desconhecido"
        }`
      );
    }
  }, [isSuccess, isError, error]);

  // Submit form
  const handleSubmitForm = async (data) => {
    // Validação do número de telefone
    const isPhoneNumberValid = validatePhoneNumber("+" + phoneNumber);
    if (!isPhoneNumberValid) {
      setMessage("Número de telemóvel inválido");
      return;
    }

    const combinedNif = (
      data.countryNif ? `${data.countryNif}${data.nif}` : data.nif
    ).toUpperCase();

    const finalFormData = Object.fromEntries(
      Object.entries({
        ...data,
        phoneNumber,
        birthDate: new Date(data.birthDate),
        nif: combinedNif,
      }).filter(
        ([key, value]) =>
          value !== "" &&
          key !== "gymPlanPrice" &&
          key !== "gymPlanDescription" &&
          key !== "countryNif"
      ) // Remove campos com valor "" e os campos específicos
    );
    console.log(finalFormData);

    try {
      await createUser(finalFormData).unwrap();
    } catch (err) {
      console.error("Failed to create user:", err);
      setMessage(
        `Ocorreu um erro ao criar o usuário: ${
          err?.response?.data?.message || "Erro desconhecido"
        }`
      );
    }
  };

  if (isLoadingGymPlans || isLoadingRoles) return <Loading />;
  if (errorGymPlans || errorRoles) {
    return (
      <ErrorOverlay
        error={errorGymPlans || errorRoles}
        dataName={
          errorGymPlans && errorRoles
            ? "Planos de ginásio e roles"
            : errorGymPlans
            ? "Planos de ginásio"
            : "roles"
        }
      />
    );
  }

  return (
    <Box>
      <Header
        title="Registo de Cliente"
        subtitle="Preenche o formulário abaixo com os dados do cliente"
      />

      <Box sx={{ mx: { xs: "1rem", md: "5rem" } }}>
        {/* SMALLER SCREENS */}
        {isSmallerThanLarge ? (
          <Box
            component="form"
            onSubmit={handleSubmit(handleSubmitForm)}
            sx={{
              display: "flex",
              flexDirection: "column",
              padding: "1.5rem",
              backgroundColor: "var(--background-alt)",
              borderRadius: "0.55rem",
              boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
            }}
          >
            <Box sx={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {/* Name Fields */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  gap: "1rem",
                }}
              >
                <TextField
                  label="Primeiro Nome"
                  name="fname"
                  {...register("fname", {
                    required: "Primeiro nome é obrigatório",
                    pattern: {
                      value: /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/,
                      message: "Apenas letras são permitidas.",
                    },
                    maxLength: {
                      value: 30,
                      message: "Excedeu o limite de caracteres.",
                    },
                  })}
                  error={!!errors.fname}
                  helperText={errors.fname?.message}
                  margin="normal"
                  maxLength={30}
                  required
                  sx={{ flex: 1 }}
                />
                <TextField
                  label="Último Nome"
                  name="lname"
                  {...register("lname", {
                    required: "Último nome é obrigatório",
                    pattern: {
                      value: /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/,
                      message: "Apenas letras são permitidas.",
                    },
                    maxLength: {
                      value: 30,
                      message: "Excedeu o limite de caracteres.",
                    },
                  })}
                  error={!!errors.lname}
                  helperText={errors.lname?.message}
                  margin="normal"
                  sx={{ flex: 1 }}
                  maxLength={30}
                />
              </Box>
              {/* Email and Phone Number */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  gap: "1rem",
                  marginBottom: "1rem",
                }}
              >
                <TextField
                  label="E-mail"
                  name="email"
                  {...register("email", {
                    required: "E-mail é obrigatório.",
                    maxLength: {
                      value: 100,
                      message: "Excedeu o limite de caracteres.",
                    },
                    pattern: {
                      value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/,
                      message: "Formato de e-mail inválido.",
                    },
                  })}
                  maxLength={100}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  margin="normal"
                  type="email"
                  autoComplete="email"
                  sx={{ flex: 1 }}
                />
              </Box>
              <Box>
                <PhoneInput
                  enableSearch
                  country="pt"
                  onChange={handlePhoneNumberChange}
                  value={phoneNumber}
                  required
                  inputStyle={{
                    color: theme.palette.text.primary,
                  }}
                  containerStyle={{ width: "100%" }}
                />
              </Box>
              {/* Gender and Birth Date */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  gap: "1rem",
                }}
              >
                <TextField
                  select
                  label="Género"
                  name="gender"
                  {...register("gender", {
                    required: "Selecione o género",
                  })}
                  error={!!errors.gender}
                  helperText={errors.gender?.message}
                  margin="normal"
                  defaultValue=""
                  sx={{ flex: 1 }}
                >
                  <MenuItem value="Feminino">Feminino</MenuItem>
                  <MenuItem value="Masculino">Masculino</MenuItem>
                  <MenuItem value="NaoDivulgar">Prefiro Não Divulgar</MenuItem>
                </TextField>
                <TextField
                  label="Data de Nascimento"
                  type="date"
                  {...register("birthDate", {
                    required: "Insira a sua data de nascimento",
                    validate: (value) =>
                      new Date(value) <= new Date(minDate) ||
                      "Data de Nascimento inválida. Necessário ter pelo menos 16 anos.",
                  })}
                  margin="normal"
                  required
                  inputProps={{
                    max: minDate,
                  }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  sx={{ flex: 1 }}
                  error={!!errors.birthDate}
                  helperText={errors.birthDate?.message}
                />
              </Box>

              {/* Document Fields */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  gap: "1rem",
                }}
              >
                <TextField
                  select
                  label="Tipo Documento"
                  name="docType"
                  {...register("docType", {
                    required: "Indica o tipo de documento",
                  })}
                  required
                  margin="normal"
                  sx={{ flex: 1 }}
                  error={!!errors.docType}
                  helperText={errors.docType?.message}
                  defaultValue={""}
                >
                  <MenuItem value="cc">CC - Cartão de Cidadão</MenuItem>
                  <MenuItem value="bi">BI - Bilhete de Identidade</MenuItem>
                  <MenuItem value="cn">CN - Certidão de Nascimento</MenuItem>
                  <MenuItem value="p">P - Passaporte</MenuItem>
                  <MenuItem value="bim">
                    BIM - Bilhete de Identidade Militar
                  </MenuItem>
                </TextField>

                <TextField
                  required
                  label="Número do Documento"
                  name="docNumber"
                  {...register("docNumber", {
                    required: "Indica o número do documento",
                    minLength: {
                      value: 5,
                      message:
                        "Não atende ao número mínimo de caracteres exigido.",
                    },
                    maxLength: {
                      value: 25,
                      message: "Excedeu o limite de caracteres.",
                    },
                  })}
                  margin="normal"
                  sx={{ flex: 1 }}
                  error={!!errors.docNumber}
                  helperText={errors.docNumber?.message}
                />
              </Box>
              {/* NIF Fields */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  gap: "1rem",
                }}
              >
                {checkBoxChecked ? (
                  <>
                    <TextField
                      label="NIF"
                      name="nif"
                      required
                      {...register("nif", {
                        required: "Insira o seu nif",
                        minLength: {
                          value: 5,
                          message:
                            "Não atende ao número mínimo de caracteres exigido.",
                        },
                        maxLength: {
                          value: 20,
                          message: "Excedeu o limite de caracteres.",
                        },
                      })}
                      margin="normal"
                      sx={{ flex: 1 }}
                      error={!!errors.nif}
                      helperText={errors.nif?.message}
                    />
                    <TextField
                      select
                      label="País de origem do NIF"
                      name="countryNif"
                      {...register("countryNif", {
                        required: "Escolha uma opção.",
                      })}
                      required
                      margin="normal"
                      sx={{ flex: 1 }}
                      error={!!errors.countryNif}
                      helperText={errors.countryNif?.message}
                      defaultValue=""
                    >
                      <MenuItem defaultValue="">SS</MenuItem>
                      {countryData.map((countryNif) => (
                        <MenuItem key={countryNif.name} value={countryNif.tld}>
                          {countryNif.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </>
                ) : (
                  <TextField
                    label="NIF"
                    name="nif"
                    required
                    {...register("nif", { required: "Campo obrigatório." })}
                    margin="normal"
                    sx={{ width: "100%" }}
                    error={!!errors.nif}
                    helperText={errors.nif?.message}
                  />
                )}
              </Box>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={checkBoxChecked}
                    onChange={handleCheckBoxChecked}
                  />
                }
                label="NIF Estrangeiro"
              />
              <TextField
                label="Morada"
                name="address"
                required
                {...register("address", {
                  required: "Insira a sua morada",
                  minLength: {
                    value: 5,
                    message:
                      "Não atende ao número mínimo de caracteres exigido.",
                  },
                  maxLength: {
                    value: 255,
                    message: "Excedeu o limite de caracteres.",
                  },
                })}
                margin="normal"
                autoComplete="address"
                sx={{ width: "100%" }}
                error={!!errors.address}
                helperText={errors.address?.message}
              />
              <TextField
                label="Morada 2"
                name="address2"
                {...register("address2", {
                  maxLength: {
                    value: 255,
                    message: "Excedeu o limite de caracteres.",
                  },
                })}
                margin="normal"
                autoComplete="address2"
                sx={{ width: "100%" }}
              />
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  gap: "1rem",
                }}
              >
                <TextField
                  select
                  label="País"
                  name="country"
                  required
                  {...register("country", { required: "Escolha uma opção" })}
                  margin="normal"
                  autoComplete="country"
                  sx={{ flex: 1 }}
                  error={!!errors.country}
                  helperText={errors.country?.message}
                  defaultValue={""}
                >
                  {countryData.map((country) => (
                    <MenuItem key={country.name} value={country.tld}>
                      {country.name}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  label="Código Postal"
                  name="zipcode"
                  required
                  {...register("zipcode", {
                    required: "Informe o seu código postal",
                    maxLength: {
                      value: 12,
                      message: "Excedeu o limite de caracteres.",
                    },
                  })}
                  onChange={handleZipcodeChange}
                  onBlur={handleZipcodeBlur}
                  margin="normal"
                  sx={{ flex: 1 }}
                  error={!!errors.zipcode}
                  helperText={errors.zipcode?.message}
                />

                <TextField
                  label="Cidade"
                  name="city"
                  disabled
                  {...register("city", {
                    required: getValues("city")
                      ? false
                      : "Cidade é obrigatória",
                  })}
                  value={getValues("city") || ""}
                  margin="normal"
                  sx={{ flex: 1 }}
                  error={!!errors.city}
                  helperText={errors.city?.message}
                  slotProps={{
                    inputLabel: {
                      shrink: true,
                    },
                  }}
                />
              </Box>
              {cityError && <Typography color="error">{cityError}</Typography>}
              <TextField
                select
                label="Função"
                name="role"
                {...register("role", { required: "Campo obrigatório." })}
                error={!!errors.role}
                helperText={errors.role?.message}
                margin="normal"
                required
                defaultValue={1}
                sx={{ flex: 1 }}
              >
                {roles.map((role) => (
                  <MenuItem key={role.rolesId} value={role.rolesId}>
                    {role.rolesName}
                  </MenuItem>
                ))}
              </TextField>
              {/* START OF SIGNATURE INFORMATION */}
              {watch("role") === 1 ? (
                <>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      marginBottom: "1rem",
                      gap: "1rem",
                    }}
                  >
                    <TextField
                      select
                      label="Plano de Ginásio"
                      name="gymPlanId"
                      {...register("gymPlanId", {
                        required: "Escolha uma opção.",
                      })}
                      error={!!errors.gymPlanId}
                      helperText={errors.gymPlanId?.message}
                      margin="normal"
                      required
                      defaultValue={""}
                      sx={{ flex: 1 }}
                    >
                      {Array.isArray(gymPlans?.data) &&
                        gymPlans?.data
                          .filter((gymPlan, index) => index !== 0)
                          .map((gymPlan) => (
                            <MenuItem
                              key={gymPlan.gymPlanId}
                              value={gymPlan.gymPlanId}
                            >
                              {gymPlan.name}
                            </MenuItem>
                          ))}
                    </TextField>
                    <TextField
                      label="Descrição do Plano"
                      name="gymPlanDescription"
                      value={getValues("gymPlanDescription") || ""}
                      margin="normal"
                      multiline
                      rows={5}
                      sx={{ width: "100%" }}
                      slotProps={{
                        inputLabel: { shrink: true },
                      }}
                      disabled
                    />
                  </Box>
                  <TextField
                    disabled
                    name="gymPlanPrice"
                    value={getValues("gymPlanPrice") || ""}
                    slotProps={{
                      inputLabel: { shrink: true },
                    }}
                    margin="normal"
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    label="Data de início da Assinatura"
                    name="signatureStartDate"
                    type="date"
                    {...register("signatureStartDate", {
                      required: "Informe uma data",
                    })}
                    error={!!errors.signatureStartDate}
                    helperText={errors.signatureStartDate?.message}
                    margin="normal"
                    required
                    sx={{ width: "100%" }}
                    slotProps={{
                      inputLabel: { shrink: true },
                    }}
                  />
                  <TextField
                    label="Data de Fim da Assinatura (caso aplicável)"
                    name="signatureEndDate"
                    type="date"
                    {...register("signatureEndDate")}
                    margin="normal"
                    sx={{ flex: 1 }}
                    slotProps={{
                      inputLabel: { shrink: true },
                    }}
                  />
                  <TextField
                    label="Jóia de Inscirção"
                    name="registrationFee"
                    slotProps={{
                      inputLabel: { shrink: true },
                    }}
                    {...register("registrationFee", {
                      required: "Informe um valor ou 0",
                      validate: (value) =>
                        parseFloat(value) >= 0 ||
                        "O valor não pode ser negativo",
                    })}
                    min="0"
                    error={!!errors.registrationFee}
                    helperText={errors.registrationFee?.message}
                    required
                    margin="normal"
                    sx={{ flex: 1 }}
                  />
                  <Stack spacing={2}>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                        <Button
                          type="submit"
                          variant="contained"
                          color="secondary"
                          sx={{ mt: "0.5rem", height: "2.75rem" }}
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <CircularProgress size={24} color="inherit" />
                          ) : (
                            "Registar Cliente"
                          )}
                        </Button>
                      </Box>
                      <Box sx={{ width: "100%", mt: "0.5rem" }}>
                        {message && (
                          <Alert
                            sx={{ width: "100%" }}
                            severity={isSuccess ? "success" : "error"}
                          >
                            {message}
                          </Alert>
                        )}
                      </Box>
                    </Box>
                  </Stack>
                </>
              ) : (
                <Stack spacing={2}>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                      <Button
                        type="submit"
                        variant="contained"
                        color="secondary"
                        sx={{ mt: "0.5rem", height: "2.75rem" }}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <CircularProgress size={24} color="inherit" />
                        ) : (
                          "Registar Funcionário"
                        )}
                      </Button>
                    </Box>
                    <Box sx={{ width: "100%", mt: "0.5rem" }}>
                      {message && (
                        <Alert
                          sx={{ width: "100%" }}
                          severity={isSuccess ? "success" : "error"}
                        >
                          {message}
                        </Alert>
                      )}
                    </Box>
                  </Box>
                </Stack>
              )}
            </Box>
          </Box>
        ) : (
          <Box
            component="form"
            onSubmit={handleSubmit(handleSubmitForm)}
            sx={{
              display: "flex",
              padding: "1.5rem",
              backgroundColor: "var(--background-alt)",
              borderRadius: "0.55rem",
              boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
            }}
          >
            <Box sx={{ width: "50%" }}>
              <Box sx={{ display: "flex", gap: "1rem" }}>
                <TextField
                  label="Primeiro Nome"
                  name="fname"
                  {...register("fname", {
                    required: "Primeiro nome é obrigatório",
                    pattern: {
                      value: /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/,
                      message: "Apenas letras são permitidas.",
                    },
                    maxLength: {
                      value: 30,
                      message: "Excedeu o limite de caracteres.",
                    },
                  })}
                  error={!!errors.fname}
                  helperText={errors.fname?.message}
                  margin="normal"
                  required
                  sx={{ width: "50%" }}
                />
                <TextField
                  label="Último Nome"
                  name="lname"
                  {...register("lname", {
                    required: "Último nome é obrigatório",
                    pattern: {
                      value: /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/,
                      message: "Apenas letras são permitidas.",
                    },
                    maxLength: {
                      value: 30,
                      message: "Excedeu o limite de caracteres.",
                    },
                  })}
                  error={!!errors.lname}
                  helperText={errors.lname?.message}
                  margin="normal"
                  required
                  sx={{ width: "50%" }}
                />
              </Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                }}
              >
                <TextField
                  label="E-mail"
                  name="email"
                  {...register("email", {
                    required: "E-mail é obrigatório.",
                    maxLength: {
                      value: 100,
                      message: "Excedeu o limite de caracteres.",
                    },
                    pattern: {
                      value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/,
                      message: "Formato de e-mail inválido.",
                    },
                  })}
                  maxLength={100}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  type="email"
                  margin="normal"
                  required
                  autoComplete="email"
                  sx={{ width: "50%" }}
                  slotProps={{
                    input: {
                      minLength: 50,
                      maxLength: 50,
                    },
                  }}
                />
                <PhoneInput
                  country="pt"
                  onChange={handlePhoneNumberChange}
                  value={phoneNumber}
                  required
                  enableSearch
                  containerStyle={{ width: "50%" }}
                />
              </Box>

              {phoneErrors && (
                <div
                  style={{
                    color: "red",
                    textAlign: "right",
                    marginRight: "5rem",
                  }}
                >
                  {phoneErrors}
                </div>
              )}

              <Box sx={{ display: "flex", gap: "1rem" }}>
                <TextField
                  select
                  label="Género"
                  name="gender"
                  {...register("gender", {
                    required: "Selecione o género",
                  })}
                  error={!!errors.gender}
                  helperText={errors.gender?.message}
                  margin="normal"
                  defaultValue=""
                  sx={{ width: "50%" }}
                >
                  <MenuItem value="Feminino">Feminino</MenuItem>
                  <MenuItem value="Masculino">Masculino</MenuItem>
                  <MenuItem value="NaoDivulgar">Prefiro Não Divulgar</MenuItem>
                </TextField>

                <TextField
                  label="Data de Nascimento"
                  name="birthDate"
                  type="date"
                  {...register("birthDate", {
                    required: "Insira a sua data de nascimento",
                    validate: (value) =>
                      new Date(value) <= new Date(minDate) ||
                      "Data de Nascimento inválida. Necessário ter pelo menos 16 anos.",
                  })}
                  error={!!errors.birthDate}
                  helperText={errors.birthDate?.message}
                  margin="normal"
                  required
                  sx={{ width: "50%" }}
                  inputProps={{
                    max: minDate,
                  }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Box>

              <Box sx={{ display: "flex", gap: "1rem" }}>
                <TextField
                  select
                  label="Tipo Documento"
                  name="docType"
                  {...register("docType", {
                    required: "Indica o tipo de documento",
                  })}
                  error={!!errors.docType}
                  helperText={errors.docType?.message}
                  required
                  margin="normal"
                  sx={{ width: "50%" }}
                  defaultValue={""}
                >
                  <MenuItem value="cc">CC - Cartão de Cidadão</MenuItem>
                  <MenuItem value="bi">BI - Bilhete de Identidade</MenuItem>
                  <MenuItem value="cn">CN - Certidão de Nascimento</MenuItem>
                  <MenuItem value="p">P - Passaporte</MenuItem>
                  <MenuItem value="bim">
                    BIM - Bilhete de Identidade Militar
                  </MenuItem>
                </TextField>
                <TextField
                  label="Número do Documento"
                  name="docNumber"
                  {...register("docNumber", {
                    required: "Indica o número do documento",
                    minLength: {
                      value: 5,
                      message:
                        "Não atende ao número mínimo de caracteres exigido.",
                    },
                    maxLength: {
                      value: 25,
                      message: "Excedeu o limite de caracteres.",
                    },
                  })}
                  error={!!errors.docNumber}
                  helperText={errors.docNumber?.message}
                  margin="normal"
                  sx={{ width: "50%" }}
                />
              </Box>

              <Box sx={{ display: "flex", gap: "1rem" }}>
                {checkBoxChecked ? (
                  <>
                    <TextField
                      label="NIF"
                      required
                      {...register("nif", {
                        required: "Insira o seu nif",
                        minLength: {
                          value: 5,
                          message:
                            "Não atende ao número mínimo de caracteres exigido.",
                        },
                        maxLength: {
                          value: 20,
                          message: "Excedeu o limite de caracteres.",
                        },
                      })}
                      error={!!errors.nif}
                      helperText={errors.nif?.message}
                      margin="normal"
                      sx={{ width: "100%" }}
                    />
                    <TextField
                      select
                      label="País de origem do NIF"
                      name="countryNif"
                      {...register("countryNif", {
                        required: "Escolha uma opção.",
                      })}
                      error={!!errors.countryNif}
                      helperText={errors.countryNif?.message}
                      margin="normal"
                      required
                      sx={{ width: "100%" }}
                      defaultValue=""
                    >
                      <MenuItem defaultValue="">SS</MenuItem>
                      {countryData.map((countryNif) => (
                        <MenuItem key={countryNif.name} value={countryNif.tld}>
                          {countryNif.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </>
                ) : (
                  <TextField
                    label="NIF"
                    name="nif"
                    required
                    {...register("nif", {
                      required: "Insira o seu nif",
                      minLength: {
                        value: 5,
                        message:
                          "Não atende ao número mínimo de caracteres exigido.",
                      },
                      maxLength: {
                        value: 20,
                        message: "Excedeu o limite de caracteres.",
                      },
                    })}
                    margin="normal"
                    sx={{ width: "100%" }}
                  />
                )}
              </Box>
              <Box>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={checkBoxChecked}
                      onChange={handleCheckBoxChecked}
                    />
                  }
                  label="NIF Estrangeiro"
                />
              </Box>

              <TextField
                label="Morada"
                name="address"
                required
                {...register("address", {
                  required: "Insira a sua morada",
                  minLength: {
                    value: 5,
                    message:
                      "Não atende ao número mínimo de caracteres exigido.",
                  },
                  maxLength: {
                    value: 255,
                    message: "Excedeu o limite de caracteres.",
                  },
                })}
                margin="normal"
                autoComplete="address"
                sx={{ width: "100%" }}
              />
              <TextField
                label="Morada 2"
                name="address2"
                {...register("address2", {
                  maxLength: {
                    value: 255,
                    message: "Excedeu o limite de caracteres.",
                  },
                })}
                margin="normal"
                autoComplete="address2"
                sx={{ width: "100%" }}
              />
              <Box sx={{ display: "flex", gap: "1rem" }}>
                <TextField
                  select
                  label="País"
                  name="country"
                  {...register("country", { required: "Escolha uma opção" })}
                  error={!!errors.country}
                  helperText={errors.country?.message}
                  margin="normal"
                  required
                  autoComplete="country"
                  sx={{ width: "100%" }}
                  defaultValue={""}
                >
                  {countryData.map((country) => (
                    <MenuItem key={country.name} value={country.tld}>
                      {country.name}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  label="Código Postal"
                  name="zipcode"
                  {...register("zipcode", {
                    required: "Informe o seu código postal",
                    maxLength: {
                      value: 12,
                      message: "Excedeu o limite de caracteres.",
                    },
                  })}
                  error={!!errors.zipcode}
                  helperText={errors.zipcode?.message}
                  onChange={handleZipcodeChange}
                  onBlur={handleZipcodeBlur}
                  margin="normal"
                  required
                  sx={{ width: "100%" }}
                />
                <TextField
                  label="Cidade"
                  name="city"
                  {...register("city", {
                    required: getValues("city")
                      ? false
                      : "Cidade é obrigatória",
                  })}
                  error={!!errors.city}
                  helperText={errors.city?.message}
                  value={getValues("city") || ""}
                  margin="normal"
                  disabled
                  sx={{ width: "100%" }}
                />
              </Box>
              {cityError && <Typography color="error">{cityError}</Typography>}
            </Box>

            <Box
              sx={{
                ml: "5rem",
                width: "40%",
              }}
            >
              <TextField
                select
                label="Função"
                name="role"
                {...register("role", { required: "Campo obrigatório." })}
                error={!!errors.role}
                helperText={errors.role?.message}
                margin="normal"
                defaultValue={1}
                required
                sx={{ width: "100%" }}
              >
                {roles.map((role) => (
                  <MenuItem key={role.rolesId} value={role.rolesId}>
                    {role.rolesName}
                  </MenuItem>
                ))}
              </TextField>

              {watch("role") === 1 ? (
                <>
                  <TextField
                    select
                    label="Plano de Ginásio"
                    name="gymPlanId"
                    {...register("gymPlanId", {
                      required: "Escolha uma opção.",
                    })}
                    error={!!errors.gymPlanId}
                    helperText={errors.gymPlanId?.message}
                    margin="normal"
                    required
                    sx={{ width: "100%" }}
                    defaultValue={""}
                  >
                    {Array.isArray(gymPlans?.data) &&
                      gymPlans?.data
                        .filter((gymPlan, index) => index !== 0)
                        .map((gymPlan) => (
                          <MenuItem
                            key={gymPlan.gymPlanId}
                            value={gymPlan.gymPlanId}
                          >
                            {gymPlan.name}
                          </MenuItem>
                        ))}
                  </TextField>
                  <TextField
                    label="Descrição do Plano"
                    name="gymPlanDescription"
                    value={getValues("gymPlanDescription")}
                    margin="normal"
                    multiline
                    rows={5}
                    sx={{ width: "100%" }}
                    slotProps={{
                      inputLabel: { shrink: true },
                    }}
                    disabled
                  />
                  <TextField
                    label="Data de início da Assinatura"
                    name="signatureStartDate"
                    type="date"
                    {...register("signatureStartDate", {
                      required: "Informe uma data",
                    })}
                    error={!!errors.signatureStartDate}
                    helperText={errors.signatureStartDate?.message}
                    margin="normal"
                    required
                    sx={{ width: "100%" }}
                    slotProps={{
                      inputLabel: { shrink: true },
                    }}
                  />
                  <TextField
                    label="Data de Fim da Assinatura (caso aplicável)"
                    name="signatureEndDate"
                    type="date"
                    {...register("signatureEndDate")}
                    margin="normal"
                    sx={{ width: "100%" }}
                    slotProps={{
                      inputLabel: { shrink: true },
                    }}
                  />
                  <TextField
                    disabled
                    label="Preço"
                    name="gymPlanPrice"
                    value={getValues("gymPlanPrice")}
                    slotProps={{
                      inputLabel: { shrink: true },
                    }}
                    margin="normal"
                    sx={{ width: "100%" }}
                  />
                  <TextField
                    label="Jóia de Inscirção"
                    name="registrationFee"
                    slotProps={{
                      inputLabel: { shrink: true },
                    }}
                    {...register("registrationFee", {
                      required: "Informe um valor ou 0",
                      validate: (value) =>
                        parseFloat(value) >= 0 ||
                        "O valor não pode ser negativo",
                    })}
                    min="0"
                    error={!!errors.registrationFee}
                    helperText={errors.registrationFee?.message}
                    required
                    margin="normal"
                    sx={{ width: "100%" }}
                  />
                  <Stack spacing={2}>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                        <Button
                          type="submit"
                          variant="contained"
                          color="secondary"
                          sx={{ mt: "0.5rem", height: "2.75rem" }}
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <CircularProgress size={24} color="inherit" />
                          ) : (
                            "Registar Cliente"
                          )}
                        </Button>
                      </Box>
                      <Box sx={{ width: "100%", mt: "0.5rem" }}>
                        {message && (
                          <Alert
                            sx={{ width: "100%" }}
                            severity={isSuccess ? "success" : "error"}
                          >
                            {message}
                          </Alert>
                        )}
                      </Box>
                    </Box>
                  </Stack>
                </>
              ) : (
                <Stack spacing={2}>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                      <Button
                        type="submit"
                        variant="contained"
                        color="secondary"
                        sx={{ mt: "0.5rem", height: "2.75rem" }}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <CircularProgress size={24} color="inherit" />
                        ) : (
                          "Registar Funcionário"
                        )}
                      </Button>
                    </Box>
                    <Box sx={{ width: "100%", mt: "0.5rem" }}>
                      {message && (
                        <Alert
                          sx={{ width: "100%" }}
                          severity={isSuccess ? "success" : "error"}
                        >
                          {message}
                        </Alert>
                      )}
                    </Box>
                  </Box>
                </Stack>
              )}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default RegisterCustomer;
