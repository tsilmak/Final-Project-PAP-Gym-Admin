import React, { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Box,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  Chip,
  Alert,
  CircularProgress,
  Snackbar,
  useTheme,
  useMediaQuery,
  Container,
  Divider,
  IconButton,
  Card,
  FormHelperText,
} from "@mui/material";
import {
  PhotoCamera,
  Save,
  Publish,
  ArrowBack,
  Delete,
} from "@mui/icons-material";
import {
  useCreateBlogMutation,
  useGetAllCategoriesQuery,
  useUploadImageMutation,
} from "state/api";
import ReactQuill from "react-quill-new";
import "../quill.snow.css";
import Header from "components/common/Header";
import { useNavigate } from "react-router-dom";
import EmployeesList from "./employeesList";
import ErrorOverlay from "components/common/ErrorOverlay";

const INITIAL_FORM_STATE = {
  title: "",
  body: "",
  categories: [],
  coverImage: null,
  imagePreview: null,
  published: false,
  authors: [],
};

const BlogCreation = () => {
  const theme = useTheme();
  const isMedium = useMediaQuery(theme.breakpoints.down("md"));

  const [createBlog, { isLoading: isLoadingCreateBlog, isSuccess, isError }] =
    useCreateBlogMutation();
  const [uploadImage, { isLoading: isLoadingUploadImage }] =
    useUploadImageMutation();

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const navigate = useNavigate();
  const [imagePreview, setImagePreview] = useState(null);
  const [imageBase64, setImageBase64] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    clearErrors,
    trigger,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: INITIAL_FORM_STATE,
    mode: "onChange",
  });

  const {
    data: categoriesData,
    isLoading: isLoadingCategories,
    error: errorCategories,
  } = useGetAllCategoriesQuery();

  const handleSnackbarClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const showNotification = (message, severity = "success") => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3] }],
      ["bold", "italic", "underline"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ color: [] }],
      ["link"],
      ["clean"],
    ],
  };

  const handleCategoryChange = (event) => {
    const value = event.target.value;
    setValue("categories", value);
    clearErrors("categories");
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];

    if (file) {
      if (file.size > 5000000) {
        showNotification("A imagem tem que ter menos de 5MB", "error");
        return;
      }

      setValue("coverImage", file);
      setImagePreview(URL.createObjectURL(file));
      clearErrors("coverImage");

      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result);
        showNotification("A imagem foi guardada");
      };
      reader.onerror = () => {
        showNotification("Failed to process image", "error");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setImageBase64("");
    setValue("coverImage", null);
  };

  const handleAuthorsChange = (selectedAuthors) => {
    setValue("authors", selectedAuthors);
  };

  const onSubmit = async (data, isDraft = false) => {
    try {
      if (!imageBase64) {
        showNotification(
          "Por favor, introduza uma imagem de capa para este blog, antes de continuar.",
          "error"
        );
        return;
      }

      const response = await uploadImage(imageBase64);
      if (!response?.data?.uploadResponse?.secure_url) {
        showNotification("Ocorreu um erro ao carregar esta imagem", "error");
        return;
      }

      const coverImageUrl = response.data.uploadResponse.secure_url;
      const coverImagePublicId = response.data.uploadResponse.public_id;
      const blogData = {
        ...data,
        coverImageUrl,
        coverImagePublicId,
        published: !isDraft,
      };

      await createBlog(blogData).unwrap();
      showNotification(
        isDraft
          ? "O Blog foi guardado como rascunho com sucesso"
          : "O Blog foi publicado com sucesso"
      );

      reset(INITIAL_FORM_STATE);
      setImagePreview(null);
      setImageBase64("");

      navigate("/blog");
    } catch (error) {
      console.error("Error submitting blog:", error);
      showNotification(
        `Erro ao ${isDraft ? "guardar" : "publicar"} este blog: ${
          error.data.message || "Erro desconhecido"
        }`,
        "error"
      );
    }
  };

  return (
    <>
      <Header
        title="Cria um blog post"
        subtitle="Escreve o teu blog e guarda como rascunho ou publica."
      />
      <Container maxWidth="2xl">
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: theme.spacing(3),
          }}
        >
          {/* Main Content Area */}
          <Box
            sx={{
              flex: isMedium ? 1 : 2,
              width: "100%",
            }}
          >
            <Card
              elevation={3}
              sx={{
                p: isMedium ? 2 : 4,
                borderRadius: 2,
                backgroundColor: theme.palette.background.alt,
                padding: 3,
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              <Box component="form" noValidate autoComplete="off">
                {errors.submit && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {errors.submit.message}
                  </Alert>
                )}

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: isMedium ? "column" : "row",
                    gap: 2,
                    mb: 3,
                  }}
                >
                  <TextField
                    {...register("title", {
                      required: "Tem que inserir um Título",
                    })}
                    label="Título"
                    variant="outlined"
                    fullWidth
                    error={!!errors.title}
                    helperText={errors.title?.message}
                    sx={{ flex: 2 }}
                  />

                  <FormControl
                    sx={{ flex: 1, minWidth: isMedium ? "100%" : 200 }}
                    error={!!errors.categories}
                  >
                    <InputLabel>Categorias</InputLabel>
                    <Select
                      {...register("categories", {
                        required:
                          "Tem que especificar pelo menos 1 categoria referente a este blog",
                        validate: (value) =>
                          value.length > 0 ||
                          "Tem que especificar pelo menos 1 categoria referente a este blog",
                      })}
                      multiple
                      value={watch("categories")}
                      onChange={handleCategoryChange}
                      label="Categories"
                      renderValue={(selected) => (
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                          {selected.map((value) => {
                            const category = categoriesData?.find(
                              (cat) => cat.categoryId === value
                            );
                            return (
                              <Chip
                                key={value}
                                label={
                                  category
                                    ? category.name.length > 10
                                      ? category.name.substring(0, 10) + "..."
                                      : category.name
                                    : value
                                }
                                size="small"
                              />
                            );
                          })}
                        </Box>
                      )}
                    >
                      {isLoadingCategories ? (
                        <MenuItem disabled>
                          <CircularProgress size={24} />
                        </MenuItem>
                      ) : errorCategories ? (
                        <ErrorOverlay
                          error={errorCategories}
                          dataName={"Categories list"}
                          isButtonVisible={false}
                        />
                      ) : (
                        categoriesData?.map((category) => (
                          <MenuItem
                            key={category.categoryId}
                            value={category.categoryId}
                          >
                            {category.name}
                          </MenuItem>
                        ))
                      )}
                    </Select>
                    {errors.categories && (
                      <FormHelperText>
                        {errors.categories.message}
                      </FormHelperText>
                    )}
                  </FormControl>
                </Box>

                <Box sx={{ mb: 4 }}>
                  <ReactQuill
                    style={{
                      height: "40rem",
                      marginBottom: "7rem",
                    }}
                    modules={modules}
                    value={watch("body")}
                    onChange={(value) => {
                      setValue("body", value);
                      trigger("body");
                    }}
                  />
                  {errors.body && (
                    <Typography color="error" variant="caption">
                      {errors.body.message}
                    </Typography>
                  )}
                </Box>

                <Box sx={{ mb: 3 }}>
                  {/* Autores */}
                  <EmployeesList onAuthorsChange={handleAuthorsChange} />
                  {errors.authors && (
                    <Typography color="error" variant="caption">
                      {errors.authors.message}
                    </Typography>
                  )}
                </Box>

                <Divider sx={{ my: 3 }} />

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: isMedium ? "column" : "row",
                    gap: 2,
                    justifyContent: "space-between",
                    alignItems: isMedium ? "stretch" : "center",
                  }}
                >
                  <Button
                    variant="outlined"
                    color="inherit"
                    onClick={() => navigate(-1)}
                    startIcon={<ArrowBack />}
                    fullWidth={isMedium}
                  >
                    Voltar
                  </Button>
                  <Box
                    sx={{
                      display: "flex",
                      gap: 2,
                      flexDirection: isMedium ? "column" : "row",
                    }}
                  >
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={handleSubmit((data) => onSubmit(data, true))}
                      disabled={
                        isLoadingUploadImage ||
                        isLoadingCreateBlog ||
                        errorCategories
                      }
                      startIcon={
                        isLoadingUploadImage || isLoadingCreateBlog ? (
                          <CircularProgress size={20} />
                        ) : (
                          <Save />
                        )
                      }
                      fullWidth={isMedium}
                    >
                      Guardar como rascunho
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleSubmit((data) => onSubmit(data, false))}
                      disabled={
                        isLoadingUploadImage ||
                        isLoadingCreateBlog ||
                        errorCategories
                      }
                      startIcon={
                        isLoadingUploadImage || isLoadingCreateBlog ? (
                          <CircularProgress size={20} />
                        ) : (
                          <Publish />
                        )
                      }
                      fullWidth={isMedium}
                    >
                      Publicar
                    </Button>
                  </Box>
                </Box>
              </Box>
            </Card>
          </Box>

          {/* Sidebar */}
          <Box
            sx={{
              flex: 1,
              width: "100%",
            }}
          >
            <Paper
              sx={{
                backgroundColor: theme.palette.background.alt,

                p: 2,
                borderRadius: 2,
                position: isMedium ? "relative" : "sticky",
                top: theme.spacing(2),
              }}
            >
              <Typography variant="h6" gutterBottom>
                Imagem principal
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <Button
                  variant="contained"
                  component="label"
                  startIcon={<PhotoCamera />}
                  fullWidth
                >
                  Carregar uma imagem
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleImageUpload}
                  />
                </Button>

                {errors.coverImage && (
                  <Typography color="error" variant="caption">
                    {errors.coverImage.message}
                  </Typography>
                )}

                {imagePreview && (
                  <Box sx={{ width: "100%", position: "relative" }}>
                    <IconButton
                      onClick={handleRemoveImage}
                      sx={{
                        position: "absolute",
                        right: 8,
                        top: 8,
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                        "&:hover": {
                          backgroundColor: "rgba(0, 0, 0, 0.7)",
                        },
                      }}
                    >
                      <Delete sx={{ color: "white" }} />
                    </IconButton>
                    <Box
                      component="img"
                      src={imagePreview}
                      alt="Cover Preview"
                      sx={{
                        width: "100%",
                        height: "auto",
                        borderRadius: 1,
                        boxShadow: 1,
                      }}
                    />
                  </Box>
                )}
              </Box>
            </Paper>
          </Box>
        </Box>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert
            onClose={handleSnackbarClose}
            severity={snackbar.severity}
            variant="filled"
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </>
  );
};

export default BlogCreation;
