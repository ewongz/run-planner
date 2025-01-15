import React, {useState} from "react";
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';



{/* Dropdown to select a race type */}
export function RaceDistanceSelection(initialValue: string) {
    const [raceDistance, setRaceDistance] = useState<string>("Marathon");
    const distances = [
        {
          value: '800M',
          label: '800M'
        },
        {
          value: '1600M',
          label: '1600M'
        },
        {
          value: '5K',
          label: '5K'
        },
        {
          value: '10K',
          label: '10K'
        },
        {
          value: 'Half Marathon',
          label: 'Half Marathon'
        },
        {
          value: 'Marathon',
          label: 'Marathon'
        }
      ]
    return (<FormControl sx={{ m:1, minWidth:250 }}>
                <TextField
                id="race-distance-select"
                select
                label="Select a Race Distance"
                value={raceDistance}
                onChange={(e) => setRaceDistance(e.target.value)} // Trigger data fetch on change
                >
                {
                    distances.map(
                    (option) => (
                        <MenuItem key={option.value} value={option.value}>
                        {option.label}
                        </MenuItem>
                    ))
                }
                </TextField>
            </FormControl>
    );
}

  



