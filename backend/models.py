from pydantic import BaseModel, model_validator
from typing import Literal, List


class WorkoutBlock(BaseModel):
    phase: Literal["warm_up", "training", "rest", "cool_down"]
    variable: Literal["distance", "time"]
    target: Literal["pace", "heart_rate"]
    pace: str | None
    heart_rate: int | None
    distance: int | None
    time: int | None
    category: Literal["endurance", "speed", "recovery"]
    # @model_validator(mode="after")
    # def field_should_be_specified(cls, value):
    #     target = value["target"]
    #     pace = value["pace"]
    #     heart_rate = value["heart_rate"]
    #     if target == "pace" and not pace:
    #         raise ValueError("pace must be specified if target is pace")
    #     elif target == "heart_rate" and not heart_rate:
    #         raise ValueError("heart_rate must be specified if target is heart_rate")

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