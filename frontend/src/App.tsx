//@ts-check
import React, {useState} from "react";
import axios from "axios";
import Button from '@mui/material/Button';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Switch from '@mui/material/Switch';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider, PaletteMode} from '@mui/material';
import "./App.css";

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


// Function to handle input change for time
export function handleChange(e: { target: { value: string; }; }) {
  let value = e.target.value.replace(/[^0-9]/g, ""); // Remove non-numeric characters except :
  // Add colon at appropriate positions
  if (value.length > 2 && value.length <= 3) {
    value = value.slice(0, 1) + ":" + value.slice(1, 3);
  } else if (value.length > 3 && value.length <= 4) {
    value = value.slice(0, 2) + ":" + value.slice(2);
  } else if (value.length > 4 && value.length <= 5) {
    value = value.slice(0, 1) + ":" + value.slice(1, 3) + ":" + value.slice(3, 5);
  } else if (value.length > 5) {
    value = value.slice(0, 2) + ":" + value.slice(2, 4) + ":" + value.slice(4, 8);
  }
  return value;
}

function App() {
  const [lastUpdated, setLastUpdated] = useState("");
  const [pace, setPace] = useState("");
  const [time, setTime] = useState("");
  const [isMiles, setIsMiles] = useState(true);
  const [raceDistance, setRaceDistance] = useState("Marathon");
  const [error, setError] = useState("");
  const [mode, setMode] = useState<PaletteMode>("light"); // 'light' or 'dark'

  const handleThemeToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMode(event.target.checked ? "dark" : "light"); // Toggle theme mode
  };

  const theme = getTheme(mode);

  const reset = () => {
    setError(""); // Clear previous errors
    setTime("");
    setRaceDistance("");
    setPace("");
    setLastUpdated("");
  };

  const calculate = () => {
    if (lastUpdated === "time") {
      fetchPace();
    } else if (lastUpdated === "pace") {
      fetchTime();
    } else if (pace === "") {
      fetchPace();
    } else if (time === "") {
      fetchTime();
    }
  };

  // Calculate Pace
  const fetchPace = () => {
    setError(""); // Clear previous errors
    const encodedTime = encodeURIComponent(time)
    const encodedDistance = encodeURIComponent(raceDistance)
    let unit;
    if (isMiles) {
      unit = "mi";
    } else {
      unit = "km";
    }
    axios.get(`http://127.0.0.1:8000/race_pace?finish_time=${encodedTime}&unit=${unit}&distance=${encodedDistance}`)
    .then(
      response => {
        const paceData = `${response.data.pace}`
        setPace(paceData); 
      }
    )
    .catch(err => {
      console.error("Error fetching data:", err);
      setError("Failed to fetch pace.")
    });
  };

  // Calculate Time
  const fetchTime = () => {
    setError(""); // Clear previous errors
    const encodedPace = encodeURIComponent(pace)
    const encodedDistance = encodeURIComponent(raceDistance)
    let unit;
    if (isMiles) {
      unit = "mi";
    } else {
      unit = "km";
    }
    axios.get(`http://127.0.0.1:8000/race_time?pace=${encodedPace}&unit=${unit}&distance=${encodedDistance}`)
    .then(
      response => {
        const timeData = `${response.data.time}`
        setTime(timeData);
      }
    )
    .catch(err => {
      console.error("Error fetching data:", err);
      setError("Failed to fetch time")
    });
  }

  const formatTime = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTime(handleChange(e))
    setLastUpdated("time")
    
  }

  const distances = [
    {
      value: '5K',
      label: '5K'
    },
    {
      value: '10K',
      label: '10K'
    },
    {
      value: 'Half Marathon',
      label: 'Half Marathon'
    },
    {
      value: 'Marathon',
      label: 'Marathon'
    }
  ]

  const formatPace = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPace(handleChange(e))
    setLastUpdated("pace")
  }

  const switchUnit = () => {
    setIsMiles((prevState) => !prevState)
  };

  return (
    <ThemeProvider theme={theme}>
    <Box
      sx={{
        display: "flex",
        height:"100vh",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        color: "text.primary",
        borderRadius: 1,
        p: 3
      }}
    > 
      <Stack spacing={0.15} sx={{alisgnItems: "left"}}>
        <header>
            <h1>{"Marathon Training Planner"}</h1>
        </header>
        <FormControl sx={{p:2, m:1, minWidth:25 }}>
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
      </Stack>

        {/* Pace-calculator"*/}
        <Box
          component="form"
          sx={{ m:15,
                p: 2,
                width: "25ch",
                border: "1px solid grey",
                bgcolor: "background.paper",
                boxShadow: 1,
                borderRadius: 2
              }}
        >
        <Stack spacing={2}>
          {/* Dropdown to select a race type */}
          <FormControl sx={{ m:1, minWidth:250 }}>
            <TextField
              id="race-distance-select"
              select
              label="Select a Race Distance"
              value={raceDistance}
              onChange={(e) => setRaceDistance(e.target.value)} // Trigger data fetch on change
            >
              {
                distances.map(
                  (option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                ))
              }
            </TextField>
          </FormControl>

          {/* Input Finish Time */}
          <FormControl sx={{ m:1, minWidth:250 }}>
            <TextField
              id="finish-time-text-field"
              label="Time (hh:mm:ss)"
              value={time}
              onChange={formatTime}
            >
            </TextField>
          </FormControl>

          <Stack direction="row" spacing={1} sx={{ alignItems: "center"}}>
            {/* Input Pace */}
            <FormControl sx={{ m:1, maxWidth: 170 }}>
              <TextField
                id="pace-text-field"
                label="Pace (mm:ss)"
                value={pace}
                onChange={formatPace}
              >
              </TextField>
            </FormControl>
            {/* Switch between mi/km */}
            <Stack direction="row" spacing={0.02} sx={{ alignItems: "center"}}>
              <Typography variant="caption" color="text.primary" sx={{ fontSize: "15px"}}>
                km
              </Typography>
              <Switch 
                defaultChecked
                onChange={switchUnit}
                size="small"
              />
              <Typography variant="caption" color="text.primary" sx={{ fontSize: "15px"}}>
                mi
              </Typography>
            </Stack>
          </Stack>
          
          <Stack direction="row" spacing={1} sx={{ alignItems: "center"}}>
            {/* Button to Trigger GET Request */}
            <Button variant="contained"
              onClick={calculate}
              sx={{
                fontWeight: "bold"
              }}
              >🏃 Calculate </Button>
            {/* Button to Clear User Input */}
            <Button 
              variant="outlined"
              onClick={reset}
              startIcon={<RestartAltIcon />}
              sx={{
                fontWeight: "bold"
              }}
            >
              Reset
            </Button>
          </Stack>

          {/* Error Message */}
          {error && <p style={{ color: "red" }}>{error}</p>}
          </Stack>
          </Box>
    </Box>
    </ThemeProvider>
  );
}

export default App;
