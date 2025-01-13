from typing import Literal
from datetime import timedelta, datetime, date

KM_DISTANCES = {
    '5K': 5,
    '10K': 10,
    'Half Marathon': 21.0975,
    'Marathon': 42.195
}

def format_time_delta(td: timedelta) -> str:
    seconds = int(td.total_seconds())
    hours = seconds // 3600
    minutes = (seconds % 3600) // 60
    seconds = seconds % 60
    if hours > 0:
        return f"{hours}:{minutes:02}:{seconds:02}"
    return f"{minutes}:{seconds:02}"

def parse_str_time(str_time: str) -> timedelta:
    for f in ["%H:%M:%S", "%M:%S"]:
        try:
            dt = datetime.strptime(str_time, f)
            td = datetime.combine(date.min, dt.time()) - datetime.min
            return td
        except ValueError:
            continue
    raise ValueError

def convert_to_mi(distance: float) -> float:
    return distance * 0.621

def convert_to_km(distance: float) -> float:
    return distance * 1.609

def percentage_of_speed(pace_time: timedelta, percentage: float) -> timedelta:
    # https://runningwritings.com/2013/02/brief-thoughts-calculating-percentages.html
    # "a linear change in speed(in m/s) for each incremental change in percent"
    pace_time_seconds = pace_time.total_seconds()
    updated_pace_seconds = int(round(pace_time_seconds / percentage, 0))
    return timedelta(seconds=updated_pace_seconds)

def percentage_of_pace(pace_time: timedelta, percentage: float) -> timedelta:
    # https://runningwritings.com/2013/02/brief-thoughts-calculating-percentages.html
    # "for every incremental change in the percentage, the running pace, in minutes per mile,
    #  changes by a consistent amount"
    pace_time_seconds = pace_time.total_seconds()
    updated_pace_seconds = int(round((pace_time_seconds * (1 + (1-percentage))), 0))
    return timedelta(seconds=updated_pace_seconds)

def get_pace(time: timedelta,
             distance: int) -> timedelta:
    return time / distance

def get_time(pace: timedelta,
             distance: int) -> timedelta:
    return pace * distance

def pfitz_long_run_pace(distance: int,
                        unit: str,
                        marathon_pace: timedelta) -> list:
    # linear increase from 20% to 10% slower than goal marathon pace
    # calculating percentage of pace
    lower_bound = percentage_of_pace(marathon_pace, 0.8).total_seconds()
    upper_bound = percentage_of_pace(marathon_pace, 0.9).total_seconds()
    step_size = (lower_bound - upper_bound) // distance
    paces = []
    for i in range(1, distance + 1):
        lower_bound -= step_size
        lower_target = lower_bound - 2
        upper_target = lower_bound + 2
        lower_target_pace = format_time_delta(timedelta(seconds=lower_target))
        upper_target_pace = format_time_delta(timedelta(seconds=upper_target))
        paces.append(
            {
                f"{unit}": i,
                "Target Pace": f"{lower_target_pace} to {upper_target_pace}"
            }
        )
    return paces

def heart_rate_zones(max_heart_rate: int) -> list:
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