import React, { useState } from "react";
import {
  Avatar,
  Button,
  Typography,
  Box,
  Snackbar,
  Alert,
} from "@mui/material";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  useUploadImageMutation,
  useUpdateProfilePictureMutation,
} from "state/api";
import { useParams } from "react-router-dom";

export const ProfilePicture = ({
  isEditable,
  src,
  alt,
  name,
  membershipNumber,
  role,
  picturePublicId,
}) => {
  const { userId } = useParams();
  const DEFAULT_PROFILE_PICTURE_URL =
    "https://res.cloudinary.com/dmfbmt6mi/image/upload/v1726180540/gym-hub/tsk6ov6eiy0auhpdfuyt.png";

  const [previewSrc, setPreviewSrc] = useState(
    src || DEFAULT_PROFILE_PICTURE_URL
  );
  const [imageBase64, setImageBase64] = useState("");
  const [uploadImage, { error, isLoading: uploadLoading }] =
    useUploadImageMutation();
  const [hasChanges, setHasChanges] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [updateProfilePicture] = useUpdateProfilePictureMutation();
  console.log("PREVIEW IMAGE,", previewSrc);
  console.log("Preview publicId", picturePublicId);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          canvas.width = 300;
          canvas.height = 300;

          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          const base64String = canvas.toDataURL("image/jpeg").split(",")[1]; // Extract Base64 part
          setPreviewSrc(canvas.toDataURL("image/jpeg"));
          setImageBase64(base64String);
          setHasChanges(true);
        };

        img.src = e.target.result;
      };

      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      if (previewSrc === DEFAULT_PROFILE_PICTURE_URL) {
        await updateProfilePicture({
          id: userId,
          profilePicture: DEFAULT_PROFILE_PICTURE_URL,
          picturePublicId: picturePublicId,
        }).unwrap();

        setPreviewSrc(DEFAULT_PROFILE_PICTURE_URL);
        setHasChanges(false);
      } else if (imageBase64) {
        const formattedBase64 = `data:image/jpeg;base64,${imageBase64}`;
        const response = await uploadImage(formattedBase64);

        const profilePicture = response?.data?.uploadResponse?.secure_url;
        const picturePublicId = response?.data?.uploadResponse?.public_id;

        if (profilePicture && picturePublicId) {
          await updateProfilePicture({
            id: userId,
            profilePicture,
            picturePublicId,
          }).unwrap();

          setHasChanges(false);
        } else {
          throw new Error("Upload response missing expected data.");
        }
      }
    } catch (err) {
      console.error("Failed to save profile picture:", err);
      setErrorMessage("Ocorreu um erro. Por favor tente novamente.");
      setSnackbarOpen(true);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
      <Avatar alt={alt} src={previewSrc} sx={{ width: 176, height: 176 }} />
      <Typography variant="h4" sx={{ mt: 1 }}>
        {name || "N/A"}
      </Typography>
      <Typography variant="h5" color="secondary">
        {membershipNumber || "N/A"} | {role || "N/A"}
      </Typography>

      {isEditable && (
        <>
          <Button
            variant="contained"
            component="label"
            startIcon={<PhotoCamera />}
            sx={{ mt: 2 }}
            disabled={userId === "1" || userId === "2"}
          >
            Atualizar Foto de Perfil
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={handleFileChange}
              disabled={userId === "1" || userId === "2"}
            />
          </Button>
          <Button
            variant="contained"
            startIcon={<DeleteIcon />}
            sx={{ mt: 1, color: "red" }}
            onClick={() => {
              setPreviewSrc(DEFAULT_PROFILE_PICTURE_URL);
              setHasChanges(true);
            }}
            disabled={userId === "1" || userId === "2"}
          >
            Remover Foto de Perfil
          </Button>
          {hasChanges && (
            <Button
              variant="contained"
              sx={{ mt: 2 }}
              onClick={handleSave}
              disabled={uploadLoading}
            >
              {uploadLoading ? "A Guardar..." : "Guardar"}
            </Button>
          )}
        </>
      )}

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity="error">
          {errorMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};
