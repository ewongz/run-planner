from .models import Pace
from sys import argv
from typing import Literal, Annotated


KM_DISTANCES = {
    '5K': 5,
    '10K': 10,
    'Half Marathon': 21.0975,
    'Marathon': 42.195
}

def convert_units(distance: float, unit: Literal["km", "mi"]):
    if unit == 'km':
        return distance * 1.609
    elif unit == 'mi':
        return distance * 0.621

def percentage_of_speed(pace: Pace, percentage: float):
    # https://runningwritings.com/2013/02/brief-thoughts-calculating-percentages.html
    # "a linear change in speed(in m/s) for each incremental change in percent"
    minutes = int(pace.time.split(':')[0])
    seconds = int(pace.time.split(':')[1])
    total_seconds = minutes * 60 + seconds
    updated_pace_minutes = int(((total_seconds / percentage) // 60))
    updated_pace_seconds = int(((total_seconds / percentage) % 60))
    pace_params = {
        "time": f"{updated_pace_minutes}:{updated_pace_seconds:02}",
        "unit": pace.unit
    }
    new_pace = Pace(**pace_params)
    return new_pace

def percentage_of_pace(pace: Pace, percentage: float):
    # https://runningwritings.com/2013/02/brief-thoughts-calculating-percentages.html
    # "for every incremental change in the percentage, the running pace, in minutes per mile,
    #  changes by a consistent amount"
    minutes = int(pace.time.split(':')[0])
    seconds = int(pace.time.split(':')[1])
    total_seconds = minutes * 60 + seconds
    updated_pace_minutes = int(((total_seconds * (1 + (1-percentage))) // 60))
    updated_pace_seconds = int(((total_seconds * (1 + (1-percentage))) % 60))
    pace_params = {
        "time": f"{updated_pace_minutes}:{updated_pace_seconds:02}",
        "unit": pace.unit
    }
    new_pace = Pace(**pace_params)
    return new_pace

def get_pace(finish_time: str,
             unit: str,
             distance: int):
    parsed_time = finish_time.split(":")
    total_seconds = int(parsed_time[0]) * 3600 + int(parsed_time[1]) * 60 + int(parsed_time[2])
    pace = total_seconds / distance
    pace_minutes = int(pace // 60)
    pace_seconds = int(pace % 60)
    pace_params = {
        "time": f"{pace_minutes}:{pace_seconds:02}",
        "unit": unit
    }
    return Pace(**pace_params)

def get_time(pace: Pace,
             distance: int):
    parsed_time = pace.time.split(":")
    if len(parsed_time) > 2:
        total_pace_seconds = int(parsed_time[0]) * 3600 + int(parsed_time[1]) * 60 + int(parsed_time[2])
    else:
        total_pace_seconds = int(parsed_time[0]) * 60 + int(parsed_time[1])
    total_time_seconds = int(total_pace_seconds * distance)
    hours = int(total_time_seconds // 3600)
    minutes = int((total_time_seconds - (hours * 3600)) // 60)
    seconds = int(total_pace_seconds % 60)
    if hours > 0:
        total_time = f"{hours}:{minutes}:{seconds}"
    elif minutes > 0:
        total_time = f"{minutes:02}:{seconds:02}"
    else:
        total_time = f"{seconds}"
    return total_time

def pfitz_long_run_pace(distance: int, marathon_pace:Pace):
    # linear increase from 20% to 10% slower than goal marathon pace
    # calculating percentage of pace
    lower_bound = percentage_of_pace(marathon_pace, 0.8)
    upper_bound = percentage_of_pace(marathon_pace, 0.9)
    step_size = (upper_bound - lower_bound) // distance
    paces = []
    for i in range(1, distance + 1):
        lower_bound -= step_size
        lower_target = lower_bound - 5
        upper_target = lower_bound + 5
        paces.append(
            {
                f"{marathon_pace.unit}": i,
                "Target Pace": f"{lower_target.time} to {upper_target.time}"
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


