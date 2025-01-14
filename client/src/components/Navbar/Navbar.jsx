import React, { useState } from "react";
import {
  LightModeOutlined,
  DarkModeOutlined,
  Menu as MenuIcon,
  SettingsOutlined,
  ArrowDropDownOutlined,
} from "@mui/icons-material";
import FlexBetween from "components/common/FlexBetween";
import { useDispatch, useSelector } from "react-redux";
import { setMode, setSideBar } from "state/globalSlice";
import {
  AppBar,
  IconButton,
  Toolbar,
  useTheme,
  Button,
  Box,
  Typography,
  Menu,
  MenuItem,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useLogoutMutation } from "state/api";
import { logOut } from "state/authSlice";

const Navbar = ({ user, fname, lname, role, profilePicture }) => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const isOpen = Boolean(anchorEl);
  const [logout] = useLogoutMutation();

  // Get the sidebar state from Redux
  const isSidebarOpen = useSelector((state) => state.global.isSidebarOpen);
  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleLogout = async () => {
    try {
      await logout().unwrap();
      dispatch(logOut()); // Clear the auth state in Redux
      navigate("/login");
    } catch (error) {
      dispatch(logOut()); // Clear the auth state in Redux
      navigate("/login");
    }
  };

  return (
    <AppBar
      sx={{
        position: "fixed",
        background: "none",
        boxShadow: "none",
        transition: "width 0.3s",
        width: `calc(100% - ${isSidebarOpen ? "250px" : "0"})`,
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between", padding: 0 }}>
        {/* LEFT SIDE */}
        <FlexBetween flexGrow={1}>
          <IconButton
            onClick={() => dispatch(setSideBar(!isSidebarOpen))}
            sx={{ ml: "1.35rem" }}
          >
            <MenuIcon />
          </IconButton>
        </FlexBetween>

        {/* RIGHT SIDE */}
        <FlexBetween gap="1.5rem">
          <IconButton onClick={() => dispatch(setMode())}>
            {theme.palette.mode === "dark" ? (
              <DarkModeOutlined sx={{ fontSize: "25px" }} />
            ) : (
              <LightModeOutlined sx={{ fontSize: "25px" }} />
            )}
          </IconButton>
          <IconButton>
            <SettingsOutlined sx={{ fontSize: "25px" }} />
          </IconButton>

          <FlexBetween>
            <Button
              onClick={handleClick}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                textTransform: "none",
                gap: "1rem",
              }}
            >
              <Box
                component="img"
                alt="profile"
                src={profilePicture}
                height="32px"
                width="32px"
                borderRadius="50%"
                sx={{ objectFit: "cover" }}
              />
              <Box textAlign="left">
                <Typography
                  fontWeight="bold"
                  fontSize="0.85rem"
                  sx={{ color: theme.palette.secondary[100] }}
                >
                  {`${fname} ${lname}`}
                </Typography>
                <Typography
                  fontSize="0.75rem"
                  sx={{ color: theme.palette.secondary[200] }}
                >
                  {role}
                </Typography>
              </Box>
              <ArrowDropDownOutlined
                sx={{ color: theme.palette.secondary[300], fontSize: "25px" }}
              />
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={isOpen}
              onClose={handleClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
              <MenuItem onClick={handleLogout}>Terminar Sessão</MenuItem>
            </Menu>
          </FlexBetween>
        </FlexBetween>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
