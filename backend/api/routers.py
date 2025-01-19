from fastapi import APIRouter, Query, Depends, status
from typing import Literal, Annotated
from api import calcs
from api.models import Workout
from api.schemas import WorkoutCreate, WorkoutResponse
from api.core.database import get_session, fetch_all, fetch_one, execute
from api.core.exceptions import NotFoundException
from api.core.logging import get_logger
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError
from sqlalchemy import select, delete

logger = get_logger(__name__)
router = APIRouter()

@router.get("/race_pace")
def race_pace(finish_time: Annotated[str | None, Query(pattern="^[^:]*(:[^:]*:?[^:]*|[^:]*:)$")] = "20:00",
              unit: Annotated[Literal["mi", "km"], "pace units in km or mi"] = "mi",
              distance: Annotated[float, "race distance in unit"] = 3):
    parsed_time = calcs.parse_str_time(finish_time)
    pace = calcs.get_pace(parsed_time, distance)
    formatted_pace =  calcs.format_time_delta(pace)
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

@router.get("/vdot")
def vdot(distance: Annotated[float, "race distance in meters"] = 5000,
         time: Annotated[str | None, Query(pattern="^[^:]*(:[^:]*:?[^:]*|[^:]*:)$")] = "20:00"):
    time = calcs.parse_str_time(time)
    vdot = calcs.get_vdot(distance, time)
    return {"vdot": vdot}

@router.get("/vdot_paces")
def vdot_paces(vdot: float,
               unit: Annotated[Literal["mi", "km"], "pace units in km or mi"] = "mi"):
    training_paces = calcs.get_training_paces(vdot)
    if unit == "mi":
        for name, pace in training_paces.items():
            parsed = calcs.parse_str_time(pace)
            converted_pace = calcs.convert_to_mi_pace(parsed)
            formatted_pace = calcs.format_time_delta(converted_pace)
            training_paces[name] = formatted_pace
    return {"training_paces": training_paces}

@router.post("/create_workout", response_model=WorkoutResponse,
             response_model_exclude_unset=True)
async def create_workout(workout_data: WorkoutCreate,
                         session: AsyncSession=Depends(get_session)):
    """Create a new workout.
    Args:
        workout_data: Workout creation data
    Returns:
        Workout: Created Workout
    """
    workout = Workout(**workout_data.model_dump())
    try:
        session.add(workout)
        await session.commit()
        await session.refresh(workout)
        return workout
    except IntegrityError:
        await session.rollback()
        raise

@router.get("/get_workouts")
async def get_all_workouts():
    """Get all workouts"""
    try:
        result = await fetch_all(select_query=select(Workout))
        if len(result) > 1:
            return result
        else:
            return []
    except Exception as e:
        logger.error(f"Failed to fetch workouts: {str(e)}")

@router.get("/{workout_id}", response_model=WorkoutResponse)
async def get_workout(
    workout_id: int,
    session: AsyncSession=Depends(get_session))-> WorkoutResponse:
    """Get workout by ID."""
    logger.debug(f"Fetching workout {workout_id}")
    try:
        workout = await fetch_one(
            select_query=select(Workout).where(Workout.id == workout_id)
        )
        if not workout:
            raise NotFoundException(f"Workout with id {workout_id} not found")
        return workout
    except Exception as e:
        logger.error(f"Failed fetch workout id {workout_id}: {str(e)}")
        raise

@router.delete("/{workout_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_workout(
    workout_id: int,
    session: AsyncSession=Depends(get_session)
) -> None:
    """Delete workout by ID."""
    logger.debug(f"Deleting workout {workout_id}")
    query = delete(Workout).where(Workout.id == workout_id)
    result = await session.execute(query)
    if result.rowcount == 0:
        raise NotFoundException(f"Workout with id {workout_id} not found")
    await session.commit()