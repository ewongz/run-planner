from pydantic import BaseModel, validator
from typing import Literal


class MarathonTime(BaseModel):
    hours: int | None = 0
    minutes: int | None = 0
    seconds: int | None = 0

class Pace(BaseModel):
    time: str = "3:00"
    unit: Literal["mi", "km"]
    @validator("time")

    def time_needs_a_colon(cls, value):
        if ':' not in value:
            raise ValueError("time must be in format mm:ss")
        return value

    def __sub__(self, other):
        parsed_time = self.time.split(":")
        if type(other) is int:
            total_seconds = int(parsed_time[0]) * 60 + int(parsed_time[1]) - other
            new_minutes = total_seconds // 60
            new_seconds = total_seconds % 60
            return Pace(time=f"{new_minutes}:{new_seconds:02}",
                        unit=self.unit)
        else:
            parsed_time = self.time.split(":")
            other_parsed_time = other.time.split(":")
            total_seconds = int(parsed_time[0]) * 60 + int(parsed_time[1])
            other_seconds = int(other_parsed_time[0]) * 60 + int(other_parsed_time[1])
            new_time_seconds = abs(total_seconds - other_seconds)
            new_minutes = new_time_seconds // 60
            new_seconds = new_time_seconds % 60
            return Pace(time=f"{new_minutes}:{new_seconds:02}",
                        unit=self.unit)
    
    def __add__(self, other):
        parsed_time = self.time.split(":")
        if type(other) is int:
            total_seconds = int(parsed_time[0]) * 60 + int(parsed_time[1]) + other
            new_minutes = total_seconds // 60
            new_seconds = total_seconds % 60
            return Pace(time=f"{new_minutes}:{new_seconds:02}",
                        unit=self.unit)
        else:
            other_parsed_time = other.time.split(":")
            total_seconds = int(parsed_time[0]) * 60 + int(parsed_time[1])
            other_seconds = int(other_parsed_time[0]) * 60 + int(other_parsed_time[1])
            new_time_seconds = total_seconds + other_seconds
            new_minutes = new_time_seconds // 60
            new_seconds = new_time_seconds % 60
            return Pace(time=f"{new_minutes}:{new_seconds:02}",
                        unit=self.unit)

    def __mul__(self, other):
        parsed_time = self.time.split(":")
        minutes = int(parsed_time[0])
        seconds = int(parsed_time[1])
        total_seconds = minutes * 60 + seconds
        updated_pace_minutes = int(((total_seconds * (1 + (1-other))) // 60))
        updated_pace_seconds = int(((total_seconds * (1 + (1-other))) % 60))
        return Pace(time=f"{updated_pace_minutes}:{updated_pace_seconds:02}",
                    unit=self.unit)

    def __floordiv__(self, other):
        parsed_time = self.time.split(":")
        minutes = int(parsed_time[0])
        seconds = int(parsed_time[1])
        total_seconds = minutes * 60 + seconds
        divided_seconds = total_seconds / other
        updated_pace_minutes = int(divided_seconds // 60)
        updated_pace_seconds = int(divided_seconds % 60)
        return Pace(time=f"{updated_pace_minutes}:{updated_pace_seconds:02}",
                    unit=self.unit)






