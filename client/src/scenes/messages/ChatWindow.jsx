import React, { useEffect, useState, useRef } from "react";
import { useTheme } from "@emotion/react";
import {
  Avatar,
  Box,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Typography,
  Modal,
  Button,
  Snackbar,
  Paper,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import AddIcon from "@mui/icons-material/Add";
import moment from "moment";
import "moment/locale/pt";
import {
  useGetMessagesQuery,
  useSendMessageMutation,
  useUploadImageMutation,
} from "state/api";
import { useDispatch } from "react-redux";
import Loading from "components/common/Loading";
moment.locale("pt");

const ChatWindow = ({
  selectedChat,
  isUserOnline,
  handleClickAvatar,
  handleDeleteChat,
  isDeletingUserFromSideBar,
  currentUserId,
  socket,
}) => {
  const theme = useTheme();
  const [uploadPhoto, { isLoading: isUploadingPhoto }] =
    useUploadImageMutation();
  const [message, setMessage] = useState({
    text: "",
    imageUrl: "",
    videoUrl: "",
  });
  const [openModal, setOpenModal] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [anchorElDeleteChat, setAnchorElDeleteChat] = useState(null);
  const [anchorElUpload, setAnchorElUpload] = useState(null);
  const [fileToUpload, setFileToUpload] = useState(null);
  const [isFileUploading, setIsFileUploading] = useState(false);
  const {
    data: userMessageData,
    isLoading: userMessageLoading,
    error: userMessageError,
    refetch,
  } = useGetMessagesQuery(selectedChat.userId);
  const [sendMessage, { isLoading, error }] = useSendMessageMutation();
  const dispatch = useDispatch();

  const currentMessage = useRef(null);

  useEffect(() => {
    if (!socket) return;

    socket.connect();

    return () => {
      socket.disconnect();
    };
  }, [socket]);

  useEffect(() => {
    const handleNewMessage = () => {
      refetch();
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [socket, selectedChat.userId, refetch, dispatch]);

  useEffect(() => {
    if (currentMessage.current) {
      currentMessage.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [userMessageData]);

  useEffect(() => {
    if (currentMessage.current) {
      currentMessage.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [userMessageData]);

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "video/mp4",
    "video/webm",
    "video/mov",
    "video/quicktime",
  ];

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setAnchorElUpload(null);

    if (file) {
      if (!allowedTypes.includes(file.type)) {
        setSnackbarMessage(
          "Unsupported file type. Please upload an image or a video."
        );
        setSnackbarOpen(true);
        return;
      }

      setFileToUpload(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewFile(objectUrl);
      setFileType(file.type.startsWith("image/") ? "image" : "video");
      setOpenModal(true);

      return () => URL.revokeObjectURL(objectUrl);
    }
  };
  useEffect(() => {
    return () => {
      if (previewFile) {
        URL.revokeObjectURL(previewFile);
      }
    };
  }, [previewFile]);

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleTextChange = (e) => {
    setMessage((prev) => ({ ...prev, text: e.target.value }));
  };
  const [expandedMessages, setExpandedMessages] = useState(new Set());

  const toggleExpand = (msgId) => {
    setExpandedMessages((prev) => {
      const newExpandedMessages = new Set(prev);
      if (newExpandedMessages.has(msgId)) {
        newExpandedMessages.delete(msgId);
      } else {
        newExpandedMessages.add(msgId);
      }
      return newExpandedMessages;
    });
  };
  const handleSendMessage = async () => {
    let uploadPhotoResponse;
    let uploadVideoResponse;
    let base64File = null;

    if (!message.text.trim() && !fileToUpload) {
      setSnackbarMessage("Cannot send an empty message.");
      setSnackbarOpen(true);
      return;
    }

    if (fileToUpload) {
      const isImage = fileToUpload.type.startsWith("image/");
      const isVideo = fileToUpload.type.startsWith("video/");
      console.log(fileToUpload);
      setIsFileUploading(true);

      try {
        base64File = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(fileToUpload);
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = () => reject("Failed to read file");
        });

        console.log("Base64 file:", base64File);

        if (isImage) {
          uploadPhotoResponse = await uploadPhoto(base64File).unwrap();
          console.log("is image file", uploadPhotoResponse);
        } else if (isVideo) {
          console.log("is video file", base64File);
        }
      } catch (error) {
        console.error("File reading failed", error);
        setSnackbarMessage("File reading failed. Please try again.");
        setSnackbarOpen(true);
        return;
      } finally {
        setIsFileUploading(false);
        setOpenModal(false);
        setFileToUpload(null);
        setPreviewFile(null);
      }
    }

    try {
      await sendMessage({
        receiverId: selectedChat.userId,
        text: message.text || "",
        imageUrl: uploadPhotoResponse
          ? uploadPhotoResponse.uploadResponse?.secure_url
          : null,
        videoUrl: uploadVideoResponse
          ? uploadVideoResponse.uploadResponse?.secure_url
          : null,
        cloudinaryImagePublicId: uploadPhotoResponse
          ? uploadPhotoResponse?.uploadResponse?.public_id
          : null,
        cloudinaryVideoPublicId: uploadVideoResponse
          ? uploadVideoResponse?.uploadResponse?.public_id
          : null,
      }).unwrap();

      if (socket) {
        socket.emit("new message", {
          sender: currentUserId,
          receiver: selectedChat.userId,
          text: message.text || "",
          msgByUserId: currentUserId,
        });
      }

      setMessage({ text: "", imageUrl: "", videoUrl: "" });
      refetch();
    } catch (error) {
      console.error("Message sending failed:", error);
      setSnackbarMessage(
        "Ocorreu um erro ao enviar. Por favor tente novamente."
      );
      setSnackbarOpen(true);
    }
  };

  return (
    <Box
      sx={{
        width: "100%",

        p: "1.5rem",
        backgroundColor: theme.palette.background.default,
        flexDirection: "column",
      }}
    >
      {/* Header with chat info */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          mb: 4,
          borderBottom: `1px solid ${theme.palette.divider}`,
          pb: 1,
          width: "100%",
        }}
      >
        <IconButton onClick={handleClickAvatar}>
          <Box>
            <Avatar
              sx={{ width: 56, height: 56 }}
              src={selectedChat.profilePictureUrl}
            />
            {isUserOnline && (
              <Box
                sx={{
                  position: "absolute",
                  bottom: 2,
                  right: 12,
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  backgroundColor: "green",
                  border: "2px solid white",
                }}
              />
            )}
          </Box>
        </IconButton>

        <Box
          sx={{ flexGrow: 1, display: "flex", flexDirection: "column", gap: 1 }}
        >
          <Typography
            variant="h4"
            color={theme.palette.secondary[100]}
            fontWeight="bold"
          >
            {selectedChat.fname} {selectedChat.lname}
          </Typography>
          <Typography variant="body2" color={theme.palette.text.secondary}>
            {isUserOnline ? "Online" : `Offline`}
          </Typography>
        </Box>

        <IconButton onClick={(e) => setAnchorElDeleteChat(e.currentTarget)}>
          <MoreVertIcon fontSize="large" />
        </IconButton>
        <Menu
          anchorEl={anchorElDeleteChat}
          open={Boolean(anchorElDeleteChat)}
          onClose={() => setAnchorElDeleteChat(null)}
        >
          <MenuItem onClick={handleDeleteChat}>
            {isDeletingUserFromSideBar ? "A Eliminar..." : "Eliminar"}
          </MenuItem>
        </Menu>
      </Box>

      {/* Messages container */}
      <Box
        sx={{
          width: "100%",
          overflowY: "auto",
          mb: 2,
          display: "flex",
          flexDirection: "column",
          gap: 1.75,
          height: "550px",
        }}
      >
        {/*  loading or error state */}
        {userMessageLoading && (
          <Typography>
            <Loading />
          </Typography>
        )}
        {userMessageError && (
          <Typography color="error">{userMessageError.message}</Typography>
        )}

        {/*  user MessageData   */}
        {(userMessageData?.length > 0 ? userMessageData : []).map(
          (msg, index) => (
            <Paper
              key={msg.id || index}
              elevation={3}
              sx={{
                p: 1,
                alignSelf:
                  msg.senderId === currentUserId
                    ? "flex-end"
                    : msg.senderId === selectedChat.userId
                    ? "flex-start"
                    : "flex-start",
                bgcolor:
                  msg.senderId === currentUserId
                    ? theme.palette.primary.light
                    : msg.senderId === selectedChat.userId
                    ? theme.palette.grey[200]
                    : theme.palette.grey[300],
                color: msg.senderId === currentUserId ? "white" : "black",
                borderRadius: "8px",
                maxWidth: "75%",
                overflowWrap: "break-word",
                wordBreak: "break-word",
              }}
              ref={index === userMessageData.length - 1 ? currentMessage : null}
            >
              <Typography variant="body1" sx={{ whiteSpace: "normal" }}>
                {expandedMessages.has(msg.id) || msg.text.length <= 30
                  ? msg.text
                  : `${msg.text.substring(0, 60)}...`}
                {msg.text.length > 60 && (
                  <Button
                    onClick={() => toggleExpand(msg.id)}
                    size="small"
                    color="secondary"
                  >
                    {expandedMessages.has(msg.id) ? "Reduzir" : "Ler Mais"}
                  </Button>
                )}
              </Typography>
              {msg.imageUrl && (
                <img
                  src={msg.imageUrl}
                  alt="User uploaded"
                  style={{ width: "100%", borderRadius: "8px" }}
                />
              )}
              {msg.videoUrl && (
                <video
                  controls
                  style={{ width: "100%", borderRadius: "8px" }}
                  src={msg.videoUrl}
                />
              )}
              <Typography
                variant="caption"
                color={msg.senderId === currentUserId ? "white" : "black"}
              >
                {moment(msg.createdAt).fromNow()}
              </Typography>
            </Paper>
          )
        )}
      </Box>

      {/* Message input area */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          width: "100%",
        }}
      >
        <IconButton
          onClick={(e) => setAnchorElUpload(e.currentTarget)}
          color="white"
        >
          <AddIcon />
        </IconButton>
        <Menu
          anchorEl={anchorElUpload}
          open={Boolean(anchorElUpload)}
          onClose={() => setAnchorElUpload(null)}
        >
          <MenuItem component="label">
            Upload File
            <input type="file" hidden onChange={handleFileChange} />
          </MenuItem>
        </Menu>
        <TextField
          variant="outlined"
          fullWidth
          placeholder="Escreve uma mensagem..."
          value={message.text}
          onChange={handleTextChange}
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
        />
        <IconButton
          onClick={handleSendMessage}
          disabled={isLoading || !message.text}
          color="white"
        >
          <SendOutlinedIcon />
        </IconButton>
      </Box>

      {/* Modal  file preview */}
      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          {fileType === "image" ? (
            <img
              src={previewFile}
              alt="Preview"
              style={{ width: "100%", borderRadius: "8px" }}
            />
          ) : (
            <video
              controls
              style={{ width: "100%", borderRadius: "8px" }}
              src={previewFile}
            />
          )}
          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
            <Button variant="outlined" onClick={() => setOpenModal(false)}>
              Cancelar
            </Button>
            <Button
              variant="contained"
              onClick={handleSendMessage}
              disabled={isFileUploading || isUploadingPhoto}
            >
              {isUploadingPhoto ? "A Enviar..." : "Enviar"}
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Snackbar  */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
      />
    </Box>
  );
};

export default ChatWindow;
