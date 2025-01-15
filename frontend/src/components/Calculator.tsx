//@ts-check
import React, {useState} from "react";
import axios from "axios";
import Button from '@mui/material/Button';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Switch from '@mui/material/Switch';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { handleTimeInput } from "../utils/inputValidation";

function Calculator() {
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [pace, setPace] = useState<string>("");
  const [time, setTime] = useState<string>("");
  const [isMiles, setIsMiles] = useState<boolean>(false);
  const [raceDistance, setRaceDistance] = useState<string>("Marathon");
  const [error, setError] = useState<string>("");
  const [workoutPaces, setWorkoutPaces] = useState<[]>([]);
  const [vdot, setVdot] = useState<string>("");

  const reset = () => {
    setError(""); // Clear previous errors
    setTime("");
    setRaceDistance("");
    setPace("");
    setLastUpdated("");
    setWorkoutPaces([]);
    setVdot("");
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
    const mappedDistance = distanceMapping[raceDistance as keyof typeof distanceMapping]
    const encodedDistance = encodeURIComponent(mappedDistance)
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
        fetchVdot(time);
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
    const mappedDistance = distanceMapping[raceDistance as keyof typeof distanceMapping]
    const encodedDistance = encodeURIComponent(mappedDistance)
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
        fetchVdot(timeData);
      }
    )
    .catch(err => {
      console.error("Error fetching data:", err);
      setError("Failed to fetch time")
    });
  }

  const fetchVdot = (time: string) => {
    setError(""); // Clear previous errors
    const encodedTime = encodeURIComponent(time)
    const mappedDistance = distanceMapping[raceDistance as keyof typeof distanceMapping]
    const encodedDistance = encodeURIComponent(mappedDistance)
    axios.get(`http://127.0.0.1:8000/vdot?distance=${encodedDistance}&time=${encodedTime}`)
    .then(
      response => {
        setVdot(`VDOT: ${response.data.vdot}`);
      }
    )
    .catch(err => {
      console.error("Error fetching data:", err);
      setError("Failed to fetch pace.")
    });
  };

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
    setTime(handleTimeInput(e))
    setLastUpdated("time")
  }

  const formatPace = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPace(handleTimeInput(e))
    setLastUpdated("pace")
  }

  const switchUnit = () => {
    setIsMiles((prevState) => !prevState)
    let unit;
    if (isMiles) {
      unit = "km";
    } else {
      unit = "mi";
    }
    if (pace) {
      const encodedPace = encodeURIComponent(pace)
      axios.get(`http://127.0.0.1:8000/convert_pace?pace=${encodedPace}&target_unit=${unit}`)
      .then(
        response => {
          const paceData = `${response.data.pace}`
          setPace(paceData);
          fetchPacePercentages(paceData);
        }
      )
      .catch(err => {
        console.error("Error fetching data:", err);
        setError("Failed to switch units")
      });
    }
  };

  const distances = [
    {
      value: '800M',
      label: '800M'
    },
    {
      value: '1600M',
      label: '1600M'
    },
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

  const distanceMapping = {
    '800M': 800,
    '1600M': 1600,
    '5K': 5000,
    '10K': 10000,
    'Half Marathon': 21097.5,
    'Marathon': 42195
  }

  return (   
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
                    mi
                  </Typography>
                  <Switch 
                    defaultChecked
                    onChange={switchUnit}
                    size="small"
                  />
                  <Typography variant="caption" color="text.primary" sx={{ fontSize: "15px"}}>
                    km
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
              {/* VDOT */}
              <Typography
                component="a"
                href="https://support.vdoto2.com/v-o2-faq/"
                target="_blank"
                rel="noopener noreferrer"
                color="primary"
                variant="h6"
                sx={{ textDecoration: 'none',
                      '&:hover': { textDecoration: 'underline' },
                    }}
              >
                {`${vdot}`}
              </Typography>

              </Stack>
              {/* Workout Paces*/}
              <TableContainer component={Paper}>
                <Table sx={{ maxWidth:650 }} size="small">
                  {workoutPaces.length > 0 && (<TableHead>
                    <TableRow>
                      <TableCell align="left">Percentage of Pace</TableCell>
                      <TableCell align="left">Designation</TableCell>
                      <TableCell align="left">Pace</TableCell>
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
  );
}

export default Calculator;