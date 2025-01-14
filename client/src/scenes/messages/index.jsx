import React, { useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  InputBase,
  Avatar,
  Modal,
  Divider,
  CardActionArea,
  CardContent,
} from "@mui/material";
import { Search } from "@mui/icons-material";
import AddCommentIcon from "@mui/icons-material/AddComment";
import AnnouncementIcon from "@mui/icons-material/Announcement";
import { useTheme } from "@emotion/react";
import useMediaQuery from "@mui/material/useMediaQuery";
import { FixedSizeList } from "react-window";
import MessageCard from "./MessageCard";
import ChatWindow from "./ChatWindow";
import { useGetUsersQuery } from "state/api";
import { useGetChatListQuery, useCreateConversationMutation } from "state/api";
import { useSelector } from "react-redux";
import Loading from "components/common/Loading";
import ErrorOverlay from "components/common/ErrorOverlay";
import { useDeleteUserFromSideBarMutation } from "state/api";
import useWebSocket from "hooks/usewebSocket";
import moment from "moment";
import { selectCurrentUser } from "state/authSlice";

const MessagesPages = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const socket = useWebSocket();
  const usersOnline = useSelector((state) => state.global.usersOnline);

  const [selectedChat, setSelectedChat] = useState(null);

  const [newConversationModal, setNewConversationModal] = useState(false);

  const user = useSelector(selectCurrentUser);

  const userId = user ? user.userId : null;
  const [deleteUserFromSideBar, { isLoading: isDeletingUserFromSideBar }] =
    useDeleteUserFromSideBarMutation();

  const {
    data: userByIdData,
    isLoading: userByIdDataLoading,
    error: userByIdDataError,
  } = useGetUsersQuery();
  const onlineUsersFromState = useSelector((state) => state.onlineUsers.users);

  const onlineUsers = userByIdData
    ? userByIdData
        .filter(
          (user) => usersOnline?.includes(user.userId) && user.userId !== userId
        )
        .sort(() => 0.5 - Math.random())
        .slice(0, 4)
    : [];

  const {
    data: userData,
    isLoading: userDataLoading,
    error: userDataError,
  } = useGetUsersQuery();
  const {
    data: chatList,
    isLoading: userchatListLoading,
    error: userchatListError,
    refetch: refetchChatList,
  } = useGetChatListQuery();
  const [updateChatList] = useCreateConversationMutation();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchQueryChat, setSearchQueryChat] = useState("");

  const chatUserIds = Array.isArray(chatList)
    ? chatList.map((chat) => chat.userId)
    : [];

  const handleChatDelete = async () => {
    try {
      await deleteUserFromSideBar({
        userIdToDelete: selectedChat.userId,
      }).unwrap();

      refetchChatList();
      setSelectedChat(null);
    } catch (error) {
      console.error("Failed to :", error);
    }
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };
  const handleSearchChangeChat = (event) => {
    setSearchQuery(event.target.value);
  };
  const filteredUsers = userData
    ? userData.filter((user) => {
        const fullName = `${user.fname} ${user.lname}`.toLowerCase();
        const matchesSearchQuery =
          fullName.includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.membershipNumber.includes(searchQuery);

        const isInChatList = chatUserIds?.includes(user.userId);

        return matchesSearchQuery && !isInChatList;
      })
    : [];
  const handleChatClick = (chat) => setSelectedChat(chat);

  const filteredUsersInChat = userData
    ? userData.filter((user) => {
        const fullName = `${user.fname} ${user.lname}`.toLowerCase();
        const matchesSearchQuery =
          fullName.includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.membershipNumber.includes(searchQuery);

        return matchesSearchQuery && chatUserIds.includes(user.userId);
      })
    : [];

  const handleAddUserToChat = async (user) => {
    try {
      await updateChatList({ userIdToAdd: user.userId }).unwrap();
      refetchChatList();
    } catch (error) {
      console.error("Failed to add user to chat list:", error);
    }
  };

  if (userDataLoading || userchatListLoading) return <Loading />;
  if (userDataError || userchatListError)
    return (
      <ErrorOverlay
        error={userDataError || userchatListError}
        dataName={
          userchatListError
            ? "Carregar as suas mensagens"
            : "Carregar os seus dados"
        }
      />
    );

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        mt: isMobile ? "2rem" : "4.05rem",
      }}
    >
      {/* Left panel: Chat list */}
      <Box
        sx={{
          ml: isMobile ? 0 : "5rem",
          width: isMobile ? "100%" : "25%",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box>
            <Typography
              variant={"h2"}
              color={theme.palette.secondary[100]}
              fontWeight="bold"
              sx={{ mb: "0.25rem" }}
            >
              Mensagens
            </Typography>
            <Typography
              variant={"h5"}
              color={theme.palette.secondary[300]}
              sx={{ mb: "1.5rem" }}
            >
              Converse com os seus clientes ou funcionários
            </Typography>
          </Box>
          <IconButton
            onClick={() => setNewConversationModal(true)}
            aria-label="Adicionar uma nova conversa"
            title="Adicionar uma nova conversa"
          >
            <AddCommentIcon fontSize="large" />
          </IconButton>
        </Box>

        {/* Modal for searching new users */}
        <Modal
          open={newConversationModal}
          onClose={() => setNewConversationModal(false)}
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              width: isMobile ? "90%" : 500,
              height: isMobile ? "60%" : 800,
              padding: 2,
              backgroundColor: theme.palette.background.alt,
              borderRadius: 2,
              boxShadow: 24,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <Box sx={{ display: "flex", width: "100%", mb: 2 }}>
              <InputBase
                placeholder="Procure pelo nome, email ou número de cliente."
                fullWidth
                value={searchQuery}
                onChange={handleSearchChange}
                sx={{
                  border: "1px solid",
                  borderColor: "white",
                  borderRadius: 1,
                  padding: 1,
                }}
              />
              <IconButton>
                <Search />
              </IconButton>
            </Box>
            {searchQuery === "" &&
            (onlineUsers.length === 0 ||
              onlineUsers.every((user) =>
                chatUserIds.includes(user.userId)
              )) ? (
              <Typography variant="h6" color="secondary">
                Pesquise para começar
              </Typography>
            ) : searchQuery !== "" && filteredUsers.length === 0 ? (
              <Typography variant="h6" color="secondary">
                Não foi encontrado nenhum resultado. Verifique se já está na sua
                caixa de mensagens ou se escreveu corretamente
              </Typography>
            ) : (
              (searchQuery === "" ? onlineUsers : filteredUsers)
                .filter(
                  (user) =>
                    user &&
                    !chatUserIds.includes(user.userId) &&
                    user.userId !== userId
                )
                .slice(0, 4)
                .map((user) => (
                  <CardActionArea
                    key={user.userId}
                    onClick={() => handleAddUserToChat(user)}
                    sx={{
                      borderRadius: 2.5,
                      backgroundColor: "transparent",
                      "&:hover": {
                        backgroundColor: theme.palette.primary.main,
                      },
                      mb: 1,
                    }}
                  >
                    <CardContent
                      sx={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 2,
                      }}
                    >
                      <Box
                        sx={{ position: "relative", display: "inline-block" }}
                      >
                        <Avatar
                          src={user.profilePictureUrl}
                          sx={{ width: 50, height: 50 }}
                        />
                        {/* Check if userId is in onlineUsers */}

                        {onlineUsersFromState.includes(user.userId) && (
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
                      <Divider orientation="vertical" />
                      <Box>
                        <Typography variant="h5">
                          {user.fname + " " + user.lname}
                        </Typography>
                        <Typography variant="h6" color="secondary">
                          Email: {user.email}
                        </Typography>
                        <Typography variant="h6" color="secondary">
                          Número de cliente: {user.membershipNumber}
                        </Typography>
                        <Typography variant="h6" color="secondary">
                          Função: {user.role.rolesName}
                        </Typography>
                      </Box>
                    </CardContent>
                    <Divider />
                  </CardActionArea>
                ))
            )}
          </Box>
        </Modal>
        {/* TODO FAZER A PESQUISAR POR UTILIZADORES NO */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            backgroundColor: theme.palette.background.alt,
            borderRadius: 1.5,
            p: "0.1rem 1rem",
            gap: "0.5rem",
            mb: "0.5rem",
          }}
        >
          <IconButton>
            <Search />
          </IconButton>
          <InputBase
            placeholder="Procurar..."
            fullWidth
            value={searchQueryChat}
            onChange={handleSearchChangeChat}
          />
        </Box>

        {/* Chat List */}
        <Box
          sx={{
            overflow: "auto",
            backgroundColor: theme.palette.background.alt,
            scrollbarColor: `${theme.palette.secondary.main} ${theme.palette.background.default}`,
          }}
        >
          <FixedSizeList
            height={isMobile ? 400 : 600}
            itemSize={100}
            width="100%"
            itemCount={chatList?.length}
          >
            {({ index, style }) => {
              const chat = chatList[index];

              if (!chat) return null;
              const lastMessage = chat.lastMessage || {};
              const isSentByCurrentUser = lastMessage.senderId === userId;
              // Check if fname, lname, email, and membershipNumber exist
              const fullName =
                chat.fname && chat.lname ? `${chat.fname} ${chat.lname}` : "";
              const email = chat.email || "";
              const membershipNumber = chat.membershipNumber || "";

              // Filtering based on search query
              if (
                searchQueryChat &&
                !(
                  fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  membershipNumber.includes(searchQuery)
                )
              ) {
                return null; // Skip rendering if chat doesn't match search
              }

              return (
                <Box onClick={() => handleChatClick(chat)} style={style}>
                  <MessageCard
                    isSentByCurrentUser={isSentByCurrentUser}
                    userId={chat.userId}
                    fname={chat.fname}
                    lname={chat.lname}
                    lastMessage={chat.lastMessage?.text}
                    lastMessageTime={
                      chat.lastMessage
                        ? `Enviada ${moment(
                            chat.lastMessage.updatedAt
                          ).fromNow()}`
                        : ""
                    }
                    profilePicture={chat.profilePictureUrl || ""}
                    selected={selectedChat?.userId === chat.userId}
                    isMobile={isMobile}
                  />
                </Box>
              );
            }}
          </FixedSizeList>
        </Box>
      </Box>

      {/* Right panel: Chat window */}
      {selectedChat ? (
        <ChatWindow
          selectedChat={selectedChat}
          handleDeleteChat={handleChatDelete}
          currentUserId={userId}
          socket={socket}
          isDeletingUserFromSideBar={isDeletingUserFromSideBar}
          isUserOnline={onlineUsersFromState.includes(
            String(selectedChat.userId)
          )}
        />
      ) : (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: isMobile ? "2rem" : "5rem",
            width: isMobile ? "100%" : "70%",
            textAlign: "center",
            gap: "0.25rem",
          }}
        >
          <AnnouncementIcon
            sx={{
              fontSize: "6rem",
              mb: "1rem",
              color: theme.palette.secondary[500],
            }}
          />
          <Typography
            variant="h1"
            color={theme.palette.secondary[100]}
            fontWeight="bold"
            sx={{ mb: "0.25rem" }}
          >
            Nenhuma Conversa
          </Typography>
          <Typography
            variant="h4"
            color={theme.palette.secondary[300]}
            sx={{ mb: "1.5rem" }}
          >
            Selecione uma conversa para começar
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default MessagesPages;
