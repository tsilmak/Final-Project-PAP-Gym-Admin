import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useDeleteBlogByIdMutation,
  useGetAllCategoriesQuery,
  useGetBlogByIdQuery,
  useUpdateBlogMutation,
  useUploadImageMutation,
} from "state/api";
import DOMPurify from "dompurify";
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Button,
  TextField,
  Card,
  Avatar,
  Switch,
  FormControlLabel,
  Snackbar,
  Chip,
  Paper,
  useMediaQuery,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from "@mui/material";
import ReactQuill from "react-quill-new";
import "../quill.snow.css";
import { Edit, Delete, PhotoCamera } from "@mui/icons-material";
import { useTheme } from "@emotion/react";
import Header from "components/common/Header";
import FlexBetween from "components/common/FlexBetween";
import EmployeesList from "../createBlog/employeesList";

import { useForm } from "react-hook-form";
import { set } from "date-fns";

const BlogById = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const [uploadImage, { isLoading: isLoadingUploadImage }] =
    useUploadImageMutation();
  const { data, error, isLoading, refetch } = useGetBlogByIdQuery(id);
  const authorUsersId = data?.authors?.map((author) => author.userId);
  console.log(authorUsersId);

  const {
    data: categoriesData,
    isLoading: isLoadingCategories,
    error: errorCategories,
  } = useGetAllCategoriesQuery();
  const [updateBlog, { isLoading: isLoadingUpdateBlog }] =
    useUpdateBlogMutation();
  const [deleteBlog, { isLoading: isLoadingDeleteBlog }] =
    useDeleteBlogByIdMutation();
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

  const INITIAL_FORM_STATE = {
    title: "",
    body: "",
    categories: [],
    coverImage: null,
    imagePreview: null,
    published: false,
    authors: [],
  };

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

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [imagePreview, setImagePreview] = useState(null);
  const [imageBase64, setImageBase64] = useState("");
  const [editing, setEditing] = useState(false);
  const handleSnackbarOpen = (message, severity = "success") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };
  const isMedium = useMediaQuery(theme.breakpoints.down("md")); // Breakpoint for medium screens

  useEffect(() => {
    if (data) {
      reset({
        title: data.title || "",
        body: data.body || "",
        categories: data.categories?.map((cat) => cat.categoryId) || [],
        coverImage: data?.coverImageUrl,
        imagePreview: null,
        published: data.published || false,
      });
    }
  }, [data, reset]);
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5000000) {
        handleSnackbarOpen("A imagem tem que ter menos de 5MB", "error");
        return;
      }
      setValue("coverImage", null);
      setValue("imagePreview", file);

      setImagePreview(URL.createObjectURL(file));
      clearErrors("imagePreview");

      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result);
        handleSnackbarOpen("A imagem foi guardada");
      };
      reader.onerror = () => {
        handleSnackbarOpen("Failed to process image", "error");
      };
      reader.readAsDataURL(file);
    }
  };
  const handleRemoveImage = () => {
    setImagePreview(null);
    setImageBase64("");
    setValue("coverImage", data?.coverImageUrl);
  };
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleCategoryChange = (event) => {
    const value = event.target.value;
    setValue("categories", value);
  };
  const handleDelete = async () => {
    try {
      await deleteBlog(id);
      navigate("/blog");
    } catch (err) {
      alert("Não era suposto acontecer isto, por favor tenta denovo.");
    }
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleAuthorsChange = (selectedAuthors) => {
    setValue("authors", selectedAuthors);
  };

  const onSubmit = async (data) => {
    let coverImageUrl, coverImagePublicId;

    if (imageBase64) {
      try {
        const response = await uploadImage(imageBase64);

        if (!response?.data?.uploadResponse?.secure_url) {
          handleSnackbarOpen(
            "Ocorreu um erro ao carregar esta imagem",
            "error"
          );
          return;
        }

        coverImageUrl = response.data.uploadResponse.secure_url;
        coverImagePublicId = response.data.uploadResponse.public_id;
        setImageBase64("");
      } catch (error) {
        handleSnackbarOpen(
          "Erro ao carregar a imagem. Tente novamente.",
          "error"
        );
        console.error("Image upload error:", error);
        return;
      }
    }

    try {
      const blogData = {
        ...data,
        title: data.title.trim(),
        ...(coverImageUrl && { coverImageUrl }),
        ...(coverImagePublicId && { coverImagePublicId }),
      };

      const result = await updateBlog({ id, ...blogData });
      refetch();
      setEditing(false);
      if (result.error) {
        handleSnackbarOpen(
          "Erro ao atualizar o blog. Tente novamente.",
          "error"
        );
      } else {
        handleSnackbarOpen("Blog atualizado com sucesso!", "success");
      }
    } catch (error) {
      console.error("Error in onSubmit:", error);
      handleSnackbarOpen(
        "Ocorreu um erro inesperado. Tente novamente.",
        "error"
      );
    }
  };

  if (isLoading) {
    return <CircularProgress size={60} />;
  }

  if (error) {
    return (
      <Box sx={{ maxWidth: 600, margin: "auto", padding: 2 }}>
        <Alert severity="error">
          Não foi possível carregar este blog, por favor tente novamente.
        </Alert>
      </Box>
    );
  }

  if (!data) {
    return (
      <Box sx={{ maxWidth: 600, margin: "auto", padding: 2 }}>
        <Alert severity="warning">
          Não foi encontrado nenhum blog com este Identificador
        </Alert>
      </Box>
    );
  }

  return (
    <>
      <FlexBetween>
        <Header title={"Blog Individual"} subtitle={"Blog " + id} />
        {!editing && (
          <Box
            sx={{
              mx: isMedium ? "2rem" : "5rem",
              mt: "3rem",
              gap: 2,
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <Button variant="outlined" color="secondary" onClick={handleEdit}>
              Editar <Edit sx={{ ml: 1 }} />
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={handleDelete}
              disabled={isLoadingDeleteBlog}
            >
              {isLoadingDeleteBlog ? "A eliminar..." : "Eliminar"}
              <Delete sx={{ ml: 1 }} />
            </Button>
          </Box>
        )}
      </FlexBetween>

      <Box
        sx={{
          mx: isMedium ? "2rem" : "5rem",
          display: "flex",
          gap: 4,
          flexDirection: isMedium ? "column" : "row",
        }}
      >
        <Box sx={{ flex: 3 }}>
          {/* Editable Title */}
          {editing ? (
            <>
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
                      dataName="Categories list"
                      isButtonVisible={false}
                    />
                  ) : (
                    categoriesData?.map((category) => (
                      <MenuItem
                        key={category.categoryId}
                        value={category.categoryId}
                      >
                        {category.name.length > 35
                          ? `${category.name.slice(0, 35)}...`
                          : category.name}
                      </MenuItem>
                    ))
                  )}
                </Select>
                {errors.categories && (
                  <FormHelperText>{errors.categories.message}</FormHelperText>
                )}
              </FormControl>

              <TextField
                {...register("title", {
                  required: "Tem que inserir um Título",
                })}
                label="Title"
                variant="outlined"
                fullWidth
                margin="normal"
                error={!!errors.title}
                helperText={errors.title?.message}
              />
            </>
          ) : (
            <>
              <Box sx={{ display: "flex", gap: 1, mb: 1, flexWrap: "wrap" }}>
                {data.categories?.map((categories, index) => (
                  <Chip
                    key={index}
                    label={
                      categories.category.name.length > 35
                        ? `${categories.category.name.slice(0, 35)}...`
                        : categories.category.name
                    }
                    variant="outlined"
                    size="small"
                    sx={{
                      backgroundColor: theme.palette.background.alt,
                    }}
                  />
                ))}
              </Box>
              <Typography
                variant="h3"
                component="h1"
                sx={{ fontWeight: 700, color: theme.palette.text.main }}
              >
                {data.title}
              </Typography>
            </>
          )}

          <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap" }}>
            {editing ? (
              <>
                <EmployeesList
                  onAuthorsChange={handleAuthorsChange}
                  preselectedUsers={authorUsersId}
                />
                {errors.authors && (
                  <Typography color="error" variant="caption">
                    {errors.authors.message}
                  </Typography>
                )}
              </>
            ) : (
              data.authors?.map((author, index) => (
                <React.Fragment key={index}>
                  <Typography
                    variant="subtitle1"
                    color="textSecondary"
                    sx={{ marginTop: 1, marginRight: 1 }}
                  >
                    Por{" "}
                    {author.user.fname + " " + author.user.lname ||
                      "Desconhecido"}
                  </Typography>
                  <Avatar
                    src={author?.user?.profilePictureUrl}
                    sx={{ mr: 1, mt: 1 }}
                  />
                  {index < data.authors.length - 1 && (
                    <Typography
                      variant="subtitle1"
                      color="textSecondary"
                      sx={{ marginRight: 1 }}
                    >
                      |
                    </Typography>
                  )}
                </React.Fragment>
              ))
            )}
          </Box>

          {/* Publish Status Toggle */}
          {editing ? (
            <FormControlLabel
              control={
                <Switch
                  {...register("published")}
                  checked={watch("published")}
                  onChange={(e) => setValue("published", e.target.checked)}
                />
              }
              label={watch("published") ? "Publicado" : "Rascunho"}
              sx={{ mt: 2 }}
            />
          ) : (
            <Chip
              label={data.published ? "Publicado" : "Rascunho"}
              sx={{
                backgroundColor: data.published ? "green" : "red",
                color: "white",
                fontWeight: "bold",
                mt: 2,
              }}
            />
          )}

          {/* Blog Content */}
          <Box sx={{ mt: 4 }}>
            {editing ? (
              <Card
                sx={{
                  backgroundColor: theme.palette.background.alt,
                  padding: 3,
                  borderRadius: "8px",
                }}
              >
                <ReactQuill
                  style={{
                    height: "40rem",
                    marginBottom: "7rem",
                    wordWrap: "break-word", // Ensures long words are broken properly
                    overflowWrap: "break-word", // Ensures words break correctly if they overflow
                    wordBreak: "break-word", // Forces word breaks where necessary
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

                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                  <Button
                    onClick={() => setEditing(false)}
                    sx={{ marginRight: 2 }}
                    color="black"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSubmit((data) => onSubmit(data))}
                    color="secondary"
                    disabled={isLoadingUpdateBlog}
                  >
                    {isLoadingUpdateBlog ? "A Guardar..." : "Guardar"}
                  </Button>
                </Box>
              </Card>
            ) : (
              <Card
                sx={{
                  backgroundColor: theme.palette.background.alt,
                  padding: 3,
                  borderRadius: "8px",
                  wordWrap: "break-word",
                  overflowWrap: "break-word",
                  wordBreak: "break-word",
                }}
              >
                <Typography
                  variant="body1"
                  component="div"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(data.body),
                  }}
                  sx={{
                    color: theme.palette.text.main,
                    fontSize: "1.1rem",
                    lineHeight: 1.7,
                  }}
                />
              </Card>
            )}
          </Box>
          <Box sx={{ my: 5 }}>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => navigate(-1)}
            >
              Voltar
            </Button>
          </Box>
        </Box>

        {/* Sidebar */}
        <Box
          sx={{
            flex: 1,
            display: "block",
            position: "sticky",
            top: theme.spacing(2),
            mt: isMedium ? 3 : 0,
          }}
        >
          <Paper
            sx={{
              p: 2,
              borderRadius: 2,
              backgroundColor: theme.palette.background.alt,
            }}
          >
            <Typography variant="h6" gutterBottom>
              Imagem principal
            </Typography>
            {editing && (
              <>
                <Button
                  variant="contained"
                  component="label"
                  startIcon={<PhotoCamera />}
                  fullWidth
                >
                  Atualizar a imagem
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleImageChange}
                  />
                </Button>
                <Box sx={{ position: "relative", mt: 2 }}>
                  {editing && (
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
                  )}
                  <Box
                    component="img"
                    src={
                      watch("coverImage") ? watch("coverImage") : imagePreview
                    }
                    alt="Cover Preview"
                    sx={{ width: "100%", borderRadius: 1, boxShadow: 1 }}
                  />
                </Box>
              </>
            )}
            {errors.coverImage && (
              <Typography color="error" variant="caption">
                {errors.coverImage.message}
              </Typography>
            )}

            {!editing && (
              <Box sx={{ position: "relative", mt: 2 }}>
                {editing && (
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
                )}
                <Box
                  component="img"
                  src={data?.coverImageUrl}
                  alt="Cover Preview"
                  sx={{ width: "100%", borderRadius: 1, boxShadow: 1 }}
                />
              </Box>
            )}
          </Paper>
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

export default BlogById;
