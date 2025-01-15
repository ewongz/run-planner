//@ts-check
import React, {useState} from "react";
import axios from "axios";
import Button from '@mui/material/Button';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import CssBaseline from "@mui/material/CssBaseline";
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Switch from '@mui/material/Switch';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import AppBar from '@mui/material/AppBar';
import Toolbar from "@mui/material/Toolbar";
import { createTheme, ThemeProvider, PaletteMode} from '@mui/material';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { handleTimeInput } from "./utils/inputValidation";
import Calculator from "./components/Calculator";
import { TabPanel } from "./components/TabPanel";

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

function App() {
  const [mode, setMode] = useState<PaletteMode>("light"); // 'light' or 'dark'
  const [value, setValue] = React.useState(0);
  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setValue(newValue);
  };
  const handleThemeToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMode(event.target.checked ? "dark" : "light"); // Toggle theme mode
  };

  const theme = getTheme(mode);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar
          position="static"
          color="default"
        >
        <Toolbar sx={{
          m:1,
          p:1
        }}>
          <Typography
            variant="h6" 
            color="text.primary"
            sx={{
              mr: 8
            }}
            >Marathon Training Planner
          </Typography>
          <Tabs
            value={value}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            sx={{
              flexGrow: 1
            }}
            >
              <Tab label="Calculator" />
              <Tab label="Workouts" />
          </Tabs>
          <FormControl sx={{ p:2, m:1, minWidth:25 }}>
            {/* Switch between themes */}
            <Stack direction="row" spacing={0.02} sx={{ alignItems: "center"}}>
              <Typography variant="caption" color="text.primary" sx={{ fontSize: "15px"}}>
                Light
              </Typography>
              <Switch
                onChange={handleThemeToggle}
                size="small"
              />
              <Typography variant="caption" color="text.primary" sx={{ fontSize: "15px"}}>
                Dark
              </Typography>
            </Stack>
          </FormControl>
        </Toolbar>
      </AppBar>

    
    <Box
      sx={{
        display: "flex",
        height:"100vh",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        color: "text.primary",
        p: 3
      }}
    > 
        {/* Pace-calculator"*/}
        <TabPanel value={value} index={0}>
          <Calculator />
        </TabPanel>
    </Box>
    </ThemeProvider>
  );
}

export default App;
