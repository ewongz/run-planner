from pydantic import BaseModel, ConfigDict, Field

class WorkoutBase(BaseModel):
    """Base schema for Workout data.

    Attributes:
        name: name for workout
        pace: target pace
        time: target duration
        distance: target distance
        notes: additional info on the workout
    """
    name: str = Field(..., min_length=1, max_length=100, description="Workout Name")
    pace: str | None = Field(None, description="Target Pace")
    distance: float | None = Field(None, description="Target Distance")
    time: str | None = Field(None, description="Target Time")
    notes: str | None = Field(None, description="Additional notes on the workout")

class WorkoutCreate(WorkoutBase):
    """Schema for creating a workout"""

class WorkoutResponse(WorkoutBase):
    """Schema for workout responses.
    Includes all base fields plus the id.
    """
    model_config = ConfigDict(from_attributes=True)
    id: int