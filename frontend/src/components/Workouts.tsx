//@ts-check
import React, {useState} from "react";
import axios from "axios";
import { 
    Card,
    CardHeader,
    CardContent,
    Chip,
    Drawer,
    Typography, 
    TextField, 
    Button, 
    Select, 
    MenuItem, 
    FormControl, 
    InputLabel,
    Grid2,
    Box,
    IconButton,
    Container,
    Paper,
    SelectChangeEvent,
    Stack,
    ToggleButtonGroup,
    ToggleButton,
    Divider
  } from "@mui/material";
  import { Add as AddIcon, Delete as DeleteIcon, Save as SaveIcon } from "@mui/icons-material";

import { handleTimeInput } from "../utils/inputValidation";
import { ThemeProvider, PaletteMode} from "@mui/material";
import {
    Close,
    Add,
    PlayArrow,
    Save,
    ChevronRight
  } from "@mui/icons-material";

// Types and interfaces for our component

type PaceUnit = "mi" | "km";
type WorkoutType = "Warm Up" | "Training" | "Intervals" | "Recovery" | "Cool Down";
type DistanceUnit = "mi" | "km" | "m"

interface Segment {
    id: number;
    type?: "Warm Up" | "Training" | "Intervals" | "Recovery" | "Cool Down";
    measurement?: "time" | "distance";
    duration?: {
      minutes: number;
      seconds: number;
    };
    distance?: {
      value: number;
      unit: "mi" | "km" | "m";
    };
    pace?: {
      value: string;
      unit: "mi" | "km";
    };
    notes?: string;
  }

interface IntervalConfig extends Segment {
    repetitions: number;
    recoveryType: "Rest" | "Run";
    workInterval: {
        measurement: "time" | "distance";
        duration?: {
        minutes: number;
        seconds: number;
        };
        distance?: {
        value: number;
        unit: "mi" | "km" | "m";
        };
    };
    recoveryInterval: {
        measurement: "time" | "distance";
        duration?: {
        minutes: number;
        seconds: number;
        };
        distance?: {
        value: number;
        unit: "mi" | "km" | "m";
        };
    };
}

// Pace conversion utilities
const paceUtils = {
    convertPace: {
      toMinPerKm: (minPerMile:string) => {
        const [mins, secs] = minPerMile.split(":").map(Number);
        const totalSeconds = (mins * 60 + secs) / 1.60934;
        return `${Math.floor(totalSeconds / 60)}:${String(Math.round(totalSeconds % 60)).padStart(2, "0")}`;
      },
      toMPH: (minPerMile:string) => {
        const [mins, secs] = minPerMile.split(":").map(Number);
        const totalHours = (mins + secs / 60) / 60;
        return `${(1 / totalHours).toFixed(1)}`;
      }
    },
    validatePaceFormat: (pace: string) => {
      const paceRegex = /^([0-9]{1,2}):([0-5][0-9])$/;
      return paceRegex.test(pace);
    }
  };


function Workout() {
  const [workoutName, setWorkoutName] = useState<string>("");
  const [segments, setSegments] = useState<(Segment | IntervalConfig)[]>([]);
  const [paceUnit, setPaceUnit] = useState<string>("mi");
  const [selectedSegment, setSelectedSegment] = useState<Segment | IntervalConfig | null>(null);

  const addSegment = (segment: Segment | IntervalConfig): void => {
    console.log(segment)
    setSegments(prevSegments => [...prevSegments, segment]);
  };

  const removeSegment = (segmentId: number): void => {
    const updatedSegments = segments.filter(seg => seg.id !== segmentId);
    setSegments(updatedSegments);
  };
  
  const displayPace = (pace:string) => {
    if (!pace) return "";
    switch (paceUnit) {
      case "minPerKm":
        return `${paceUtils.convertPace.toMinPerKm(pace)} /km`;
      case "mph":
        return `${paceUtils.convertPace.toMPH(pace)} mph`;
      default:
        return `${pace} /mi`;
    }
  };

  const handlePaceUnitChange = (event: SelectChangeEvent): void => {
    setPaceUnit(event.target.value as PaceUnit);
  };

  // Component for the configuration panel
  const SegmentConfig: React.FC<{ workoutSegment: Segment | IntervalConfig}> = ({ workoutSegment }) => {
    const id = (workoutSegment.id || Date.now());
    const [segmentType, setSegmentType] = useState<Segment["type"]>(workoutSegment.type);
    const [measurementType, setMeasurementType] = useState<"time" | "distance">(workoutSegment.measurement ||"time");
    const [duration, setDuration] = useState<Segment["duration"]>(workoutSegment.duration);
    const [distance, setDistance] = useState<Segment["distance"]>(workoutSegment.distance);
    const [distanceValue, setDistanceValue] = useState<number | undefined>(workoutSegment.distance?.value)
    const [distanceUnit, setDistanceUnit] = useState<"mi" | "km" | "m">(workoutSegment.distance?.unit ?? "mi")
    const [pace, setPace] = useState<Segment["pace"]>(workoutSegment?.pace)
    const [paceValue, setPaceValue] = useState<string>(workoutSegment.pace?.value || "")
    const [paceUnit, setPaceUnit] = useState<"mi" | "km">(workoutSegment.pace?.unit ?? "mi")
    const [notes, setNotes] = useState<string>(workoutSegment.notes || "")
    const [disableDistance, setDisableDistance] = useState<boolean>(true);
    const [recoveryMeasurementType, setRecoveryMeasurementType] = useState<"time" | "distance">("time");

    const validateSegment = (): boolean => {
      if (measurementType === "time") {
        if (duration?.minutes === undefined || duration?.seconds === undefined) {
          alert("Both minutes and seconds are required")
          return false;
        }
      } else {
        if (distanceValue === undefined) {
          return false;
        }
      }
      if (!paceValue.trim()) return false;
      if (segmentType === null) return false;
      return true;
    };

    const createSegment = () => {
      let newSegment;
      if (validateSegment()) {
        newSegment = {
          id,
          ...(segmentType && {"type": segmentType }),
          ...(measurementType && {"measurement": measurementType}),
          ...(duration && {"duration": duration }),
          ...(distance && {"distance": distance }),
          ...(pace && {"pace": pace}),
          ...(notes && {"notes": notes}),
        };
        addSegment(newSegment);
      } else {
        alert("Missing required fields")
      }
    };
    
    const handleMeasurementChange = (_: React.MouseEvent<HTMLElement>, newMeasurementType: "time" | "distance") => {
      if (newMeasurementType !== null) {
        setMeasurementType(newMeasurementType);      // Reset the other type's values when switching
        if (newMeasurementType === 'time') {
          setDistanceValue(undefined); // Clear distance when switching to time
        } else {
          setDuration(undefined);
        }
      }
    };
    const handleRecoveryMeasurementChange = (_: React.MouseEvent<HTMLElement>, newValue: "time" | "distance") => {
      if (newValue !== null) {
        setRecoveryMeasurementType(newValue);
      }
    };
    const handleRecoveryOptions = (recoveryType: string): void => {
      if (recoveryType != "run") {
        setDisableDistance(true)
        setRecoveryMeasurementType("time")
      } else {
        setDisableDistance(false)
      }
    }

    const handlePace = (p: string) => {
      setPaceValue(p)
      setPace({"value": p, "unit": paceUnit})
    }

    const handleDistance = (distance: number) => {
      setDistanceValue(distance)
      setDistance({"value": distance, "unit": paceUnit})
    }

    const options = [
      { label: "Warm Up", value: "Warm Up" },
      { label: "Intervals", value: "Intervals" },
      { label: "Training", value: "Training" },
      { label: "Recovery", value: "Recovery" },
      { label: "Cool Down", value: "Cool Down" }
    ];
    return (
      <Box sx={{ width: 320, p: 3 }}>
        <Stack spacing={3}>
          {/* Header with close button */}
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Configure {workoutSegment.type}</Typography>
            <IconButton onClick={() => setSelectedSegment(null)} size="small">
              <Close />
            </IconButton>
          </Box>

          {/* Segment type selection */}
          <FormControl fullWidth>
          <InputLabel>Segment Type</InputLabel>
            <Select value={segmentType} onChange={(e) => setSegmentType(e.target.value as WorkoutType)} label="Segment Type">
              {options.map((option) => (
                <MenuItem key={option.label} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {
            segmentType === "Intervals" && (
              <>
              <TextField
              fullWidth
              type="number"
              label="Number of Repetitions"
              variant="outlined"
              />
              <Divider />
              <Typography variant="subtitle1">Work Interval</Typography>
              </>
            )
          }

          {/* Measurement type toggle */}
          <ToggleButtonGroup
            value={measurementType}
            exclusive
            onChange={handleMeasurementChange}
            fullWidth
          >
            <ToggleButton value="time">Time</ToggleButton>
            <ToggleButton value="distance">Distance</ToggleButton>
          </ToggleButtonGroup>

          {/* Dynamic measurement input */}
          {measurementType === "time" ? (
            <Grid2 container spacing={2}>
              <Grid2 size={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Minutes"
                  variant="outlined"
                  value={duration?.minutes ?? ''}
                  onChange={(e) => setDuration({"minutes": Number(e.target.value), "seconds": duration?.seconds ?? 0})}
                />
              </Grid2>
              <Grid2 size={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Seconds"
                  variant="outlined"
                  value={duration?.seconds ?? ''}
                  onChange={(e) => setDuration({"minutes": duration?.minutes ?? 0, "seconds": Number(e.target.value)})}
                />
              </Grid2>
            </Grid2>
          ) : (
            <Grid2 container spacing={2}>
              <Grid2 size={7}>
                <TextField
                  fullWidth
                  type="number"
                  label="Distance"
                  variant="outlined"
                  value={distanceValue ?? ''}
                  onChange={(e) => handleDistance(Number(e.target.value))}
                />
              </Grid2>
              <Grid2 size={5}>
                <FormControl fullWidth>
                  <InputLabel>Unit</InputLabel>
                  <Select label="Unit" defaultValue="mi" value={distanceUnit} onChange={(e) => setDistanceUnit(e.target.value as DistanceUnit)}>
                    <MenuItem value="mi">Miles</MenuItem>
                    <MenuItem value="km">Kilometers</MenuItem>
                    <MenuItem value="m">Meters</MenuItem>
                  </Select>
                </FormControl>
              </Grid2>
            </Grid2>
          )}

          {/* Pace selection */}
          <FormControl fullWidth>
            <InputLabel>Target Pace</InputLabel>
            <Select label="Target Pace" defaultValue="easy" value={paceValue} onChange={(e) => handlePace(e.target.value)} >
              <MenuItem value="easy">Easy (9:00-10:00 /mi)</MenuItem>
              <MenuItem value="moderate">Moderate (8:00-9:00 /mi)</MenuItem>
              <MenuItem value="hard">Hard (7:00-8:00 /mi)</MenuItem>
              <MenuItem value="sprint">Sprint (6:00-7:00 /mi)</MenuItem>
              <MenuItem value="custom">Custom</MenuItem>
            </Select>
          </FormControl>

          {/* Interval-specific configuration */}
          {segmentType === "Intervals" && (
            <>
              <Divider />
              <Typography variant="subtitle1">Recovery Interval</Typography>
              <FormControl fullWidth>
                <InputLabel>Recovery Type</InputLabel>
                <Select label="Recovery Type" onChange={(e) => handleRecoveryOptions(e.target.value)} defaultValue="rest">
                  <MenuItem value="run">Run</MenuItem>
                  <MenuItem value="rest">Rest</MenuItem>
                </Select>
              </FormControl>
              {/* Measurement type toggle */}
              <ToggleButtonGroup
                value={recoveryMeasurementType}
                exclusive
                onChange={handleRecoveryMeasurementChange}
                fullWidth
              >
                <ToggleButton value="time">Time</ToggleButton>
                <ToggleButton value="distance" disabled={disableDistance}>Distance</ToggleButton>
              </ToggleButtonGroup>

              {/* Dynamic measurement input */}
              {recoveryMeasurementType === "time"? (
                <Grid2 container spacing={2}>
                  <Grid2 size={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Minutes"
                      variant="outlined"
                    />
                  </Grid2>
                  <Grid2 size={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Seconds"
                      variant="outlined"
                    />
                  </Grid2>
                </Grid2>
              ) : (
                <Grid2 container spacing={2}>
                  <Grid2 size={7}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Distance"
                      variant="outlined"
                    />
                  </Grid2>
                  <Grid2 size={5}>
                    <FormControl fullWidth>
                      <InputLabel>Unit</InputLabel>
                      <Select label="Unit" defaultValue="mi">
                        <MenuItem value="mi">Miles</MenuItem>
                        <MenuItem value="km">Kilometers</MenuItem>
                        <MenuItem value="m">Meters</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid2>
                </Grid2>
              )}
              {/* Pace selection */}
              {!disableDistance && (
              <FormControl fullWidth>
              <InputLabel>Target Pace</InputLabel>
              <Select label="Target Pace" defaultValue="easy">
                <MenuItem value="easy">Easy (9:00-10:00 /mi)</MenuItem>
                <MenuItem value="moderate">Moderate (8:00-9:00 /mi)</MenuItem>
                <MenuItem value="hard">Hard (7:00-8:00 /mi)</MenuItem>
                <MenuItem value="sprint">Sprint (6:00-7:00 /mi)</MenuItem>
                <MenuItem value="custom">Custom</MenuItem>
              </Select>
            </FormControl>
              )}
            </>
          )}

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Notes"
            variant="outlined"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={createSegment}
          >
            Apply Changes
          </Button>
        </Stack>
      </Box>
    );
  };

  return (
    <Container>
        <Card>
            <CardContent>
                <CardHeader
                  title="Workout Builder"
                />
                {/* Workout Name and Pace Unit Selection */}
                <Grid2 container spacing={3} sx={{ mb: 4 }}>
                <Grid2 size={8}>
                    <TextField
                    fullWidth
                    label="Workout Name"
                    value={workoutName}
                    onChange={(e) => setWorkoutName(e.target.value)}
                    variant="outlined"
                    />
                </Grid2>
                <Grid2 size={4}>
                    <FormControl fullWidth>
                    <InputLabel>Pace Display Unit</InputLabel>
                    <Select
                        value={paceUnit}
                        onChange={handlePaceUnitChange}
                        label="Pace Display Unit"
                    >
                        <MenuItem value="minPerMile">mi</MenuItem>
                        <MenuItem value="minPerKm">km</MenuItem>
                        <MenuItem value="mph">mph</MenuItem>
                    </Select>
                    </FormControl>
                </Grid2>
                </Grid2>
        {/* Workout Timeline */}
        <Grid2 size={9}>
          <Paper sx={{ p: 2, position: "relative" }}>
            <Typography variant="h6" gutterBottom>Segments</Typography>
            <Stack spacing={2}>
              {/* Segment Cards */}
              {
                segments.map(
                  (segment) => (
                    <Card onClick={() => setSelectedSegment(segment)} elevation={3}>
                      <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Box>
                            <Typography variant="subtitle1">{segment.type}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {segment.notes}
                            </Typography>
                            <Stack direction="row" spacing={1} mt={1}>
                              <Chip
                                label={
                                  segment.distance
                                    ? `${segment.distance.value} ${segment.distance.unit}`
                                    : segment.duration
                                    ? `${segment.duration.minutes}:${segment.duration.seconds.toString().padStart(2, "0")}`
                                    : "No data available"
                                }
                                size="small"
                                color="primary"
                                variant="outlined"
                              />
                              <Chip
                                label={
                                  segment.pace
                                    ? `${segment.pace.value} /${segment.pace.unit}`
                                    : "No data available"
                                }
                                size="small"
                                color="success"
                                variant="outlined"
                              />
                            </Stack>
                          </Box>
                          <ChevronRight />
                        </Box>
                      </CardContent>
                    </Card>
                  ) 
                )
              }
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => setSelectedSegment({"id": Date.now()})}
                sx={{ mt: 2 }}
                fullWidth
              >
                Add Segment
              </Button>
            </Stack>

            {/* Configuration Drawer */}
            <Drawer
              anchor="right"
              open={selectedSegment !== null}
              onClose={() => setSelectedSegment(null)}
            >
              {selectedSegment && <SegmentConfig workoutSegment={selectedSegment} />}
            </Drawer>
          </Paper>
        </Grid2>
            </CardContent>
        </Card>
    </Container>
  );
}

export default Workout;