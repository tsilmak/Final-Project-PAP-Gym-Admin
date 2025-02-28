import React, { useState, useCallback, useMemo } from "react";
import ReactPlayer from "react-player";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  Grid,
  Typography,
} from "@mui/material";
import {
  AddCircle as AddCircleIcon,
  PlayCircleOutline as PlayIcon,
  PhotoCamera,
} from "@mui/icons-material";
import Header from "components/common/Header";
import SearchBar from "components/common/SearchBar";
import { useTheme } from "@emotion/react";
import { useNavigate } from "react-router-dom";
import { useGetAllExercisesQuery } from "state/api";
import Loading from "components/common/Loading";

const ExerciseManagement = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { data, isLoading } = useGetAllExercisesQuery();

  const [selectedVideo, setSelectedVideo] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredExercises = useMemo(() => {
    if (!searchQuery) return data || [];

    const normalizedQuery = searchQuery.toLowerCase();
    return (data || []).filter((exercise) => {
      const searchFields = [
        exercise.name.toLowerCase(),
        exercise.targetMuscle?.toLowerCase() || "",
        (
          exercise.targetMuscle?.map((muscle) => muscle.toLowerCase()) || []
        ).join(" "),
        (
          exercise.secondaryMuscle?.map((muscle) => muscle.toLowerCase()) || []
        ).join(" "),
        (exercise.execution?.map((step) => step.toLowerCase()) || []).join(" "), // Safeguard
        (exercise.commentsAndTips?.map((tip) => tip.toLowerCase()) || []).join(
          " "
        ),
      ];

      return searchFields.some((field) => field.includes(normalizedQuery));
    });
  }, [data, searchQuery]);

  const handleVideoPlay = (videoUrl) => {
    setSelectedVideo(videoUrl);
  };

  const handlePhotoPlay = (imageUrl) => {
    setSelectedPhoto(imageUrl);
  };

  const handleCloseVideoModal = () => {
    setSelectedVideo(null);
  };

  const handleClosePhotoModal = () => {
    setSelectedPhoto(null);
  };
  if (isLoading) {
    <Loading />;
  }
  return (
    <Box>
      <Header title="Exercícios" subtitle="Gere os exercícios do teu ginásio" />
      <SearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        placeholder="Pesquisar exercícios..."
      />
      {/* Button to open the dialog for adding a new exercise */}
      <Box
        sx={{ display: "flex", justifyContent: "flex-end", mb: 2, mx: "5rem" }}
      >
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddCircleIcon />}
          onClick={() => navigate("/exercicios/criar")}
        >
          Adicionar Exercício
        </Button>
      </Box>

      {/* List of filtered exercises */}
      {!isLoading && filteredExercises.length === 0 ? (
        <Typography variant="body1" align="center" sx={{ mt: 4 }}>
          Nenhum exercício encontrado
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {filteredExercises.map((exercise) => (
            <Grid
              item
              xs={12}
              sm={6}
              md={4}
              key={exercise.exerciseId}
              sx={{ ml: "5rem" }}
            >
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  backgroundColor: theme.palette.background.alt,
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h5" gutterBottom>
                    {exercise.name}
                  </Typography>

                  <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                    {exercise.exerciseType && (
                      <Chip
                        label={exercise.exerciseType}
                        color="primary"
                        size="small"
                      />
                    )}
                    {exercise.experienceLevel && (
                      <Chip
                        label={exercise.experienceLevel}
                        color="secondary"
                        size="small"
                      />
                    )}
                  </Box>

                  <Typography variant="body1" gutterBottom>
                    <strong>Músculos Alvo:</strong>{" "}
                    {exercise.targetMuscle || "Não especificado"}
                  </Typography>

                  <Typography variant="body1" gutterBottom>
                    <strong>Músculos Sinérgicos:</strong>{" "}
                    {exercise.secondaryMuscle || "Não especificado"}
                  </Typography>

                  <Typography variant="body1" gutterBottom>
                    <strong>Equipamento:</strong>{" "}
                    {exercise.equipamentName || "Não especificado"}
                  </Typography>

                  <Typography
                    variant="body1"
                    color="textSecondary"
                    sx={{ mt: 2 }}
                  >
                    <strong>Execução:</strong>
                    <ol>
                      {exercise.execution?.map((step, index) => (
                        <li key={index}>{step}</li>
                      )) || "Não especificado"}
                    </ol>
                  </Typography>

                  <Typography
                    variant="body1"
                    color="textSecondary"
                    sx={{ mt: 2 }}
                  >
                    <strong>Comentários e Dicas:</strong>
                    <ul>
                      {exercise.commentsAndTips?.map((tip, index) => (
                        <li key={index}>{tip}</li>
                      )) || "Não especificado"}
                    </ul>
                  </Typography>

                  {exercise.videoUrl && (
                    <Box sx={{ mt: 2, mb: 2, textAlign: "center" }}>
                      <Button
                        variant="outlined"
                        color={theme.palette.primary[600]}
                        sx={{ mr: 2 }}
                        startIcon={<PlayIcon />}
                        onClick={() => handleVideoPlay(exercise.videoUrl)}
                      >
                        Visualizar Vídeo
                      </Button>
                      <Button
                        variant="outlined"
                        color={theme.palette.primary[600]}
                        startIcon={<PhotoCamera />}
                        onClick={() => handlePhotoPlay(exercise.imageUrl)}
                      >
                        Visualizar Fotografia
                      </Button>
                    </Box>
                  )}

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mt: 2,
                    }}
                  >
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={() =>
                        navigate(`/exercicios/${exercise.exerciseId}`)
                      }
                    >
                      Visualizar
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Video Modal */}
      <Dialog
        open={!!selectedVideo}
        onClose={handleCloseVideoModal}
        maxWidth="md"
        fullWidth
      >
        <DialogContent>
          <ReactPlayer
            url={selectedVideo}
            controls
            width="100%"
            height="480px"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseVideoModal} color="secondary">
            Fechar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Photo Modal */}
      <Dialog
        open={!!selectedPhoto}
        onClose={handleClosePhotoModal}
        maxWidth="md"
        fullWidth
      >
        <DialogContent>
          <img src={selectedPhoto} alt="exercise" style={{ width: "100%" }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePhotoModal} color="secondary">
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ExerciseManagement;
