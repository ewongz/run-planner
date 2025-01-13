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
import { createTheme, ThemeProvider, PaletteMode, InputAdornment} from '@mui/material';
import { Percent, RowingTwoTone } from "@mui/icons-material";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Global } from "@emotion/react";

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

interface TabPanelProps {
  children?: React.ReactNode;
  index: any;
  value: any;
}

export function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box
          component="form"
          sx={{ m: 3,
                p: 2,
                // width: "25ch",
              }}
        >
          {children}
        </Box>
      )}
    </div>
  );
}

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

export function handlePercentageInput(e: { target: { value: string; }; }) {
  let value = e.target.value.replace(/[^0-9]/g, ""); // Remove non-numeric characters except :
  return value;
}

function App() {
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [pace, setPace] = useState<string>("");
  const [time, setTime] = useState<string>("");
  const [isMiles, setIsMiles] = useState<boolean>(true);
  const [raceDistance, setRaceDistance] = useState<string>("Marathon");
  const [error, setError] = useState<string>("");
  const [mode, setMode] = useState<PaletteMode>("light"); // 'light' or 'dark'
  const [value, setValue] = React.useState(0);
  const [percentage, setPercentage] = useState<string>("90");
  const [workoutPaces, setWorkoutPaces] = useState<[]>([]);

  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setValue(newValue);
  };

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
    setWorkoutPaces([]);
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
        fetchPacePercentages(paceData);
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
        fetchPacePercentages(pace);
      }
    )
    .catch(err => {
      console.error("Error fetching data:", err);
      setError("Failed to fetch time")
    });
  }

  // Calculate Pace Percentages
  const fetchPacePercentages = (pace: string) => {
    setError(""); // Clear previous errors
    const encodedPace = encodeURIComponent(pace)
    axios.get(`http://127.0.0.1:8000/pace_workouts?pace=${encodedPace}&method=pace`)
    .then(
      response => {
        setWorkoutPaces(response.data.workout_paces);
      }
    )
    .catch(err => {
      console.error("Error fetching data:", err);
      setError("Failed to fetch pace.")
    });
  };

  const formatTime = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTime(handleChange(e))
    setLastUpdated("time")
  }

  const formatPace = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPace(handleChange(e))
    setLastUpdated("pace")
  }

  const formatPercentage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPercentage(handlePercentageInput(e))
  }

  const switchUnit = () => {
    setIsMiles((prevState) => !prevState)
  };

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
        <Stack direction="row" spacing={8} sx={{alignItems: "center", justifyContent:"space-evenly"}}>
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
                  inputProps={{
                    maxLength: 8
                  }}
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
                    inputProps={{
                      maxLength: 5
                    }}
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
                  >⏱️ Calculate </Button>
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
              {/* Workout Paces*/}
              <TableContainer component={Paper}>
                <Table sx={{ maxWidth:650 }} size="small">
                  {workoutPaces.length > 0 && (<TableHead>
                    <TableRow>
                      <TableCell align="left">Percentage of Pace</TableCell>
                      <TableCell align="left">Designation</TableCell>
                      <TableCell align="left">Pace Range</TableCell>
                    </TableRow>
                  </TableHead>)}
                  <TableBody>
                    {workoutPaces.map((row) => (
                      <TableRow
                        key={row["Percentage of Pace"]}
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                      >
                        <TableCell align="left">
                          {`${row["Percentage of Pace"]}%`}
                        </TableCell>
                        <TableCell align="left">{row["Designation"]}</TableCell>
                        <TableCell align="left">{row["Pace"]}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Stack>
          </TabPanel>
    </Box>
    </ThemeProvider>
  );
}

export default App;
