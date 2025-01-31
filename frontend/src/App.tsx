//@ts-check
import React, {useState} from "react";
import axios from "axios";
import { handleTimeInput } from "./utils/inputValidation";
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
  const [pace, setPace] = useState<string>("");

  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setValue(newValue);
  };
  const handleThemeToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMode(event.target.checked ? "dark" : "light"); // Toggle theme modeap
  };

  const theme = getTheme(mode);

  const formatPace = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setPace(handleTimeInput(event))
  }

  // Calculate Pace
  const fetchPace = async (time: string, raceDistance: string, otherDistance: string, paceUnit: "mi" | "km") => {
    const encodedTime = encodeURIComponent(time)
    const distanceMapping = {
      '800M': 800,
      '1600M': 1600,
      '5K': 5000,
      '10K': 10000,
      'Half Marathon': 21097.5,
      'Marathon': 42195,
      'Other': 0
    }
    const MetersToMiles = (distance:number) => {
      if (paceUnit === "mi") {
        return distance * 0.000621371
      } else {
        return distance * 0.001
      }
    }
    let mappedDistance;
    let encodedDistance;
    if (raceDistance === "Other") {
      encodedDistance = encodeURIComponent(Number(otherDistance))
    } else {
      mappedDistance = distanceMapping[raceDistance as keyof typeof distanceMapping]
      encodedDistance = encodeURIComponent(MetersToMiles(mappedDistance))
    }
    try {
    const response = await axios.get(`http://127.0.0.1:8000/race_pace?finish_time=${encodedTime}&distance=${encodedDistance}`)
    return response.data.pace;
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

   // Reset function to clear the pace
  const resetPace = () => {
    setPace(""); // Reset pace value
  };



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
              <Tab label="Calendar" />
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
        m: 10,
        width: "80%", // Adjust width as needed
        maxWidth: "1200px", // Optional: Set a max width
        flexGrow: 1 // Ensures it grows within its container
      }}
    > 
        {/* Pace-calculator"*/}
        <TabPanel value={value} index={0}>
          <Calculator pace={pace} fetchPace={fetchPace} setPace={setPace} resetPace={resetPace} formatPace={formatPace}/>
        </TabPanel>
        {/* Workout Builder"*/}
        <TabPanel value={value} index={1}>
          {/* <Calendar /> */}
          pace:{pace}
        </TabPanel>
    </Box>
    </ThemeProvider>
  );
}

export default App;