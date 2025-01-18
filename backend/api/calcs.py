from datetime import timedelta, datetime, date
import math

DISTANCES = {
    '800M': 800,
    '1600M': 1600,
    '5K': 5000,
    '10K': 10000,
    'Half Marathon': 21097.5,
    'Marathon': 42195
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

def convert_to_mi_pace(pace: timedelta) -> timedelta:
    return pace / 0.621

def convert_to_km_pace(pace: timedelta) -> timedelta:
    return pace / 1.609

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
             distance: float) -> timedelta:
    return time / distance

def get_time(pace: timedelta,
             distance: float) -> timedelta:
    return pace * distance

def pfitz_long_run_pace(distance: float,
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

# https://github.com/tlgs/vdot/blob/master/notebooks/1-basics.ipynb
def get_vdot(distance_in_meters:int, time:timedelta) -> float:
    d = distance_in_meters
    t = time.total_seconds() / 60 # minutes
    v = d / t
    vo2 = -4.6 + 0.182258 * v + 0.000104 * v**2
    pct = 0.8 + 0.1894393 * math.exp(-0.012778 * t) + 0.2989558 * math.exp(-0.1932605 * t)
    vdot = round(vo2 / pct, 1)
    return vdot

def get_training_paces(vdot: float) -> dict:
# credit here for doing the legwork of researching how different sources derive the
# training paces as % of vdot 
# https://github.com/tlgs/vdot/blob/master/notebooks/2-analysis.ipynb
    training_pace_pcts = {
        "Easy (lower)": 0.6304,
        "Easy (upper)": 0.7346,
        "Marathon": 0.8251,
        "Threshold": 0.8799,
        "Interval": 0.9743,
        "Repetitions": 1.089
    }
    training_paces = {}
    for name, pct in training_pace_pcts.items():
        v = get_vdot_pace(vdot, pct)  # meters/min
        pace = 1000 / v # min/km
        formatted_pace = format_time_delta(timedelta(minutes=pace))
        training_paces[name] = formatted_pace
    return training_paces

def get_vdot_pace(vdot: float, percentage:float) -> float:
    return (
            -0.182258 + math.sqrt(0.033218 - 0.000416 * (-4.6 - (vdot * percentage)))
        ) / 0.000208