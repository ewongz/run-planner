import React, {useState} from "react";
import axios from "axios";
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import FormGroup from '@mui/material/FormGroup';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Switch from '@mui/material/Switch';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import "./App.css";

// Function to handle input change for time
export function handleChange(e) {
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

  const reset = () => {
    setError(""); // Clear previous errors
    setTime("");
    setRaceDistance("");
    setPace("");
    setLastUpdated("");
  };

  const calculate = () => {
    if (lastUpdated === "time") {
      setPace(fetchPace());
    } else if (lastUpdated === "pace") {
      setTime(fetchTime());
    } else if (pace === "") {
      setPace(fetchPace());
    } else if (time === "") {
      setTime(fetchTime());
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

  const formatTime = (e) => {
    setTime(handleChange(e))
    setLastUpdated("time")
    
  }

  const distances = [
    {
      value: '5K',
      label: '5k'
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

  const formatPace = (e) => {
    setPace(handleChange(e))
    setLastUpdated("pace")
  }

  const switchUnit = () => {
    setIsMiles((prevState) => !prevState)
  };

  return (
    <div className="App">
        <header className="App-header">
            <h1>{"Marathon Training Planner"}</h1>
        </header>
        <div className="Pace-calculator">

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
              maxLength={8}>
            </TextField>
          </FormControl>

          <div className="rowC">
            {/* Input Pace */}
            <FormControl sx={{ m:1, maxWidth: 170 }}>
              <TextField
                id="pace-text-field"
                label="Pace (mm:ss)"
                value={pace}
                onChange={formatPace}
                maxLength={6}>
              </TextField>
            </FormControl>
            {/* Switch between mi/km */}
            <Stack direction="row" spacing={0.02} sx={{ alignItems: "center"}}>
              <Typography variant="caption" color="white" sx={{ fontSize: "15px"}}>
                km
              </Typography>
              <Switch 
                defaultChecked
                onChange={switchUnit}
                size="small"
              />
              <Typography variant="caption" color="white" sx={{ fontSize: "15px"}}>
                mi
              </Typography>
            </Stack>
          </div>
          
          <div className="rowC">
            {/* Button to Trigger GET Request */}
            <Button variant="contained"
              onClick={calculate}
              >🏃 Calculate </Button>
            {/* Button to Clear User Input */}
            <IconButton 
              onClick={reset}
              color="primary"
              aria-label="delete"
            >
              <RestartAltIcon/>
            </IconButton>
          </div>

          {/* Error Message */}
          {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
    </div>
  );
}

export default App;
