import React, { useEffect, useState } from "react";
import {
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  useTheme,
} from "@mui/material";
import {
  ChevronLeft,
  ChevronRightOutlined,
  HomeOutlined,
  Groups2Outlined,
  ReceiptLongOutlined,
  PublicOutlined,
  TodayOutlined,
  HowToReg,
  PieChartOutlined,
  SettingsOutlined,
  Message,
  FitnessCenter,
} from "@mui/icons-material";
import BookIcon from "@mui/icons-material/Book";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import BadgeIcon from "@mui/icons-material/Badge";
import { useLocation, useNavigate } from "react-router-dom";
import FlexBetween from "../common/FlexBetween";
import { setSideBar } from "state/globalSlice";
import { useDispatch, useSelector } from "react-redux";
import { selectCurrentUser } from "state/authSlice";

// Navigation items for different roles
const navItemsAdministrador = [
  { text: "Dashboard", icon: <HomeOutlined /> },
  { text: "Gestão de Clientes", icon: null },
  { text: "Form", icon: <HowToReg /> },
  { text: "Users", icon: <Groups2Outlined /> },
  { text: "Assinaturas", icon: <PublicOutlined /> },
  { text: "Pagamentos", icon: <TodayOutlined /> },
  { text: "Gerenciamento", icon: null },
  { text: "Blog", icon: <BookIcon /> },
  { text: "Aulas", icon: <CalendarMonthIcon /> },
  { text: "Planos", icon: <ReceiptLongOutlined /> },
  { text: "Máquinas", icon: <FitnessCenter /> },
  { text: "Exercícios", icon: <FitnessCenter /> },

  { text: "Funcionários", icon: <BadgeIcon /> },
  { text: "Mensagens", icon: <Message /> },
];

const navItemsNutricionista = [
  { text: "Dashboard", icon: <HomeOutlined /> },
  { text: "Clientes", icon: null },
  { text: "Planos de Dieta", icon: <BookIcon /> },
  { text: "Mensagens", icon: <Message /> },
  { text: "Avaliação Nutricional", icon: <Groups2Outlined /> },
  { text: "Monitoramento de Progresso", icon: <PieChartOutlined /> },
  { text: "Blog", icon: <BookIcon /> },
];

const navItemsTreinador = [
  { text: "Aulas", icon: <CalendarMonthIcon /> },
  { text: "Clientes", icon: <Groups2Outlined /> },
  { text: "Mensagens", icon: <Message /> },
  { text: "Blog", icon: <BookIcon /> },
];

// Utility function to get the base path
const getBasePath = (pathname) => {
  const parts = pathname.split("/");
  return parts[1] || ""; // Return the first segment after the initial slash
};

const Sidebar = ({ drawerWidth, isNonMobile }) => {
  const { pathname } = useLocation();
  const [active, setActive] = useState("");
  const navigate = useNavigate();
  const theme = useTheme();

  // Access sidebar state from Redux
  const dispatch = useDispatch();
  const isSidebarOpen = useSelector((state) => state.global.isSidebarOpen);
  const user = useSelector(selectCurrentUser); // Get current user data

  // Set the active route based on the pathname
  useEffect(() => {
    setActive(getBasePath(pathname));
  }, [pathname]);

  // Determine which nav items to show based on user role
  const navItems = (() => {
    switch (user?.role) {
      case "Administrador":
        return navItemsAdministrador;
      case "Nutricionista":
        return navItemsNutricionista;
      case "Treinador":
        return navItemsTreinador;
      default:
        return []; // Return an empty array or a default set of items if needed
    }
  })();

  // Utility function to clean the text for routing
  const cleanText = (text) => {
    return text
      .normalize("NFD") // Normalize the string to decompose characters
      .replace(/[\u0300-\u036f]/g, "") // Remove diacritics (accents)
      .replace(/ /g, "-") // Replace spaces with '-'
      .toLowerCase(); // Convert to lowercase
  };

  return (
    <Box>
      <Box component="nav">
        <Drawer
          open={isSidebarOpen}
          onClose={() => dispatch(setSideBar(false))}
          variant={isNonMobile ? "persistent" : "temporary"}
          anchor="left"
          sx={{
            "& .MuiDrawer-paper": {
              width: 275,
              boxSizing: "border-box",
              backgroundColor: theme.palette.background.alt,
              color: theme.palette.secondary[200],
              borderWidth: isNonMobile ? 0 : "2px",
            },
          }}
        >
          <Box width="100%">
            <Box m="1.5rem 2rem 1.5rem 2rem">
              <FlexBetween
                color={theme.palette.secondary.main}
                sx={{ justifyContent: "center", width: "100%" }}
              >
                <Box>
                  <Typography
                    variant="h3"
                    fontWeight="bold"
                    sx={{ textAlign: "center" }}
                  >
                    Sonder Hub
                  </Typography>
                </Box>
                {!isNonMobile && (
                  <IconButton
                    onClick={() => dispatch(setSideBar(!isSidebarOpen))}
                    sx={{ color: theme.palette.secondary[200] }}
                  >
                    <ChevronLeft />
                  </IconButton>
                )}
              </FlexBetween>
            </Box>
            <List>
              {navItems.map(({ text, icon }) => {
                if (!icon) {
                  return (
                    <Typography key={text} sx={{ m: "2rem 0 1rem 3rem" }}>
                      {text}
                    </Typography>
                  );
                }

                return (
                  <ListItem key={text} disablePadding>
                    <ListItemButton
                      onClick={() => {
                        const cleanedPath = cleanText(text);
                        navigate(`/${cleanedPath}`); // Use the cleanText function to navigate
                        setActive(cleanedPath); // Set the active state
                      }}
                      sx={{
                        backgroundColor:
                          active === cleanText(text)
                            ? theme.palette.secondary[300]
                            : "transparent",
                        color:
                          active === cleanText(text)
                            ? theme.palette.primary[600]
                            : theme.palette.secondary[100],
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          ml: "2rem",
                          color:
                            active === cleanText(text)
                              ? theme.palette.primary[600]
                              : theme.palette.secondary[200],
                        }}
                      >
                        {icon}
                      </ListItemIcon>
                      <ListItemText primary={text} />
                      {active === cleanText(text) && (
                        <ChevronRightOutlined sx={{ ml: "auto" }} />
                      )}
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </Box>
          <Box>
            <Divider />
            <FlexBetween
              textTransform="none"
              gap="1rem"
              m="2rem 3rem 2rem 3rem"
            >
              <Box
                component="img"
                alt="profile"
                src={user?.profilePicture} // Ensure the profile picture is pulled from user state
                height="40px"
                width="40px"
                borderRadius="50%"
                sx={{ objectFit: "cover" }}
              />
              <Box textAlign="left">
                <Typography
                  fontWeight="bold"
                  fontSize="1rem"
                  sx={{ color: theme.palette.secondary[100] }}
                >
                  {`${user?.fname} ${user?.lname}`}{" "}
                  {/* Use user data for name */}
                </Typography>
                <Typography
                  fontSize="0.8rem"
                  sx={{ color: theme.palette.secondary[200] }}
                >
                  {user?.role} {/* Use user data for role */}
                </Typography>
              </Box>
            </FlexBetween>
          </Box>
        </Drawer>
      </Box>
    </Box>
  );
};

export default Sidebar;
