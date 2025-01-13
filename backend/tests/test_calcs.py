from .. import calcs
from datetime import timedelta
def test_convert_seconds_to_hours_minutes_seconds():
    result = calcs.format_time_delta(timedelta(seconds=3700))
    assert result == '1:01:40'

    result = calcs.format_time_delta(timedelta(seconds=71))
    assert result == '1:11'

def test_parse_hhmmss_into_seconds():
    seconds= calcs.parse_str_time('24:35').total_seconds()
    assert seconds == 24*60 + 35
    seconds= calcs.parse_str_time('3:24:35').total_seconds()
    assert seconds == 3*3600+24*60 + 35

def test_percentage_of_speed():
    p = calcs.percentage_of_speed(timedelta(seconds=600), 0.95)
    assert p.total_seconds() == 632

def test_percentage_of_pace():
    p = calcs.percentage_of_pace(timedelta(seconds=600), 0.95)
    assert p.total_seconds() == 630

def test_pfitz_long_run_pace():
    paces = calcs.pfitz_long_run_pace(15,"mi", timedelta(seconds=360))
    assert paces[0]['mi'] == 1
    assert paces[0]['Target Pace'] == '7:08 to 7:12'