import React from "react";
import { Box, useMediaQuery } from "@mui/material";
import { Outlet } from "react-router-dom";
import Navbar from "components/Navbar/Navbar";
import Sidebar from "components/Sidebar/Sidebar";
import { useSelector, useDispatch } from "react-redux"; // Import dispatch and useSelector
import { setSideBar } from "state/globalSlice"; // Import setSideBar action
import { selectCurrentUser } from "state/authSlice";

const Layout = () => {
  const isNonMobile = useMediaQuery("(min-width: 600px)");
  const dispatch = useDispatch();

  // Access sidebar and userId state from Redux
  const isSidebarOpen = useSelector((state) => state.global.isSidebarOpen);
  const user = useSelector(selectCurrentUser);

  // Toggle sidebar function using Redux
  const toggleSidebar = () => {
    dispatch(setSideBar(!isSidebarOpen)); // Dispatch setSideBar action
  };

  return (
    <Box width="100vw" height="100vh" overflow="hidden">
      <Box display="flex" width="100%" height="100%">
        {/* Sidebar component */}
        <Sidebar
          fname={user?.fname}
          lname={user?.lname}
          role={user?.role}
          profilePicture={user?.profilePicture}
          isNonMobile={isNonMobile}
          isSidebarOpen={isSidebarOpen} // Get from Redux state
          setIsSidebarOpen={toggleSidebar} // Use toggle function
        />

        <Box
          flex="1"
          display="flex"
          flexDirection="column"
          overflow="hidden"
          ml={isSidebarOpen && isNonMobile ? "250px" : "0"}
          transition="margin-left 0.3s"
        >
          {/* Navbar component */}
          <Navbar
            fname={user?.fname}
            lname={user?.lname}
            role={user?.role}
            profilePicture={user?.profilePicture}
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={toggleSidebar}
          />
          <Box flex="1" overflow="auto" p="1rem">
            <Outlet context={{ isSidebarOpen }} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
