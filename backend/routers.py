from fastapi import APIRouter, Query
from . import calcs
from .models import workout_paces
from typing import Literal, Annotated
router = APIRouter()

@router.get("/race_pace")
def race_pace(finish_time: Annotated[str | None, Query(pattern="^[^:]*(:[^:]*:?[^:]*|[^:]*:)$")] = "3:00:00",
              unit: Annotated[Literal["mi", "km"], "pace units in km or mi"] = "mi",
              distance: Annotated[Literal["5K", "10K", "Half Marathon", "Marathon"], "race distance"] = "Marathon"):
    if unit == "km":
        distance = calcs.KM_DISTANCES[distance]
    elif unit == "mi":
        distance = calcs.convert_units(calcs.KM_DISTANCES[distance], "mi")
    total_time_seconds = calcs.parse_hhmmss_into_seconds(finish_time)
    pace_seconds = calcs.get_pace(total_time_seconds, distance)
    h, m, s = calcs.get_hms(pace_seconds)
    formatted_pace =  f"{m}:{s:02}"
    return {"pace": formatted_pace}

@router.get("/race_time")
def race_time(pace: Annotated[str | None, Query(pattern="^[^:]*(:[^:]*:?[^:]*|[^:]*:)$")] = "6:30",
              unit: Annotated[Literal["mi", "km"], "pace units in km or mi"] = "mi",
              distance: Annotated[Literal["5K", "10K", "Half Marathon", "Marathon"], "race distance"] = "Marathon"):
    
    if unit == "km":
        distance = calcs.KM_DISTANCES[distance]
    elif unit == "mi":
        distance = calcs.convert_units(calcs.KM_DISTANCES[distance], "mi")
    pace_time_seconds = calcs.parse_hhmmss_into_seconds(pace)
    total_seconds = calcs.get_time(pace_time_seconds, distance)
    h, m, s = calcs.get_hms(total_seconds)
    if h > 0:
        formatted_time = f"{h}:{m:02}:{s:02}"
    else:
        formatted_time = f"{m:02}:{s:02}"
    return {"time": formatted_time}

@router.get("/pfitz_long_run_pace")
def pfitz_long_run_pace(distance: Annotated[int, "distance of long run"] = 15,
                        marathon_pace: Annotated[str | None, Query(pattern="^[^:]*(:[^:]*:?[^:]*|[^:]*:)$")] = "6:30",
                        unit: Annotated[Literal["mi", "km"], "pace units in km or mi"] = "mi"):
    m_pace = Pace(time=marathon_pace, unit=unit)
    result = calcs.pfitz_long_run_pace(distance, m_pace)
    return result

@router.get("/heart_rate_zones")
def heart_rate_zones(max_heart_rate: Annotated[int, "maximum heart rate"] = 185):
    zones = calcs.heart_rate_zones(max_heart_rate)
    return zones

@router.get("/pace_percentage")
def pace_percentage(pace: Annotated[str | None, Query(pattern="^[^:]*(:[^:]*:?[^:]*|[^:]*:)$")] = "6:00",
              method: Annotated[Literal["pace", "speed"], "calculation method"] = "pace",
              percentage: Annotated[int, "percentage"] = 95):
    total_time_seconds = calcs.parse_hhmmss_into_seconds(pace)
    if method == "pace":
        updated_pace = calcs.percentage_of_pace(total_time_seconds, percentage * 0.01)
    elif method == "speed":
        updated_pace = calcs.percentage_of_speed(total_time_seconds, percentage * 0.01)
    h, m, s = calcs.get_hms(updated_pace)
    formatted_pace =  f"{m}:{s:02}"
    return {"pace": formatted_pace}

@router.get("/pace_workouts")
def pace_workouts(pace: Annotated[str | None, Query(pattern="^[^:]*(:[^:]*:?[^:]*|[^:]*:)$")] = "6:00",
                  method: Annotated[Literal["pace", "speed"], "calculation method"] = "pace"):
    total_time_seconds = calcs.parse_hhmmss_into_seconds(pace)
    buffer = 2 # +- 2 second range around percentage of pace
    if method == "pace":
        update_pace = calcs.percentage_of_pace
    elif method == "speed":
        update_pace = calcs.percentage_of_speed
    paces = []
    for p in workout_paces:
        percentage = p["Percentage of Pace"]
        new_pace = update_pace(total_time_seconds, percentage * 0.01)
        pace_floor = new_pace - buffer
        pace_ceil = new_pace + buffer
        h, m, s = calcs.get_hms(pace_floor)
        formatted_pace_floor = f"{m}:{s:02}"
        h, m, s = calcs.get_hms(pace_ceil)
        formatted_pace_ceil = f"{m}:{s:02}"
        p["Pace"] = f"{formatted_pace_floor} to {formatted_pace_ceil}"
        paces.append(p)
    return {"workout_paces": paces}

@router.get("/")
def read_root():
    return {"text": "Marathon Training Planner"}

