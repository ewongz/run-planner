//@ts-check
import React, {useState} from "react";
import axios from "axios";
import { Button, FormControl, TextField,
         MenuItem, Switch, Stack, Typography,
        Divider } from '@mui/material';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { handleTimeInput } from "../utils/inputValidation";
import PaceTable from "./PaceTable";
import Workout from "./Workouts"


const emptyWorkoutPaces = () => 
  [
    {
        "Percentage of Pace": 80,
        "Designation": "Basic Endurance",
        "Pace": ""
    },
    {
        "Percentage of Pace": 85,
        "Designation": "General Endurance",
        "Pace": ""
    },
    {
        "Percentage of Pace": 90,
        "Designation": "Race-supportive Endurance",
        "Pace": ""
    },
    {
        "Percentage of Pace": 95,
        "Designation": "Race-specific Endurance",
        "Pace": ""
    },
    {
        "Percentage of Pace": 100,
        "Designation": "Race Pace",
        "Pace": ""
    },
    {
        "Percentage of Pace": 105,
        "Designation": "Race-specific Speed",
        "Pace": ""
    },
    {
        "Percentage of Pace": 110,
        "Designation": "Race-supportive Speed",
        "Pace": ""
    },
    {
        "Percentage of Pace": 115,
        "Designation": "General Speed",
        "Pace": ""
    }
]


function Calculator() {
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [pace, setPace] = useState<string>("");
  const [time, setTime] = useState<string>("");
  const [isMiles, setIsMiles] = useState<boolean>(false);
  const [raceDistance, setRaceDistance] = useState<string>("Marathon");
  const [error, setError] = useState<string>("");
  const [workoutPaces, setWorkoutPaces] = useState<{ "Percentage of Pace": number; Designation: string; Pace: string; }[]>(emptyWorkoutPaces);
  const [vdot, setVdot] = useState<string>("");
  const [renderOtherDistance, setRenderOtherDistance] = useState<boolean>(false);
  const [otherDistanceUnit, setOtherDistanceUnit] = useState<string>("mi");
  const [otherDistance, setOtherDistance] = useState<string>("");

  const reset = () => {
    setError(""); // Clear previous errors
    setTime("");
    setRaceDistance("");
    setPace("");
    setLastUpdated("");
    setWorkoutPaces(emptyWorkoutPaces);
    setVdot("");
    setOtherDistance("");
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

  const MetersToMiles = (distance:number) => {
    if (isMiles) {
      return distance * 0.000621371
    } else {
      return distance * 0.001
    }
  }

  const MilesToMeters = (distance:number) => {
    if (isMiles) {
      return distance / 0.000621371
    } else {
      return distance / 0.001
    }
  }

  // Calculate Pace
  const fetchPace = () => {
    setError(""); // Clear previous errors
    const encodedTime = encodeURIComponent(time)
    let mappedDistance;
    let encodedDistance;
    if (raceDistance === "Other") {
      encodedDistance = encodeURIComponent(Number(otherDistance))
    } else {
      mappedDistance = distanceMapping[raceDistance as keyof typeof distanceMapping]
      encodedDistance = encodeURIComponent(MetersToMiles(mappedDistance))
    }
    axios.get(`http://127.0.0.1:8000/race_pace?finish_time=${encodedTime}&distance=${encodedDistance}`)
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
    let mappedDistance;
    let encodedDistance;
    if (otherDistance) {
      encodedDistance = encodeURIComponent(MilesToMeters(Number(otherDistance)))
    } else {
      mappedDistance = distanceMapping[raceDistance as keyof typeof distanceMapping]
      encodedDistance = encodeURIComponent(mappedDistance)
    }
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
    let mappedDistance;
    let encodedDistance;
    if (otherDistance) {
      encodedDistance = encodeURIComponent(MilesToMeters(Number(otherDistance)))
    } else {
      mappedDistance = distanceMapping[raceDistance as keyof typeof distanceMapping]
      encodedDistance = encodeURIComponent(mappedDistance)
    }
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
  // handle distance
  const handleDistance = (d: string) => {
    setRaceDistance(d)
    if (d=== "Other") {
      setRenderOtherDistance(true)
    } else {
      setOtherDistance("")
      setRenderOtherDistance(false)
    }
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

  const units = [
    {
      value: 'mi',
      label: 'mi'
    },
    {
      value: 'km',
      label: 'km'
    }
  ]

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
    },
    {
      value: 'Other',
      label: 'Other'
    }
  ]

  const distanceMapping = {
    '800M': 800,
    '1600M': 1600,
    '5K': 5000,
    '10K': 10000,
    'Half Marathon': 21097.5,
    'Marathon': 42195,
    'Other': 0
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
                  onChange={(e) => handleDistance(e.target.value)} // Trigger data fetch on change
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
                {renderOtherDistance && (
                  <FormControl sx={{ m:1, minWidth:250 }}>
                  <Stack direction="row" spacing={2}>
                    {/* Input Other Distance */}
                    <FormControl sx={{ m:1, minWidth:150 }}>
                      <TextField
                        id="other-distance-field"
                        label="Distance"
                        value={otherDistance}
                        onChange={(e) => setOtherDistance(e.target.value)}
                        inputProps={{
                          maxLength: 8
                        }}
                      >
                      </TextField>
                    </FormControl>
                    <TextField
                    id="other-distance-unit-select"
                    select
                    value={otherDistanceUnit}
                    onChange={(e) => setOtherDistanceUnit(e.target.value)} // Trigger data fetch on change
                  >
                    {
                      units.map(
                        (option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                      ))
                    }
                  </TextField>
                </Stack>
                </FormControl>
                  )} 

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
              <PaceTable workoutPaces={workoutPaces}/>
            </Stack>
  );
}

export default Calculator;