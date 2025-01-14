import { Search } from "@mui/icons-material";
import { Box, IconButton, InputBase } from "@mui/material";
import React from "react";

const SearchBar = ({ searchQuery, setSearchQuery, width }) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        backgroundColor: (theme) => theme.palette.background.alt,
        borderRadius: "15px",
        p: "0.1rem 1.5rem",
        ml: "5rem",
        mr: "5rem",
        mb: "1.5rem",
        width: width, //Width for the SignatureById Page
        mx: { xs: "1rem", md: "5rem" },
      }}
    >
      <InputBase
        placeholder="Procurar..."
        value={searchQuery}
        onChange={(event) => setSearchQuery(event.target.value)}
        fullWidth
      />
      <IconButton>
        <Search />
      </IconButton>
    </Box>
  );
};

export default SearchBar;
