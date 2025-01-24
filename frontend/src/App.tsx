//@ts-check
import React, {useState} from "react";
import CssBaseline from "@mui/material/CssBaseline";
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import Switch from '@mui/material/Switch';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import AppBar from '@mui/material/AppBar';
import Toolbar from "@mui/material/Toolbar";
import Calculator from "./components/Calculator";
import Workouts from "./components/Workouts";
import { TabPanel } from "./components/TabPanel";
import { ThemeProvider, PaletteMode} from '@mui/material';
import getTheme from "./styles/theme";


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
        p: 3,
        m: 5
      }}
    > 
        {/* Pace-calculator"*/}
        <TabPanel value={value} index={0}>
          <Calculator />
        </TabPanel>
        {/* Workout Builder"*/}
        <TabPanel value={value} index={1}>
          <Workouts />
        </TabPanel>
    </Box>
    </ThemeProvider>
  );
}

export default App;