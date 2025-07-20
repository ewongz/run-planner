//@ts-check
import React, {useState} from "react";
import { 
    Card,
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
    Stack,
    ToggleButtonGroup,
    ToggleButton,
    Divider,
    Tooltip
  } from "@mui/material";
  import { Add as AddIcon, Delete as DeleteIcon, DragIndicator as DragIcon} from "@mui/icons-material";
import {
    Close,
  } from "@mui/icons-material";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import {
  CSS,
} from '@dnd-kit/utilities';
import SaveButton from "./SaveButton"

// Types and interfaces for our component


type WorkoutType = "Warm Up" | "Training" | "Intervals" | "Recovery" | "Cool Down";
type DistanceUnit = "mi" | "km" | "m"

interface Segment {
    id: number;
    type?: "Warm Up" | "Training" | "Intervals" | "Recovery" | "Cool Down";
    measurement?: "time" | "distance";
    duration?: {
      minutes: number | undefined;
      seconds: number | undefined;
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
    recoveryInterval: {
        measurement: "time" | "distance";
        duration?: {
        minutes: number | undefined;
        seconds: number | undefined;
        };
        distance?: {
        value: number;
        unit: "mi" | "km" | "m";
        };
        pace?: {
          value: string;
          unit: "mi" | "km";
        };
    };
}

interface WorkoutPace {
  "Percentage of Pace": number;
  "Designation": string;
  "Pace": string;
}

interface WorkoutBuilderProps {
  workoutPaces: WorkoutPace[];
  paceUnit: "mi" | "km";
}

function Workout({ workoutPaces, paceUnit }: WorkoutBuilderProps) {
  const [workoutName, setWorkoutName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [segments, setSegments] = useState<(Segment | IntervalConfig)[]>([]);
  const [selectedSegment, setSelectedSegment] = useState<Segment | IntervalConfig | null>(null);
  const [modifySegment, setModifySegment] = useState<boolean>(false);
  const addSegment = (segment: Segment | IntervalConfig): void => {
    console.log(segment)
    setSegments(prevSegments => [...prevSegments, segment]);
  };

  const removeSegment = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, segmentId: number): void => {
    const updatedSegments = segments.filter(seg => seg.id !== segmentId);
    setSegments(updatedSegments);
    setSelectedSegment(null);
    event.stopPropagation()
  };

  const updateSegment = (updatedSegment: Segment | IntervalConfig): void => {
    setSegments(prevSegments =>
      prevSegments.map(segment =>
        segment.id === updatedSegment.id ? updatedSegment : segment
      )
    );
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setSegments((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const saveWorkout = () => {
    console.log("Workout saved:", segments)
  }

  const handleCardClick = (segment: Segment) => {
    setSelectedSegment(segment)
    setModifySegment(true)
  }

  const handleAddSegment = (segment: Segment) => {
    setSelectedSegment(segment)
    setModifySegment(false)
  }

  const isPaceDefined = !workoutPaces.length || !workoutPaces[0].Pace

  // Sortable Item Component
  const SortableSegmentCard: React.FC<{ segment: Segment | IntervalConfig }> = ({ segment }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: segment.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    return (
      <Card 
        ref={setNodeRef} 
        style={style} 
        onClick={() => handleCardClick(segment)} 
        elevation={isDragging ? 8 : 3}
        sx={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <CardContent sx={{ position: "relative" }}>
          <Box display="flex" alignItems="center">
            <IconButton
              {...attributes}
              {...listeners}
              size="small"
              sx={{ 
                mr: 1, 
                cursor: 'grab',
                color: 'action.active',
                '&:hover': {
                  color: 'primary.main',
                  backgroundColor: 'action.hover'
                },
                '&:active': {
                  cursor: 'grabbing'
                }
              }}
              onClick={(e) => e.stopPropagation()}
              title="Drag to reorder"
            >
              <DragIcon />
            </IconButton>
            <Box flexGrow={1}>
              {'repetitions' in segment && segment.repetitions ? (
                <Typography variant="subtitle1">
                  {segment.type} (Repeat {segment.repetitions}x)
                </Typography>
              ): (
                <Typography variant="subtitle1">{segment.type}</Typography>
              )}
              <Typography variant="body2" color="text.secondary">
                {segment.notes}
              </Typography>
              {'repetitions' in segment && segment.repetitions? (
                <Box margin={1} padding={1} justifyContent="space-between" alignItems="center">
                  <Stack spacing={2}>
                <Card>
                  <CardContent>
                    <Stack direction="row" spacing={1} mt={1}>
                      <Chip
                        label={
                          segment.distance
                            ? `${segment.distance.value} ${segment.distance.unit}`
                            : segment.duration
                            ? `${segment.duration.minutes}:${(segment.duration.seconds ?? 0).toString().padStart(2, "0")}`
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
                  </CardContent>
                </Card>
                <Card>
                <CardContent>
                  <Stack direction="row" spacing={1} mt={1}>
                    <Chip
                      label={
                        'recoveryInterval' in segment && segment.recoveryInterval?.distance
                          ? `${segment.recoveryInterval.distance.value} ${segment.recoveryInterval.distance.unit}`
                          : 'recoveryInterval' in segment && segment.recoveryInterval?.duration
                          ? `${segment.recoveryInterval.duration.minutes}:${(segment.recoveryInterval.duration.seconds ?? 0).toString().padStart(2, "0")}`
                          : "No data available"
                      }
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                    <Chip
                      label={
                        segment.recoveryInterval.pace
                          ? `${segment.recoveryInterval.pace.value} /${segment.recoveryInterval.pace.unit}`
                          : "No data available"
                      }
                      size="small"
                      color="success"
                      variant="outlined"
                    />
                  </Stack>
                </CardContent>
              </Card>
              </Stack>
              </Box>
              ): (
                <Stack direction="row" spacing={1} mt={1}>
                <Chip
                  label={
                    segment.distance
                      ? `${segment.distance.value} ${segment.distance.unit}`
                      : segment.duration
                      ? `${segment.duration.minutes}:${(segment.duration.seconds ?? 0).toString().padStart(2, "0")}`
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
              )}
            </Box>
          </Box>
          <IconButton aria-label="delete"
            sx={{
              position: "absolute",
              bottom:3,
              right:8
            }}
            onClick={
              (e) => {
                e.stopPropagation();
                removeSegment(e, segment.id)
              }
            }
          >
              <DeleteIcon fontSize="small"/>
          </IconButton>
        </CardContent>
      </Card>
    );
  };

  // Component for the configuration panel
  const SegmentConfig: React.FC<{ workoutSegment: Segment | IntervalConfig; update: boolean; paceUnit: "mi" | "km"}> = ({ workoutSegment, update }) => {
    const id = (workoutSegment.id || Date.now());
    const [segmentType, setSegmentType] = useState<Segment["type"]>(workoutSegment.type);
    const [measurementType, setMeasurementType] = useState<"time" | "distance">(workoutSegment.measurement ||"time");
    const [duration, setDuration] = useState<Segment["duration"]>(workoutSegment.duration);
    const [distance, setDistance] = useState<Segment["distance"] | undefined>(workoutSegment.distance);
    const [distanceUnit, setDistanceUnit] = useState<"mi" | "km" | "m">(workoutSegment.distance?.unit ?? "mi")
    const [pace, setPace] = useState<Segment["pace"]>(workoutSegment?.pace)
    const [notes, setNotes] = useState<string>(workoutSegment.notes || "")
    const [disableDistance, setDisableDistance] = useState<boolean>(true);
    const [recoveryMeasurementType, setRecoveryMeasurementType] = useState<"time" | "distance">("time");
    const [recoveryDistance, setRecoveryDistance] = useState<IntervalConfig["recoveryInterval"]["distance"] | undefined>(
      "recoveryInterval" in workoutSegment ? workoutSegment.recoveryInterval?.distance : undefined
    );
    const [recoveryDuration, setRecoveryDuration] = useState<IntervalConfig["recoveryInterval"]["duration"] | undefined>(
      "recoveryInterval" in workoutSegment ? workoutSegment.recoveryInterval?.duration : undefined
    );
    const [recoveryPace, setRecoveryPace] = useState<IntervalConfig["recoveryInterval"]["pace"] | undefined>(
      "recoveryInterval" in workoutSegment ? workoutSegment.recoveryInterval?.pace : undefined
    );
    const [repetitions, setRepetitions] = useState<IntervalConfig["repetitions"] | undefined>(
      "repetitions" in workoutSegment ? workoutSegment?.repetitions : undefined
    );
    const validateSegment = (): boolean => {
      if (measurementType === "time") {
        if (duration?.minutes === undefined || duration?.seconds === undefined) {
          alert("Both minutes and seconds are required")
          return false;
        }
      } else {
        if (distance?.value === undefined) {
          return false;
        }
      }
      if (!pace?.value.trim()) {
        alert("require pace")
        return false;
      } 
      if (segmentType === null) return false;
      return true;
    };

    const createSegment = () => {
      let newSegment;
      console.log("here is the update value:", update)
      console.log(recoveryDistance)
      if (validateSegment()) {
        newSegment = {
          id,
          ...(segmentType && { type: segmentType }),
          ...(duration && { duration }),
          ...(distance && { distance }),
          ...(pace && { pace }),
          ...(notes && { notes }),
          ...(repetitions && { repetitions }),
          ...(recoveryDuration || recoveryDistance || recoveryPace
            ? {
                recoveryInterval: {
                  ...(recoveryDuration && { duration: recoveryDuration }),
                  ...(recoveryDistance && { distance: recoveryDistance }),
                  ...(recoveryPace && { pace: recoveryPace }),
                },
              }
            : {}),
        };
        if (update === false) {
          console.log("adding new segment:", newSegment)
          addSegment(newSegment);
        } else {
          console.log("updating existing segment:", newSegment)
          updateSegment(newSegment);
        }
        setSelectedSegment(null);
      } 
    };
    
    const handleMeasurementChange = (_: React.MouseEvent<HTMLElement>, newMeasurementType: "time" | "distance") => {
      if (newMeasurementType !== null) {
        setMeasurementType(newMeasurementType);      // Reset the other type's values when switching
        if (newMeasurementType === 'time') {
          setDistance(undefined); // Clear distance when switching to time
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
      if (recoveryType !== "run") {
        setDisableDistance(true)
        setRecoveryMeasurementType("time")
      } else {
        setDisableDistance(false)
      }
    }

    const handlePace = (p: string, recovery: boolean) => {
      if (recovery) {
        setRecoveryPace({"value": p, "unit": paceUnit})
      } else {
        setPace({"value": p, "unit": paceUnit})
      }
    }

    const handleDistance = (distance: number | undefined, recovery:boolean, unit: "mi" | "km" | "m") => {
      setDistanceUnit(unit)
      if (distance && recovery) {
        setRecoveryDistance({"value": distance, "unit": unit})
      } else if (distance) {
        setDistance({"value": distance, "unit": unit})
      }
    }

    const options = [
      { label: "Warm Up", value: "Warm Up" },
      { label: "Intervals", value: "Intervals" },
      { label: "Training", value: "Training" },
      { label: "Recovery", value: "Recovery" },
      { label: "Cool Down", value: "Cool Down" }
    ];

    
    return (
      <Box sx={{ width:320, p: 3 }}>
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
          <InputLabel>Segment Type:</InputLabel>
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
              value={repetitions}
              onChange={(e) => setRepetitions(Number(e.target.value))}
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
                  onChange={(e) => setDuration({"minutes": Number(e.target.value), "seconds": duration?.seconds ?? undefined})}
                />
              </Grid2>
              <Grid2 size={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Seconds"
                  variant="outlined"
                  value={duration?.seconds ?? ''}
                  onChange={(e) => setDuration({"minutes": duration?.minutes ?? undefined, "seconds": Number(e.target.value)})}
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
                  value={distance?.value ?? ''}
                  onChange={(e) => handleDistance(Number(e.target.value), false, distanceUnit)}
                />
              </Grid2>
              <Grid2 size={5}>
                <FormControl fullWidth>
                  <InputLabel>Unit</InputLabel>
                  <Select label="Unit" defaultValue="mi" value={distanceUnit} onChange={(e) => handleDistance(distance?.value ?? undefined, false, e.target.value as DistanceUnit)}>
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
            <Select label="Target Pace" value={pace?.value} onChange={(e) => handlePace(e.target.value, false)} >
              {
                workoutPaces.map((pace, index) => (
                  <MenuItem key={index} value={pace["Pace"]}>
                    {`${pace["Percentage of Pace"]}% ${pace["Designation"]} ${pace["Pace"]}`}
                  </MenuItem>
                )
                )
              }
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
                      value={recoveryDuration?.minutes ?? ''}
                      onChange={(e) => setRecoveryDuration({"minutes": Number(e.target.value), "seconds": recoveryDuration?.seconds ?? undefined})}
                    />
                  </Grid2>
                  <Grid2 size={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Seconds"
                      variant="outlined"
                      value={recoveryDuration?.seconds ?? ''}
                      onChange={(e) => setRecoveryDuration({"minutes": recoveryDuration?.minutes ?? undefined, "seconds": Number(e.target.value)})}
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
                      value={recoveryDistance?.value ?? ''}
                      onChange={(e) => handleDistance(Number(e.target.value), true, distanceUnit)}
                    />
                  </Grid2>
                  <Grid2 size={5}>
                    <FormControl fullWidth>
                      <InputLabel>Unit</InputLabel>
                      <Select label="Unit" defaultValue="mi" value={distanceUnit}>
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
              <Select label="Target Pace" value={recoveryPace?.value} onChange={(e) => handlePace(e.target.value, true)} >
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
        <Card sx={{p: 4}}>
            <CardContent>
              <Grid2 container spacing={3} alignItems="center" sx={{ mb: 3 }}>
                <Grid2 size={8}>
                  <Typography variant="h5">Workout Builder</Typography>
                </Grid2>
              </Grid2>
                {/* Workout Name and Save Icon */}
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
                      <SaveButton onSave={saveWorkout} />
                    </FormControl>
                </Grid2>
                </Grid2>
              <Grid2 container spacing={3} alignItems="center" sx={{ mb: 3 }}>
                <Grid2 size={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    variant="outlined"
                    multiline
                    minRows={3}
                  />
                </Grid2>
              </Grid2>
        {/* Workout Timeline */}
        <Grid2 size={9}>
        <Typography variant="h6" gutterBottom>Segments</Typography>
          <Paper sx={{
            p: 2,
            position: "relative",
            maxHeight:750,
            overflow:"auto"
             }}>
            <DndContext 
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext 
                items={segments.map(segment => segment.id)}
                strategy={verticalListSortingStrategy}
              >
                <Stack spacing={2}>
                  {segments.map((segment) => (
                    <SortableSegmentCard key={segment.id} segment={segment} />
                  ))}
                </Stack>
              </SortableContext>
            </DndContext>

            {/* Configuration Drawer */}
            <Drawer
              anchor="right"
              open={selectedSegment !== null}
              onClose={() => setSelectedSegment(null)}
            >
              {selectedSegment && <SegmentConfig workoutSegment={selectedSegment} update={modifySegment} paceUnit={paceUnit}/>}
            </Drawer>
          </Paper>
          <Tooltip title={isPaceDefined ? "set your race pace in the calculator before creating a workout": ""} arrow>
            <span>
              <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => handleAddSegment({"id": Date.now()})}
                  sx={{ mt: 2 }}
                  fullWidth
                  disabled={isPaceDefined}
                >
                  Add Segment
              </Button>
            </span>
          </Tooltip>
        </Grid2>
            </CardContent>
        </Card>
    </Container>
  );
}

export default Workout;