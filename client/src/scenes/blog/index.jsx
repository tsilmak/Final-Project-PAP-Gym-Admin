import React, { useState } from "react";
import {
  Box,
  Typography,
  Avatar,
  AvatarGroup,
  Button,
  Chip,
  Paper,
  Link,
  InputBase,
  Collapse,
  Tooltip,
  IconButton,
  Pagination,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Alert,
  Skeleton,
} from "@mui/material";
import {
  ExpandMore,
  ExpandLess,
  KeyboardArrowRightRounded,
  Edit,
  Delete,
  Add,
} from "@mui/icons-material";
import Header from "components/common/Header";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import {
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useGetAllCategoriesQuery,
  useUpdateCategoryMutation,
  useGetBlogsPreviewByCurrentUserIdQuery,
} from "state/api";
import ErrorOverlay from "components/common/ErrorOverlay";
import DOMPurify from "dompurify";

const BlogCard = ({ entry, theme, navigate }) => {
  return (
    <Paper
      component="li"
      variant="outlined"
      sx={{
        backgroundColor: theme.palette.background.alt,
        p: 2,
        borderRadius: 2,
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        transition: "transform 0.2s",
        display: "flex",
        flexDirection: "column",
        minHeight: 300,
        height: "100%",
        "&:hover": {
          transform: "scale(1.02)",
          boxShadow: "0 6px 12px rgba(0, 0, 0, 0.15)",
        },
      }}
    >
      <Box sx={{ display: "flex", gap: 1, mb: 1, flexWrap: "wrap" }}>
        {entry.categories.map((category, index) => (
          <Chip
            key={index}
            label={category}
            variant="outlined"
            size="small"
            sx={{
              backgroundColor: theme.palette.background.alt,
            }}
          />
        ))}
      </Box>

      <Typography variant="subtitle1" gutterBottom>
        <Link href={`/blog/${entry?.blogId}`} underline="none" color="inherit">
          {entry?.title?.length > 30
            ? `${entry.title.slice(0, 30)}...`
            : entry.title}
        </Link>
      </Typography>

      <Typography variant="body2" color="textSecondary" sx={{ flexGrow: 1 }}>
        <span
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(entry?.body) }}
        />
      </Typography>

      <AvatarGroup max={4} sx={{ my: 2 }}>
        {entry?.authors?.map((authors, index) => (
          <Avatar
            key={index}
            alt={`Author ${index + 1}`}
            src={authors.profilePictureUrl}
          />
        ))}
      </AvatarGroup>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box>
          {entry?.authors?.map((authors, index) => (
            <Typography key={index} variant="body2">{`${
              authors?.fname + " " + authors?.lname
            }, `}</Typography>
          ))}
          <Typography variant="caption">
            {new Date(entry?.createdAt).toLocaleDateString("pt-PT", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Typography>{" "}
        </Box>
        <Button
          variant="text"
          color="secondary"
          size="small"
          endIcon={<KeyboardArrowRightRounded />}
          onClick={() => navigate(`/blog/${entry?.blogId}`)}
        >
          Visualizar
        </Button>
      </Box>
    </Paper>
  );
};

const DeleteConfirmationModal = ({
  open,
  onClose,
  onConfirm,
  categoryName,
  canDelete,
  theme,
  numberOfAssociatedBlogs,
}) => (
  <Dialog
    open={open}
    onClose={onClose}
    sx={{
      "& .MuiPaper-root": {
        backgroundColor: theme.palette.background.default,
      },
    }}
  >
    <DialogTitle>Confirmar Eliminação</DialogTitle>
    <DialogContent>
      <DialogContentText>
        {canDelete
          ? `Tens a certeza que queres eliminar a categoria: "${categoryName}"?`
          : `A categoria: "${categoryName}" ainda está associada a ${numberOfAssociatedBlogs} blogs e não pode ser eliminada.`}
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} color="black">
        Cancelar
      </Button>
      {canDelete && (
        <Button onClick={onConfirm} color="secondary">
          Eliminar
        </Button>
      )}
    </DialogActions>
  </Dialog>
);

const EditCategoryModal = ({ open, onClose, currentName, onSave, theme }) => {
  const [newName, setNewName] = useState(currentName);
  const handleClose = () => {
    setNewName(currentName);
    onClose();
  };

  const handleSave = () => {
    onSave(newName);
    onClose();
  };

  const handleOpen = () => {
    setNewName(currentName);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      onEntered={handleOpen}
      sx={{
        "& .MuiPaper-root": {
          backgroundColor: theme.palette.background.default,
        },
      }}
    >
      <DialogTitle>Editar categoria</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Category Name"
          type="text"
          fullWidth
          variant="outlined"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="black">
          Cancelar
        </Button>
        <Button
          onClick={handleSave}
          color="secondary"
          disabled={newName.trim() === ""}
        >
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
};
const AddCategoryModal = ({
  open,
  onClose,
  onAdd,
  isLoadingCreateCategory,
}) => {
  const [newCategory, setNewCategory] = useState("");

  const handleAdd = () => {
    if (newCategory.trim()) {
      onAdd(newCategory);
      setNewCategory("");
      onClose();
    }
  };
  const theme = useTheme();
  return (
    <Dialog
      open={open}
      onClose={onClose}
      sx={{
        "& .MuiPaper-root": {
          backgroundColor: theme.palette.background.default,
        },
      }}
    >
      <DialogTitle>Adicionar uma categoria</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Nome da categoria"
          type="text"
          fullWidth
          variant="outlined"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="black">
          Cancelar
        </Button>
        <Button
          onClick={handleAdd}
          color="secondary"
          disabled={isLoadingCreateCategory}
        >
          {isLoadingCreateCategory ? "A Guardar..." : "Guardar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const Category = ({ category, onDelete, onEdit, associatedBlogs, theme }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const handleDelete = () => {
    setIsModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (associatedBlogs === 0) {
      onDelete(category.categoryId);
    }
    setIsModalOpen(false);
  };

  const handleSaveEdit = (newName) => {
    onEdit(newName, category.categoryId);
  };

  return (
    <Paper
      sx={{
        p: 2,
        mb: 1,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        color: theme.palette.neutral.main,
        backgroundColor: theme.palette.background.default,
      }}
    >
      <Tooltip
        title={`${category.name} está associada a: (${associatedBlogs} blogs)`}
      >
        <Typography variant="body1">
          <Typography variant="body1">
            {category.name.length > 10
              ? `${category.name.substring(0, 10)}...`
              : category.name}{" "}
          </Typography>
          <Typography
            component="span"
            sx={{ textDecoration: "underline", cursor: "pointer" }}
          >
            ({associatedBlogs} blogs)
          </Typography>
        </Typography>
      </Tooltip>
      <Box>
        <IconButton size="small" onClick={() => setIsEditModalOpen(true)}>
          <Edit fontSize="small" />
        </IconButton>
        <IconButton size="small" onClick={handleDelete}>
          <Delete fontSize="small" />
        </IconButton>
      </Box>

      {/* Delete confirmation modal */}
      <DeleteConfirmationModal
        theme={theme}
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmDelete}
        categoryName={category.name}
        canDelete={associatedBlogs === 0}
        numberOfAssociatedBlogs={associatedBlogs}
      />

      {/* Edit category modal */}
      <EditCategoryModal
        key={category.categoryId}
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        currentName={category.name}
        onSave={handleSaveEdit}
        theme={theme}
      />
    </Paper>
  );
};

// Main Blog Component
const Blog = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { data: dataBlogPreviews, error: errorBlogPreviews } =
    useGetBlogsPreviewByCurrentUserIdQuery();

  const { data: dataCategories, error: errorCategories } =
    useGetAllCategoriesQuery();
  console.log(dataCategories);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage] = useState(15);
  const [entriesPerPageCategories] = useState(12);

  const [isCategoriesExpanded, setIsCategoriesExpanded] = useState(true);
  const [categorySearchQuery, setCategorySearchQuery] = useState("");
  const [currentCategoryPage, setCurrentCategoryPage] = useState(1);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [updateCategory] = useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();
  const [createCategory, { isLoading: isLoadingCreateCategory }] =
    useCreateCategoryMutation();
  const filteredEntries = dataBlogPreviews?.filter((entry) =>
    entry.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const currentEntries = filteredEntries?.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  );

  const filteredCategories = dataCategories?.filter((category) =>
    category.name.toLowerCase().includes(categorySearchQuery.toLowerCase())
  );
  const currentCategories = filteredCategories?.slice(
    (currentCategoryPage - 1) * entriesPerPageCategories,
    currentCategoryPage * entriesPerPageCategories
  );

  const handleDeleteCategory = async (categoryId) => {
    try {
      await deleteCategory({ categoryId }).unwrap();
      setSnackbarMessage("Categoria eliminada com sucesso!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (err) {
      console.error("Failed to update category:", err);
      console.log(err);
      setSnackbarMessage(
        `Ocorreu um erro ao eliminar a categoria: ${
          err?.message || "erro desconhecido"
        }`
      );
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleEditCategory = async (newName, categoryId) => {
    try {
      await updateCategory({ categoryId, categoryName: newName }).unwrap();
      setSnackbarMessage("Categoria editada com sucesso!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (err) {
      console.error("Failed to update category:", err);
      console.log(err);
      setSnackbarMessage(
        `Ocorreu um erro ao atualizar a categoria: ${
          err?.message || "erro desconhecido"
        }`
      );
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  // Add a new category
  const handleCreateCategory = async (categoryData) => {
    try {
      await createCategory(categoryData).unwrap();
      setSnackbarMessage("Categoria criada com sucesso!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (err) {
      console.log(err);
      setSnackbarMessage(
        `Ocorreu um erro ao criar a categoria: ${
          err.data.error || "erro desconhecido"
        }`
      );
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };
  return (
    <>
      <Header
        title="Blog"
        subtitle="Veja, crie edite os últimos blogs escritos."
      />
      <Box
        sx={{
          ml: "5rem",
          display: "flex",
          mr: "5rem",
          mx: { xs: "1rem", md: "5rem" },
        }}
      >
        {/* Blog Section */}
        <Box sx={{ flexGrow: 1 }}>
          {/* Blog Search */}
          <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
            <InputBase
              placeholder="Procurar por blog"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{
                flexGrow: 1,
                border: "1px solid lightgray",
                borderRadius: 2,
                pl: 2,
                pr: 2,
                py: 0.5,
              }}
            />
            <IconButton
              color="secondary"
              onClick={() => navigate("/blog/criar")}
            >
              <Add />
            </IconButton>
          </Box>

          <Box
            component="ul"
            sx={{
              listStyle: "none",
              p: 0,
              m: 0,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", // Responsive grid
              gap: 2,
            }}
          >
            {/* Check if dataBlogPreviews exists and has entries */}
            {dataBlogPreviews && dataBlogPreviews.length > 0 ? (
              currentEntries.map((entry) => (
                <BlogCard
                  key={entry.blogId}
                  entry={entry}
                  theme={theme}
                  navigate={navigate}
                />
              ))
            ) : (
              <Typography variant="body2" color="textSecondary">
                Ainda não existe nenhum blog
              </Typography>
            )}
          </Box>

          {/* Pagination for Blogs */}
          <Pagination
            count={Math.ceil(filteredEntries?.length / entriesPerPage)}
            page={currentPage}
            onChange={(event, value) => setCurrentPage(value)}
            sx={{ mt: 4 }}
          />
        </Box>

        {/* Categories Section */}
        <Box sx={{ width: "250px", ml: 3 }}>
          <Box
            sx={{
              mb: 2,
              display: "flex",
              alignItems: "center",
              gap: 1,
              justifyContent: "center",
            }}
          >
            <Typography variant="h6">Categorias</Typography>
            <IconButton
              onClick={() => setIsCategoriesExpanded(!isCategoriesExpanded)}
            >
              {isCategoriesExpanded ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Box>
          <Collapse in={isCategoriesExpanded}>
            <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
              <InputBase
                placeholder="Procurar categorias..."
                value={categorySearchQuery}
                onChange={(e) => setCategorySearchQuery(e.target.value)}
                sx={{
                  flexGrow: 1,
                  border: "1px solid lightgray",
                  borderRadius: 2,
                  pl: 2,
                  pr: 2,
                  py: 0.5,
                }}
              />
              <IconButton
                onClick={() => setIsAddCategoryModalOpen(true)}
                color="secondary"
              >
                <Add />
              </IconButton>
            </Box>

            {/* Category List */}
            <Box>
              {dataCategories ? (
                <>
                  {currentCategories.map((category, index) => (
                    <Category
                      key={index}
                      category={category}
                      onDelete={handleDeleteCategory}
                      onEdit={handleEditCategory}
                      associatedBlogs={category._count.blogs}
                      theme={theme}
                    />
                  ))}

                  <Pagination
                    count={Math.ceil(
                      filteredCategories?.length / entriesPerPageCategories
                    )}
                    page={currentCategoryPage}
                    onChange={(event, value) => setCurrentCategoryPage(value)}
                    sx={{ mt: 2 }}
                  />
                </>
              ) : errorCategories ? (
                <Box sx={{}}>
                  <ErrorOverlay
                    error={errorCategories}
                    dataName={"Categorias"}
                    isButtonVisible={false}
                  />
                </Box>
              ) : (
                Array.from({ length: entriesPerPageCategories }).map((_, i) => (
                  <Skeleton
                    sx={{
                      my: "0.5rem",
                    }}
                    key={i}
                    variant="rounded"
                    width={250}
                    height={60}
                  />
                ))
              )}
            </Box>
          </Collapse>
        </Box>
      </Box>

      {/* Add Category Modal */}
      <AddCategoryModal
        open={isAddCategoryModalOpen}
        onClose={() => setIsAddCategoryModalOpen(false)}
        onAdd={handleCreateCategory}
        isLoadingCreateCategory={isLoadingCreateCategory}
      />
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={5000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Blog;
