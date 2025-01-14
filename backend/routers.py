from fastapi import APIRouter, Query
from . import calcs
from .models import workout_paces, WorkoutBlock
from typing import Literal, Annotated
import uuid
router = APIRouter()

@router.get("/race_pace")
def race_pace(finish_time: Annotated[str | None, Query(pattern="^[^:]*(:[^:]*:?[^:]*|[^:]*:)$")] = "20:00",
              unit: Annotated[Literal["mi", "km"], "pace units in km or mi"] = "mi",
              distance: Annotated[float, "race distance in meters"] = 5000):
    parsed_time = calcs.parse_str_time(finish_time)
    pace = calcs.get_pace(parsed_time, distance / 1000) # seconds/km
    if unit == "mi":
        pace = calcs.convert_to_mi_pace(pace)
    formatted_pace =  calcs.format_time_delta(pace) # mm:ss/km
    return {"pace": formatted_pace}

@router.get("/race_time")
def race_time(pace: Annotated[str | None, Query(pattern="^[^:]*(:[^:]*:?[^:]*|[^:]*:)$")] = "6:30",
              unit: Annotated[Literal["mi", "km"], "pace units in km or mi"] = "mi",
              distance: Annotated[float, "race distance in meters"] = 5000):
    parsed_time = calcs.parse_str_time(pace)
    if unit == "mi":
        distance = distance * 0.621
    total_time = calcs.get_time(parsed_time, distance / 1000)
    formatted_time = calcs.format_time_delta(total_time)
    return {"time": formatted_time}

@router.get("/pfitz_long_run_pace")
def pfitz_long_run_pace(distance: Annotated[float, "distance of long run"] = 15,
                        marathon_pace: Annotated[str | None, Query(pattern="^[^:]*(:[^:]*:?[^:]*|[^:]*:)$")] = "6:30",
                        unit: Annotated[Literal["mi", "km"], "pace units in km or mi"] = "mi"):
    m_pace = calcs.parse_str_time(marathon_pace)
    result = calcs.pfitz_long_run_pace(distance, unit, m_pace)
    return result

@router.get("/heart_rate_zones")
def heart_rate_zones(max_heart_rate: Annotated[int, "maximum heart rate"] = 185):
    zones = calcs.heart_rate_zones(max_heart_rate)
    return zones

@router.get("/pace_percentage")
def pace_percentage(pace: Annotated[str | None, Query(pattern="^[^:]*(:[^:]*:?[^:]*|[^:]*:)$")] = "6:00",
              method: Annotated[Literal["pace", "speed"], "calculation method"] = "pace",
              percentage: Annotated[int, "percentage"] = 95):
    total_time = calcs.parse_str_time(pace)
    if method == "pace":
        updated_pace = calcs.percentage_of_pace(total_time, percentage * 0.01)
    elif method == "speed":
        updated_pace = calcs.percentage_of_speed(total_time, percentage * 0.01)
    formatted_pace =  calcs.format_time_delta(updated_pace)
    return {"pace": formatted_pace}

@router.get("/pace_workouts")
def pace_workouts(pace: Annotated[str | None, Query(pattern="^[^:]*(:[^:]*:?[^:]*|[^:]*:)$")] = "6:00",
                  method: Annotated[Literal["pace", "speed"], "calculation method"] = "pace"):
    parsed_pace= calcs.parse_str_time(pace)
    if method == "pace":
        update_pace = calcs.percentage_of_pace
    elif method == "speed":
        update_pace = calcs.percentage_of_speed
    paces = []
    for p in workout_paces:
        percentage = p["Percentage of Pace"]
        new_pace = update_pace(parsed_pace, percentage * 0.01)
        formatted_pace = calcs.format_time_delta(new_pace)
        p["Pace"] = formatted_pace
        paces.append(p)
    return {"workout_paces": paces}

@router.get("/convert_pace")
def convert_pace(pace: Annotated[str | None, Query(pattern="^[^:]*(:[^:]*:?[^:]*|[^:]*:)$")] = "6:00",
                 target_unit: Annotated[Literal["mi", "km"], "pace units in km or mi"] = "mi"):
    parsed_pace = calcs.parse_str_time(pace)
    if target_unit == "mi":
        converted_pace = calcs.convert_to_mi_pace(parsed_pace)
    else:
        converted_pace = calcs.convert_to_km_pace(parsed_pace)
    formatted_pace = calcs.format_time_delta(converted_pace)
    return {"pace": formatted_pace}

@router.post("/build_workout")
def build_workout(workout_block: WorkoutBlock):
    pace = workout_block.pace
    time = workout_block.time
    distance = workout_block.distance
    if time:
        h, m, s = calcs.get_hms(time)
        estimated_time = f"{h}:{m:02}:{s:02}"
    elif pace:
        pace_time_seconds = calcs.parse_hhmmss_into_seconds(pace)
        estimated_time_seconds = distance * pace_time_seconds
        h, m, s = calcs.get_hms(estimated_time_seconds)
        estimated_time = f"{h}:{m:02}:{s:02}"
    return {"estimated_time": estimated_time}
