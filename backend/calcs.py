from .models import Pace
from sys import argv
from typing import Literal, Annotated


KM_DISTANCES = {
    '5K': 5,
    '10K': 10,
    'Half Marathon': 21.0975,
    'Marathon': 42.195
}

def get_hms(seconds: int) -> int:
    hours = seconds // 3600
    minutes = (seconds % 3600) // 60
    seconds = seconds % 60
    return hours, minutes, seconds

def parse_hhmmss_into_seconds(time_str:str) -> int:
    parsed = time_str.split(":")
    if len(parsed) > 2:
        hours = int(parsed[0])
        minutes = int(parsed[1])
        seconds = int(parsed[2])
    else:
        hours = 0
        minutes = int(parsed[0])
        seconds = int(parsed[1])
    total_seconds = hours * 3600 + minutes * 60 + seconds
    return total_seconds

def convert_units(distance: float, unit: Literal["km", "mi"]) -> float:
    if unit == 'km':
        return distance * 1.609
    elif unit == 'mi':
        return distance * 0.621

def percentage_of_speed(pace_time_seconds: int, percentage: float) -> int:
    # https://runningwritings.com/2013/02/brief-thoughts-calculating-percentages.html
    # "a linear change in speed(in m/s) for each incremental change in percent"
    updated_pace_seconds = int(round(pace_time_seconds / percentage, 0))
    return updated_pace_seconds

def percentage_of_pace(pace_time_seconds: int, percentage: float) -> int:
    # https://runningwritings.com/2013/02/brief-thoughts-calculating-percentages.html
    # "for every incremental change in the percentage, the running pace, in minutes per mile,
    #  changes by a consistent amount"
    updated_pace_seconds = int(round((pace_time_seconds * (1 + (1-percentage))), 0))
    return updated_pace_seconds

def get_pace(seconds: int,
             distance: int) -> int:
    pace = int(round(seconds / distance, 0))
    return pace

def get_time(pace_time_seconds: int,
             distance: int) -> int:
    total_time_seconds = int(round(pace_time_seconds * distance, 0))
    return total_time_seconds

def pfitz_long_run_pace(distance: int,
                        unit: str,
                        marathon_pace_seconds: int) -> int:
    # linear increase from 20% to 10% slower than goal marathon pace
    # calculating percentage of pace
    lower_bound = percentage_of_pace(marathon_pace_seconds, 0.8)
    upper_bound = percentage_of_pace(marathon_pace_seconds, 0.9)
    step_size = (upper_bound - lower_bound) // distance
    paces = []
    for i in range(1, distance + 1):
        lower_bound -= step_size
        lower_target = lower_bound - 5
        upper_target = lower_bound + 5
        hour, minute, second = get_hms(lower_target)
        lower_target_pace = f"{minute}:{second:02}"
        hour, minute, second = get_hms(upper_target)
        upper_target_pace = f"{minute}:{second:02}"
        paces.append(
            {
                f"{unit}": i,
                "Target Pace": f"{lower_target_pace} to {upper_target_pace}"
            }
        )
    return paces

def heart_rate_zones(max_heart_rate: int):
    """
    Five Heart Rate Zones
    Zone	Intensity	% of HRmax	Purpose
    Zone 1	Very Light	50%–60% of HRmax	Recovery, warm-ups, cool-downs
    Zone 2	Light	65%–75% of HRmax	Fat burning, endurance building
    Zone 3	Moderate	83%–87% of HRmax	Aerobic capacity, improved stamina
    Zone 4	Hard	89%–94% of HRmax	Increased speed and performance
    Zone 5	Maximum/Very Hard	95%–98% of HRmax	Peak effort, anaerobic po
    """
    hr_calc = {
        1: (0.5, 0.6),
        2: (0.65, 0.75),
        3: (0.83, 0.87),
        4: (0.89, 0.94),
        5: (0.95, 0.98) 
    }
    zones = {}
    for zone, hr_calc in hr_calc.items():
        zones[zone] = (
            int(round(max_heart_rate * hr_calc[0], 0)),
            int(round(max_heart_rate * hr_calc[1], 0))
        )
    return zones


