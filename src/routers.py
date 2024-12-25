from fastapi import APIRouter
from src import calcs
from src.models import MarathonTime, Pace
from typing import Literal
router = APIRouter()

@router.post("/marathon_pace")
def get_marathon_pace(time: MarathonTime, unit: Literal["mi", "km"]):
    str_time = f"{time.hours:02}:{time.minutes:02}:{time.seconds:02}"
    result = calcs.marathon_pace(str_time, unit) 
    return result


@router.post("/pfitz_long_run_pace")
def get_pfitz_pace(marathon_pace: Pace, distance: int):
    result = calcs.pfitz_long_run_paces(distance, marathon_pace)
    return result

