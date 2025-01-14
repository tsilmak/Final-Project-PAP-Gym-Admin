import React from "react";
import {
  Box,
  Typography,
  Avatar,
  CardActionArea,
  CardContent,
  Divider,
} from "@mui/material";
import { useTheme } from "@emotion/react";
import { useDispatch, useSelector } from "react-redux";

const MessageCard = ({
  isSentByCurrentUser,
  profilePicture,
  fname,
  lname,
  lastMessage,
  lastMessageTime,
  isMobile,
  selected,
  userId,
}) => {
  const theme = useTheme();
  const onlineUsersFromState = useSelector((state) => state.onlineUsers.users);

  const getFirstWord = (str) => str.split(" ")[0];

  return (
    <CardActionArea
      sx={{
        borderRadius: 2.5,
        backgroundColor: selected ? theme.palette.primary.light : "transparent",
        "&:hover": {
          backgroundColor: theme.palette.primary.main,
        },
      }}
    >
      <Divider />
      <CardContent
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Box sx={{ position: "relative" }}>
          <Avatar sx={{ width: 56, height: 56 }} src={profilePicture} />
          {onlineUsersFromState.includes(String(userId)) && (
            <Box
              sx={{
                position: "absolute",
                bottom: 0,
                right: 0,
                width: 12,
                height: 12,
                borderRadius: "50%",
                backgroundColor: "green",
                border: "2px solid white",
              }}
            />
          )}
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" noWrap>
            {getFirstWord(fname)} {getFirstWord(lname)}
          </Typography>
          <Typography variant="body1" color="secondary" noWrap>
            {isSentByCurrentUser ? "Tu: " : ""}
            {lastMessage
              ? lastMessage.length > 30
                ? `${lastMessage.substring(0, 10)}...`
                : lastMessage
              : "Sem Mensagens"}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {lastMessageTime}
          </Typography>
        </Box>
      </CardContent>
      <Divider />
    </CardActionArea>
  );
};

export default MessageCard;
