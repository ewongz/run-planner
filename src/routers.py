from fastapi import APIRouter, Query
from src import calcs
from src.models import Pace
from typing import Literal, Annotated
router = APIRouter()

@router.get("/race_pace")
def race_pace(finish_time: Annotated[str | None, Query(pattern="^[^:]*(:[^:]*:?[^:]*|[^:]*:)$")] = "3:00:00",
              unit: Annotated[Literal["mi", "km"], "pace units in km or mi"] = "mi",
              distance: Annotated[Literal["5k", "10k", "Half Marathon", "Marathon"], "race distance"] = "Marathon"):
    if unit == "km":
        distance = calcs.KM_DISTANCES[distance]             
    elif unit == "mi":
        distance = calcs.convert_units(calcs.KM_DISTANCES[distance], "mi")
    if finish_time.count(":") == 1:
        # zero pad the hour if it's missing
        finish_time = f"0:{finish_time}"
    result = calcs.get_pace(finish_time, unit, distance) 
    return {"pace": result.time}


@router.get("/pfitz_long_run_pace")
def pfitz_long_run_pace(distance: Annotated[int, "distance of long run"] = 15,
                        marathon_pace: Annotated[str | None, Query(pattern="^[^:]*(:[^:]*:?[^:]*|[^:]*:)$")] = "6:30",
                        unit: Annotated[Literal["mi", "km"], "pace units in km or mi"] = "mi"):
    m_pace = Pace(time=marathon_pace, unit=unit)
    result = calcs.pfitz_long_run_pace(distance, m_pace)
    return result

