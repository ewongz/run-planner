from .. import calcs

def test_convert_seconds_to_hours_minutes_seconds():
    h, m, s = calcs.get_hms(3700)
    assert h == 1
    assert m == 1
    assert s == 40

    h, m, s = calcs.get_hms(71)
    assert h == 0
    assert m == 1
    assert s == 11

def test_parse_hhmmss_into_seconds():
    seconds= calcs.parse_hhmmss_into_seconds('24:35')
    assert seconds == 24*60 + 35
    seconds= calcs.parse_hhmmss_into_seconds('3:24:35')
    assert seconds == 3*3600+24*60 + 35

def test_percentage_of_speed():
    p = calcs.percentage_of_speed(600, 0.95)
    assert p == 632

def test_percentage_of_pace():
    p = calcs.percentage_of_pace(600, 0.95)
    assert p == 630

def test_pfitz_long_run_pace():
    paces = calcs.pfitz_long_run_pace(15,"mi", 360)
    assert paces[0]['mi'] == 1
    assert paces[0]['Target Pace'] == '7:10 to 7:20'



