from pydantic import BaseModel
from typing import Literal

class Pace(BaseModel):
    time: str = "5:00"
    unit: Literal["mi", "km"]

class Workout(BaseModel):
    pace: Pace
    distance: int

workout_paces = [
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
        "Designation": "Race-supportive Endurance"
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