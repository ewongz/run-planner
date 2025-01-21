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
  } from '@mui/material';
  import { Add as AddIcon, Delete as DeleteIcon, Save as SaveIcon } from '@mui/icons-material';

import { handleTimeInput } from "../utils/inputValidation";
import { ThemeProvider, PaletteMode} from '@mui/material';
import {
    Close,
    Add,
    PlayArrow,
    Save,
    ChevronRight
  } from '@mui/icons-material';

// Types and interfaces for our component
interface Segment {
    id: number;
    type: 'Warm Up' | 'Intervals' | 'Recovery' | 'Cool Down';
    measurement: 'time' | 'distance';
    duration?: {
      minutes: number;
      seconds: number;
    };
    distance?: {
      value: number;
      unit: 'mi' | 'km' | 'm';
    };
    pace?: {
      value: string;
      zone: 1 | 2 | 3 | 4 | 5;
    };
    notes?: string;
  }

interface IntervalConfig extends Segment {
    repetitions: number;
    recoveryType: 'Walking' | 'Jogging' | 'Standing';
    workInterval: {
        measurement: 'time' | 'distance';
        duration?: {
        minutes: number;
        seconds: number;
        };
        distance?: {
        value: number;
        unit: 'mi' | 'km' | 'm';
        };
    };
    recoveryInterval: {
        measurement: 'time' | 'distance';
        duration?: {
        minutes: number;
        seconds: number;
        };
        distance?: {
        value: number;
        unit: 'mi' | 'km' | 'm';
        };
    };
}


// Pace conversion utilities
const paceUtils = {
    convertPace: {
      toMinPerKm: (minPerMile:string) => {
        const [mins, secs] = minPerMile.split(':').map(Number);
        const totalSeconds = (mins * 60 + secs) / 1.60934;
        return `${Math.floor(totalSeconds / 60)}:${String(Math.round(totalSeconds % 60)).padStart(2, '0')}`;
      },
      toMPH: (minPerMile:string) => {
        const [mins, secs] = minPerMile.split(':').map(Number);
        const totalHours = (mins + secs / 60) / 60;
        return `${(1 / totalHours).toFixed(1)}`;
      }
    },
    validatePaceFormat: (pace: string) => {
      const paceRegex = /^([0-9]{1,2}):([0-5][0-9])$/;
      return paceRegex.test(pace);
    }
  };

type PaceUnit = 'minPerMile' | 'minPerKm' | 'mph';

function Workout() {
  const [workoutName, setWorkoutName] = useState<string>("");
  const [segments, setSegments] = useState<Segment[]>([]);
  const [pace, setPace] = useState<string>("");
  const [time, setTime] = useState<string>("");
  const [distance, setDistance] = useState<string>("");
  const [paceUnit, setPaceUnit] = useState<string>("mi");
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);
  const [measurementType, setMeasurementType] = useState<'time' | 'distance'>('time');

  const formatTime = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTime(handleTimeInput(e))
  }

  const formatPace = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPace(handleTimeInput(e))
  }

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

  const addSegment = (): void => {
    setSegments(prevSegments => [...prevSegments, {
      id: Date.now(),
      type: 'Intervals',
      measurement: 'distance'
    }]);
  };

  const removeSegment = (segmentId: number): void => {
    const updatedSegments = segments.filter(seg => seg.id !== segmentId);
    setSegments(updatedSegments);
  };
  
  const displayPace = (pace:string) => {
    if (!pace) return '';
    switch (paceUnit) {
      case 'minPerKm':
        return `${paceUtils.convertPace.toMinPerKm(pace)} /km`;
      case 'mph':
        return `${paceUtils.convertPace.toMPH(pace)} mph`;
      default:
        return `${pace} /mi`;
    }
  };

  const handlePaceUnitChange = (event: SelectChangeEvent): void => {
    setPaceUnit(event.target.value as PaceUnit);
  };

  // Component for the configuration panel
  const SegmentConfig: React.FC<{ workoutType: string }> = ({ workoutType }) => {
    const handleMeasurementChange = (_: React.MouseEvent<HTMLElement>, newValue: 'time' | 'distance') => {
      if (newValue !== null) {
        setMeasurementType(newValue);
      }
    };
    const options = [
      { label: 'Warm Up', value: 'Warm Up' },
      { label: 'Intervals', value: 'Intervals' },
      { label: 'Training', value: 'Training' },
      { label: 'Recovery', value: 'Recovery' },
      { label: 'Cool Down', value: 'Cool Down' }
    ];
    return (
      <Box sx={{ width: 320, p: 3 }}>
        <Stack spacing={3}>
          {/* Header with close button */}
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Configure {workoutType}</Typography>
            <IconButton onClick={() => setSelectedSegment(null)} size="small">
              <Close />
            </IconButton>
          </Box>

          {/* Segment type selection */}
          <FormControl fullWidth>
          <InputLabel>Segment Type</InputLabel>
            <Select value={selectedSegment} onChange={(e) => setSelectedSegment(e.target.value)} label="Segment Type">
              {options.map((option) => (
                <MenuItem key={option.label} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {
            workoutType === "Intervals" && (
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
          {measurementType === 'time' ? (
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

          {/* Interval-specific configuration */}
          {workoutType === 'Intervals' && (
            <>
              <Divider />
              <Typography variant="subtitle1">Recovery Interval</Typography>
              <FormControl fullWidth>
                <InputLabel>Recovery Type</InputLabel>
                <Select label="Recovery Type" defaultValue="walking">
                  <MenuItem value="walking">Walking</MenuItem>
                  <MenuItem value="jogging">Jogging</MenuItem>
                  <MenuItem value="standing">Standing</MenuItem>
                </Select>
              </FormControl>
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
              {measurementType === 'time' ? (
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
            </>
          )}

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Notes"
            variant="outlined"
          />

          <Button
            variant="contained"
            color="primary"
            fullWidth
          >
            Apply Changes
          </Button>
        </Stack>
      </Box>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
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
          <Paper sx={{ p: 2, height: '600px', position: 'relative' }}>
            <Typography variant="h6" gutterBottom>Segments</Typography>
            <Stack spacing={2}>
              {/* Segment Cards */}
              <Card onClick={() => setSelectedSegment('Warm Up')} elevation={3}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="subtitle1">Warm Up</Typography>
                      <Typography variant="body2" color="text.secondary">
                        1 mile at easy pace
                      </Typography>
                      <Stack direction="row" spacing={1} mt={1}>
                        <Chip
                          label="Zone 2"
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                        <Chip
                          label="9:30 /mi"
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

              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={addSegment}
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
              {selectedSegment && <SegmentConfig workoutType={selectedSegment} />}
            </Drawer>
          </Paper>
        </Grid2>
            </CardContent>
        </Card>
    </Container>
  );
}

export default Workout;