from pydantic import BaseModel, model_validator
from typing import Literal, Optional


class WorkoutBlock(BaseModel):
    pace: Optional[str] = None
    heart_rate: Optional[int] = None
    distance: Optional[int] = None
    time: Optional[int] = None
    @model_validator(mode="after")
    def specify_params(cls, values):
        assert (values.pace) or (values.heart_rate), "specify either pace or heart rate targets"
        assert (values.distance) or (values.time), "specify either distance or time"
        return values
        
class IntervalBlocks(BaseModel):
    WorkoutBlocks: list[WorkoutBlock] = []
    repeat: int = 1

    

workout_paces =[
    {
        "Percentage of Pace": 80,
        "Designation": "Basic Endurance"
    },
    {
        "Percentage of Pace": 85,
        "Designation": "General Endurance"
    },
    {
        "Percentage of Pace": 90,
        "Designation": "Race-supportive Endurance"
    },
    {
        "Percentage of Pace": 95,
        "Designation": "Race-specific Endurance"
    },
    {
        "Percentage of Pace": 100,
        "Designation": "Race Pace"
    },
    {
        "Percentage of Pace": 105,
        "Designation": "Race-specific Speed"
    },
    {
        "Percentage of Pace": 110,
        "Designation": "Race-supportive Speed"
    },
    {
        "Percentage of Pace": 115,
        "Designation": "General Speed"
    }
]

# credit here for doing the legwork of researching how different sources derive the
# training paces as % of vdot 
# https://github.com/tlgs/vdot/blob/master/notebooks/2-analysis.ipynb
training_paces = {"Easy (lower)": 0.6304,
"Easy (upper)": 0.7346,
"Marathon": 0.8251,
"Threshold": 0.8799,
"Interval": 0.9743,
"Repetitions": 1.089}