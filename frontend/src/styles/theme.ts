import { createTheme, PaletteMode} from '@mui/material';


const getTheme = (mode: PaletteMode) =>
  createTheme({
    palette: {
      mode, // Dynamically set mode ('light' or 'dark')
      background: {
        default: mode === "dark" ? "#121212" : "#F5F5F5",
        paper: mode === "dark" ? "#1E1E1E" : "#FFFFFF",
      },
      primary: {
        main: mode === "dark" ? "#BB86FC" : "#6200EE",
        contrastText: "#FFFFFF",
      },
      secondary: {
        main: mode === "dark" ? "#03DAC6" : "#018786",
        contrastText: mode === "dark" ? "#000000" : "#FFFFFF",
      },
      text: {
        primary: mode === "dark" ? "#FFFFFF" : "#212121",
        secondary: mode === "dark" ? "#B0B0B0" : "#757575",
        disabled: mode === "dark" ? "#666666" : "#BDBDBD",
      },
      divider: mode === "dark" ? "#333333" : "#E0E0E0",
    },
    typography: {
      fontFamily: "Roboto, Arial, sans-serif",
      h1: { fontSize: "2.5rem", fontWeight: 600, color: mode === "dark" ? "#FFFFFF" : "#212121" },
      h2: { fontSize: "2rem", fontWeight: 500, color: mode === "dark" ? "#FFFFFF" : "#212121" },
      body1: { fontSize: "1rem", color: mode === "dark" ? "#E0E0E0" : "#424242" },
      body2: { fontSize: "0.875rem", color: mode === "dark" ? "#B0B0B0" : "#757575" },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: "8px",
            textTransform: "none",
            "&:hover": {
              backgroundColor: mode === "dark" ? "#985EFF" : "#a574fc",
            },
          },
          contained: {
            boxShadow: mode === "dark" ? "0px 4px 6px rgba(0, 0, 0, 0.2)" : "0px 2px 4px rgba(0, 0, 0, 0.1)",
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: mode === "dark" ? "#1E1E1E" : "#FFFFFF",
            borderRadius: "12px",
            boxShadow: mode === "dark" ? "none" : "0px 2px 8px rgba(0, 0, 0, 0.1)",
          },
        },
      },
    },
  });

export default getTheme;