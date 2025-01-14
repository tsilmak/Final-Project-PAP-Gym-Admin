import * as React from "react";
import { useState } from "react";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import Header from "components/common/Header";
import {
  useGetAllUserFromGymPlanIdQuery,
  useGetGymPlanByIdQuery,
} from "state/api";
import Loading from "components/common/Loading";
import ErrorOverlay from "components/common/ErrorOverlay";
import { useNavigate, useParams } from "react-router-dom";
import { Box, Button, Tooltip } from "@mui/material";
import SearchBar from "components/common/SearchBar";
import { useTheme } from "@emotion/react";

export default function UserListByGymPlan() {
  const { id: gymPlanId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();

  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: gymPlanData,
    isLoading: isGymPlanLoading,
    error: gymPlanError,
  } = useGetGymPlanByIdQuery(gymPlanId);

  const planName = gymPlanData?.data?.name;

  const {
    data: usersData,
    isLoading: isUsersLoading,
    error: usersError,
  } = useGetAllUserFromGymPlanIdQuery(gymPlanId);

  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 6;
  const totalUsers = usersData?.data.length;

  const currentUsers = usersData?.data
    .filter((user) =>
      `${user.fname} ${user.lname}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    )
    .slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

  const handleNextPage = () => {
    if ((currentPage + 1) * itemsPerPage < totalUsers) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  if (isGymPlanLoading || isUsersLoading) return <Loading />;
  if (gymPlanError || usersError)
    return (
      <ErrorOverlay
        error={gymPlanError || usersError}
        dataName={usersError ? "Os clientes associados" : "O plano de ginásio"}
      />
    );

  return (
    <>
      <Header title={`Listagem de Clientes para: "${planName}"`} />
      <List
        dense
        sx={{
          maxWidth: 750,
          mx: "auto",
          borderRadius: "10px",
          mt: 5,
        }}
      >
        <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

        {currentUsers?.map((user) => (
          <Box key={user.userId} sx={{ mb: 2 }}>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => navigate(`/users/${user.userId}`)}
                sx={{
                  borderRadius: "10px",
                  transition: "background-color 0.3s ease",
                  boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
                  backgroundColor: theme.palette.primary.main,
                }}
              >
                <ListItemAvatar>
                  <Avatar
                    src={user.profilePictureUrl}
                    alt={user.fname}
                    sx={{ width: 56, height: 56 }}
                  />
                </ListItemAvatar>
                <ListItemText
                  id={user.userId}
                  primary={`${user.fname} ${user.lname}`}
                  secondary={user.email}
                  sx={{
                    textAlign: "center",
                    "& .MuiTypography-body2": {
                      fontSize: "0.9rem",
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
            <hr />
          </Box>
        ))}
        {/* Pagination buttons */}
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
          <Tooltip title={currentPage === 0 ? "Está na primeira página" : ""}>
            <span>
              <Button
                variant="outlined"
                onClick={handlePrevPage}
                disabled={currentPage === 0}
              >
                Anterior
              </Button>
            </span>
          </Tooltip>

          <Tooltip
            title={
              (currentPage + 1) * itemsPerPage >= totalUsers
                ? "Está na última página"
                : ""
            }
          >
            <span>
              <Button
                variant="outlined"
                onClick={handleNextPage}
                disabled={(currentPage + 1) * itemsPerPage >= totalUsers}
              >
                Próximo
              </Button>
            </span>
          </Tooltip>
        </Box>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate(-1)}
          sx={{ mt: 2 }}
        >
          Voltar
        </Button>
      </List>
    </>
  );
}
