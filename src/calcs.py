from src.models import Pace
from sys import argv

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

def marathon_pace(finish_time: str, unit: str):
    if unit == 'km':
        distance = 42.195
    elif unit == 'mi':
        distance = 26.2188
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

def pfitz_long_run_paces(distance: int, marathon_pace:Pace):
    # linear increase from 20% to 10% slower than goal marathon pace
    # calculating percentage of pace
    lower_bound = percentage_of_pace(marathon_pace, 0.8)
    upper_bound = percentage_of_pace(marathon_pace, 0.9)
    step_size = (upper_bound - lower_bound) // distance
    for i in range(1, distance + 1):
        lower_bound -= step_size
        print(f"mile {i} {lower_bound}")

if __name__ == "__main__":
    m_pace = marathon_pace(argv[1], argv[2])
    pfitz_long_run_paces(14, m_pace)






